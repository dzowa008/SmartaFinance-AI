
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from "@google/genai";
import { BotIcon, UserIcon, StopCircleIcon } from './Icons';

interface LiveAssistantProps {
    onClose: () => void;
}

type Status = 'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'ERROR';
type TranscriptionEntry = {
    id: number;
    sender: 'user' | 'ai';
    text: string;
};

// --- Manual Base64 and Audio Decoding Functions (as per guidelines) ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose }) => {
    const [status, setStatus] = useState<Status>('IDLE');
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const addOrUpdateTranscription = (sender: 'user' | 'ai', text: string, isFinal: boolean) => {
        setTranscriptionHistory(prev => {
            const lastEntry = prev[prev.length - 1];
            if (lastEntry && lastEntry.sender === sender && !isFinal) {
                // Update the last entry
                const updatedHistory = [...prev];
                updatedHistory[prev.length - 1] = { ...lastEntry, text: lastEntry.text + text };
                return updatedHistory;
            } else {
                // Add a new entry
                return [...prev, { id: Date.now(), sender, text }];
            }
        });
    };

    const startConversation = useCallback(async () => {
        setStatus('CONNECTING');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
                callbacks: {
                    onopen: () => {
                        setStatus('LISTENING');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                             addOrUpdateTranscription('user', message.serverContent.inputTranscription.text, false);
                         }
                        
                         if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                             addOrUpdateTranscription('ai', message.serverContent.outputTranscription.text, false);
                         }
                        
                        if (message.serverContent?.turnComplete) {
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            setStatus('SPEAKING');
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
                            
                            const source = outputAudioContextRef.current!.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current!.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            playingSourcesRef.current.add(source);
                            source.onended = () => {
                                playingSourcesRef.current.delete(source);
                                if (playingSourcesRef.current.size === 0) {
                                    setStatus('LISTENING');
                                }
                            };
                        }
                        if (message.serverContent?.interrupted) {
                            for (const source of playingSourcesRef.current.values()) {
                                source.stop();
                            }
                            playingSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setStatus('LISTENING');
                        }
                    },
                    onerror: (e) => { console.error('Live session error:', e); setStatus('ERROR'); },
                    onclose: () => { console.log('Live session closed.'); },
                },
            });

        } catch (error) {
            console.error('Failed to start conversation:', error);
            setStatus('ERROR');
        }
    }, []);

    const stopConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        onClose();
    }, [onClose]);

    useEffect(() => {
        startConversation();
        return () => stopConversation();
    }, [startConversation, stopConversation]);

    const statusText: { [key in Status]: string } = {
        IDLE: 'Idle',
        CONNECTING: 'Connecting...',
        LISTENING: 'Listening...',
        SPEAKING: 'AI is speaking...',
        ERROR: 'An error occurred. Please try again.'
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg w-full max-w-2xl h-[80vh] flex flex-col">
                <header className="p-4 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-heading">Live AI Assistant</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${status === 'LISTENING' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{statusText[status]}</span>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {transcriptionHistory.map((entry) => (
                        <div key={entry.id} className={`flex items-start gap-4 ${entry.sender === 'user' ? 'justify-end' : ''}`}>
                            {entry.sender === 'ai' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-soft-green-500 flex items-center justify-center text-white"><BotIcon className="h-5 w-5" /></div>}
                            <div className={`max-w-md p-3 rounded-2xl ${entry.sender === 'user' ? 'bg-navy-700 text-white rounded-br-none' : 'bg-slate-100 dark:bg-navy-800 rounded-bl-none'}`}>
                                <p className="text-sm">{entry.text}</p>
                            </div>
                            {entry.sender === 'user' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 dark:bg-navy-700 flex items-center justify-center"><UserIcon className="h-5 w-5" /></div>}
                        </div>
                     ))}
                </div>
                <footer className="p-4 border-t border-slate-200 dark:border-navy-800">
                     <button 
                        onClick={stopConversation}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                    >
                        <StopCircleIcon className="h-6 w-6" />
                        End Conversation
                    </button>
                </footer>
            </div>
        </div>
    );
};
