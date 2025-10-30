import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFinancialData } from '../services/geminiService';
import { Transaction, ChatMessage, Bill, SavingsGoal, RecurringExpense } from '../types';
import { SendIcon, UploadIcon, BotIcon, UserIcon, MicrophoneIcon } from './Icons';
import { marked } from 'marked';

// Cast window to any to access non-standard SpeechRecognition properties
// Check for browser support for Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

interface ChatAssistantProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addBill: (bill: Omit<Bill, 'id' | 'type' | 'status'>) => void;
  monthlyIncome: number;
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
    transactions, setTransactions, addBill,
    monthlyIncome, savingsGoals, recurringExpenses
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: "Hello! I'm your SmartFinance AI Assistant. You can ask me questions or give me commands with your voice. How can I help?", sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
    };
    recognitionRef.current.onerror = (event: any) => console.error('Speech recognition error:', event.error);
    recognitionRef.current.onend = () => setIsListening(false);
    
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').slice(1);
        const newTransactions: Transaction[] = rows.map((row, index) => {
          const [date, description, category, amount, type] = row.split(',');
          if (!date || !description || !amount || !type) throw new Error(`Invalid data in row ${index + 2}`);
          return { id: `csv-${Date.now()}-${index}`, date, description, category: category || 'Uncategorized', amount: parseFloat(amount), type: type.toLowerCase() as 'income' | 'expense' };
        }).filter(t => t.date && t.description && !isNaN(t.amount));
        setTransactions(prev => [...prev, ...newTransactions]);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `Successfully imported ${newTransactions.length} transactions. You can now ask me to analyze them!`, sender: 'ai' }]);
      } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `I had trouble reading that CSV file. Please ensure columns are: \`date,description,category,amount,type\`. Error: ${(error as Error).message}`, sender: 'ai' }]);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleSendMessage = useCallback(async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const financialContext = { transactions, savingsGoals, recurringExpenses, monthlyIncome };
      const aiResponse = await analyzeFinancialData(text, financialContext);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse.text, sender: 'ai' }]);
      if (aiResponse.functionCall?.name === 'scheduleBillPayment') {
        const { name, amount, dueDate } = aiResponse.functionCall.args;
        addBill({ name, amount, dueDate });
        setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), text: `I've scheduled the payment for **${name}** for **$${amount}** due on **${dueDate}**. You can approve it in the Bill Pay Center.`, sender: 'ai' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "I'm sorry, an unexpected error occurred. Please try again.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, transactions, addBill, monthlyIncome, recurringExpenses, savingsGoals]);

  const parsedHtml = (text: string) => ({ __html: marked(text, { breaks: true }) });

  return (
    <div className="h-[calc(100vh-165px)] md:h-[calc(100vh-120px)] flex flex-col max-w-4xl mx-auto bg-card text-card-foreground rounded-xl border border-border">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
            {message.sender === 'ai' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><BotIcon className="h-5 w-5" /></div>}
            <div className={`max-w-md md:max-w-lg lg:max-w-xl p-4 rounded-2xl ${message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-accent text-accent-foreground rounded-bl-none'}`}><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={parsedHtml(message.text)} /></div>
            {message.sender === 'user' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground"><UserIcon className="h-5 w-5" /></div>}
          </div>
        ))}
         {isLoading && <div className="flex items-start gap-4"><div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><BotIcon className="h-5 w-5" /></div><div className="p-4 rounded-2xl bg-accent rounded-bl-none"><div className="flex items-center gap-2"><span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span></div></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask me anything or use the microphone..." className="w-full pl-24 pr-14 py-3 rounded-full bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none transition" disabled={isLoading} />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-accent" aria-label="Upload CSV" disabled={isLoading}><UploadIcon className="h-6 w-6 text-muted-foreground" /></button>
            {isSpeechRecognitionSupported && <button onClick={toggleListening} className={`p-2 rounded-full ${isListening ? 'bg-destructive/20' : 'hover:bg-accent'}`} aria-label="Use Microphone" disabled={isLoading}><MicrophoneIcon className={`h-6 w-6 ${isListening ? 'text-destructive' : 'text-muted-foreground'}`} /></button>}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button onClick={() => handleSendMessage()} className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground" aria-label="Send message" disabled={isLoading || !input.trim()}><SendIcon className="h-6 w-6" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};