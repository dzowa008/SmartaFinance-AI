import React, { useState, useMemo } from 'react';
import { SplitExpense, SplitParticipant, UserSettings } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, XIcon, CheckCircleIcon, ClockIcon } from './Icons';

interface SplitterProps {
    expenses: SplitExpense[];
    onSaveExpense: (expense: SplitExpense) => void;
    onUpdateExpense: (expense: SplitExpense) => void;
    settings: UserSettings;
}

const SplitModal: React.FC<{
    onClose: () => void;
    onSave: (expense: Omit<SplitExpense, 'id'>) => void;
}> = ({ onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [participants, setParticipants] = useState<SplitParticipant[]>([{ name: 'You', amount: 0, isPaid: true }, { name: '', amount: 0, isPaid: false }]);
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";
    
    const handleParticipantChange = (index: number, field: keyof SplitParticipant, value: string | number) => {
        const newParticipants = [...participants];
        (newParticipants[index] as any)[field] = value;
        setParticipants(newParticipants);
    };

    const addParticipant = () => setParticipants([...participants, { name: '', amount: 0, isPaid: false }]);
    const removeParticipant = (index: number) => setParticipants(participants.filter((_, i) => i !== index));

    const autoSplit = () => {
        if (totalAmount > 0 && participants.length > 0) {
            const amountPerPerson = totalAmount / participants.length;
            setParticipants(participants.map(p => ({ ...p, amount: amountPerPerson })));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ description, totalAmount, date: new Date().toISOString().split('T')[0], participants });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border flex justify-between items-center"><h3 className="text-xl font-bold font-heading">New Split Expense</h3><button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-accent"><XIcon className="h-5 w-5"/></button></div>
                    <div className="p-6 space-y-4">
                        <div><label>Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} required /></div>
                        <div><label>Total Amount ($)</label><input type="number" step="any" value={totalAmount} onChange={e => setTotalAmount(parseFloat(e.target.value))} className={inputClasses} required /></div>
                        <div className="flex justify-between items-center"><h4 className="font-semibold">Participants</h4><button type="button" onClick={autoSplit} className="text-sm font-medium text-primary">Split Evenly</button></div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">{participants.map((p, i) => (<div key={i} className="flex gap-2 items-center"><input type="text" placeholder="Name" value={p.name} onChange={e => handleParticipantChange(i, 'name', e.target.value)} className="w-full p-1 rounded bg-secondary" /><input type="number" placeholder="Amount" value={p.amount} onChange={e => handleParticipantChange(i, 'amount', parseFloat(e.target.value))} className="w-1/3 p-1 rounded bg-secondary" />{i > 0 && <button type="button" onClick={() => removeParticipant(i)} className="text-destructive"><XIcon className="h-4 w-4"/></button>}</div>))}</div>
                        <button type="button" onClick={addParticipant} className="text-sm font-medium text-primary">Add Participant +</button>
                    </div>
                    <div className="p-6 bg-secondary/50 border-t border-border flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted font-medium">Cancel</button><button type="submit" className="py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 font-medium">Save Split</button></div>
                </form>
            </div>
        </div>
    );
};

export const Splitter: React.FC<SplitterProps> = ({ expenses, onSaveExpense, onUpdateExpense, settings }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { totalOwedToYou, totalYouOwe } = useMemo(() => {
        let totalOwedToYou = 0;
        let totalYouOwe = 0;
        expenses.forEach(exp => {
            exp.participants.forEach(p => {
                if (p.name !== 'You' && !p.isPaid) totalOwedToYou += p.amount;
                if (p.name === 'You' && !p.isPaid) totalYouOwe += p.amount;
            });
        });
        return { totalOwedToYou, totalYouOwe };
    }, [expenses]);
    
    const handleSave = (exp: Omit<SplitExpense, 'id'>) => { onSaveExpense(exp as SplitExpense); setIsModalOpen(false); };
    const handleMarkAsPaid = (expId: string, participantName: string) => { 
        const expenseToUpdate = expenses.find(e => e.id === expId);
        if (expenseToUpdate) {
            const updatedExpense = {
                ...expenseToUpdate,
                participants: expenseToUpdate.participants.map(p => p.name === participantName ? { ...p, isPaid: true } : p)
            };
            onUpdateExpense(updatedExpense);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4"><h2 className="text-3xl font-bold font-heading">Expense Splitter</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-primary hover:bg-primary/90 font-medium"><PlusCircleIcon className="h-5 w-5" />New Split</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="text-center"><p className="text-muted-foreground">Total Owed to You</p><p className="text-3xl font-bold text-primary">{totalOwedToYou.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></Card>
                <Card className="text-center"><p className="text-muted-foreground">Total You Owe</p><p className="text-3xl font-bold text-destructive">{totalYouOwe.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></Card>
            </div>
            <div className="space-y-4">
                {expenses.map(exp => (
                    <Card key={exp.id}>
                        <div className="flex justify-between items-start"><h3 className="text-xl font-bold font-heading">{exp.description}</h3><p className="font-semibold">{exp.totalAmount.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></div>
                        <p className="text-sm text-muted-foreground mb-4">{new Date(exp.date).toLocaleDateString()}</p>
                        <ul className="space-y-2">{exp.participants.map(p => (<li key={`${exp.id}-${p.name}`} className="flex justify-between items-center p-3 bg-accent rounded-lg"><div><p className="font-medium">{p.name}</p><p className="text-sm">{p.amount.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></div>{p.isPaid ? <span className="flex items-center gap-1 text-xs font-medium text-primary"><CheckCircleIcon className="h-4 w-4"/>Paid</span> : <span className="flex items-center gap-2"><button onClick={() => alert('Reminder sent!')} className="text-xs font-medium text-blue-500 hover:underline">Remind</button><button onClick={()=>handleMarkAsPaid(exp.id, p.name)} className="text-xs font-medium text-primary hover:underline">Mark Paid</button></span>}</li>))}</ul>
                    </Card>
                ))}
            </div>
            {isModalOpen && <SplitModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};