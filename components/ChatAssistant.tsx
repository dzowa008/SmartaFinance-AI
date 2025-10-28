
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFinancialData } from '../services/geminiService';
import { Transaction, ChatMessage } from '../types';
import { SendIcon, UploadIcon, BotIcon, UserIcon } from './Icons';
import { marked } from 'marked';

interface ChatAssistantProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ transactions, setTransactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your SmartFinance AI Assistant. How can I help you manage your finances today? You can ask for an analysis, a summary of your spending, or upload a CSV file with your latest transactions.",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').slice(1); // Skip header
        const newTransactions: Transaction[] = rows.map((row, index) => {
          const [date, description, category, amount, type] = row.split(',');
          if (!date || !description || !amount || !type) {
            throw new Error(`Invalid data in row ${index + 2}`);
          }
          return {
            id: `csv-${Date.now()}-${index}`,
            date,
            description,
            category: category || 'Uncategorized',
            amount: parseFloat(amount),
            type: type.toLowerCase() as 'income' | 'expense',
          };
        }).filter(t => t.date && t.description && !isNaN(t.amount));

        setTransactions(prev => [...prev, ...newTransactions]);
        
        const successMessage: ChatMessage = {
          id: Date.now().toString(),
          text: `Successfully imported ${newTransactions.length} transactions from your CSV file. You can now ask me to analyze them!`,
          sender: 'ai',
        };
        setMessages(prev => [...prev, successMessage]);

      } catch (error) {
         const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          text: `I had trouble reading that CSV file. Please make sure it has columns in this order: \`date,description,category,amount,type\`. The error was: ${error.message}`,
          sender: 'ai',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await analyzeFinancialData(input, transactions);
      const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: "I'm sorry, an unexpected error occurred. Please try again.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, transactions]);

  const parsedHtml = (text: string) => ({ __html: marked(text, { breaks: true }) });

  return (
    <div className="h-[calc(100vh-150px)] md:h-[calc(100vh-120px)] flex flex-col max-w-4xl mx-auto bg-white dark:bg-navy-900 rounded-2xl shadow-lg">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
            {message.sender === 'ai' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-soft-green-500 flex items-center justify-center text-white">
                <BotIcon className="h-5 w-5" />
              </div>
            )}
            <div className={`max-w-md md:max-w-lg lg:max-w-xl p-4 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-navy-700 text-white rounded-br-none' 
                  : 'bg-slate-100 dark:bg-navy-800 rounded-bl-none'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={parsedHtml(message.text)} />
            </div>
             {message.sender === 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 dark:bg-navy-700 flex items-center justify-center">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
         {isLoading && (
          <div className="flex items-start gap-4">
             <div className="flex-shrink-0 h-8 w-8 rounded-full bg-soft-green-500 flex items-center justify-center text-white">
                <BotIcon className="h-5 w-5" />
              </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-800 rounded-bl-none">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-navy-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question or describe what you need..."
            className="w-full pl-12 pr-24 py-3 rounded-full bg-slate-100 dark:bg-navy-800 focus:ring-2 focus:ring-soft-green-500 focus:outline-none transition"
            disabled={isLoading}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".csv"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
              aria-label="Upload CSV"
              disabled={isLoading}
            >
              <UploadIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-full bg-soft-green-500 text-white hover:bg-soft-green-600 transition-colors disabled:bg-slate-300 dark:disabled:bg-navy-700"
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
