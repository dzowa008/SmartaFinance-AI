
import React, { useState, useMemo } from 'react';
import { SplitExpense, SplitParticipant, UserSettings } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, XIcon, CheckCircleIcon, ClockIcon } from './Icons';

interface SplitterProps {
    expenses: SplitExpense[];
    setExpenses: React.Dispatch<React.SetStateAction<SplitExpense[]>>;
    settings: UserSettings;
}

const SplitModal: React.FC<{
    onClose: () => void;
    onSave: (expense: Omit<SplitExpense, 'id'>) => void;
}> = ({ onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [participants, setParticipants] = useState<SplitParticipant[]>([{ name: 'You', amount: 0, isPaid: true }, { name: '', amount: 0, isPaid: false }]);
    
    const handleParticipantChange = (index: number, field: keyof SplitParticipant, value: string | number) => {
        const newParticipants = [...participants];
        (newParticipants[index] as any)[field] = value;
        setParticipants(newParticipants);
    };

    const addParticipant = () => setParticipants([...participants, { name: '', amount: 0, isPaid: false }]);
    const removeParticipant = (index: number) => setParticipants(participants.filter((_, i) => i !== index));

    const autoSplit = () => {
        const amountPerPerson = totalAmount / participants.length;
        setParticipants(participants.map(p => ({ ...p, amount: amountPerPerson })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ description, totalAmount, date: new Date().toISOString().split('T')[0], participants });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-xl font-bold font-heading">New Split Expense</h3><button type="button" onClick={onClose}><XIcon className="h-5 w-5"/></button></div>
                    <div><label>Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    <div><label>Total Amount ($)</label><input type="number" step="any" value={totalAmount} onChange={e => setTotalAmount(parseFloat(e.target.value))} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    <div className="flex justify-between items-center"><h4 className="font-semibold">Participants</h4><button type="button" onClick={autoSplit} className="text-sm font-medium text-soft-green-600">Split Evenly</button></div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">{participants.map((p, i) => (<div key={i} className="flex gap-2 items-center"><input type="text" placeholder="Name" value={p.name} onChange={e => handleParticipantChange(i, 'name', e.target.value)} className="w-full p-1 rounded bg-slate-200 dark:bg-navy-800" /><input type="number" placeholder="Amount" value={p.amount} onChange={e => handleParticipantChange(i, 'amount', parseFloat(e.target.value))} className="w-1/3 p-1 rounded bg-slate-200 dark:bg-navy-800" />{i > 0 && <button type="button" onClick={() => removeParticipant(i)} className="text-red-500"><XIcon className="h-4 w-4"/></button>}</div>))}</div>
                    <button type="button" onClick={addParticipant} className="text-sm font-medium text-soft-green-600">Add Participant +</button>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-200 dark:bg-navy-700">Cancel</button><button type="submit" className="py-2 px-4 rounded-lg text-white bg-soft-green-600">Save Split</button></div>
                </form>
            </div>
        </div>
    );
};

export const Splitter: React.FC<SplitterProps> = ({ expenses, setExpenses, settings }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { totalOwedToYou, totalYouOwe } = useMemo(() => {
        let totalOwedToYou = 0;
        let totalYouOwe = 0;
        expenses.forEach(exp => {
            exp.participants.forEach(p => {
                if (p.name !== 'You' && !p.isPaid) totalOwedToYou += p.amount;
                if (p.name === 'You' && !p.isPaid) totalYouOwe += p.amount; // Should not happen with current logic but good practice
            });
        });
        return { totalOwedToYou, totalYouOwe };
    }, [expenses]);
    
    const handleSave = (exp: Omit<SplitExpense, 'id'>) => { setExpenses(prev => [{...exp, id: `se-${Date.now()}`}, ...prev]); setIsModalOpen(false); };
    const handleMarkAsPaid = (expId: string, participantName: string) => { setExpenses(exps => exps.map(e => e.id === expId ? { ...e, participants: e.participants.map(p => p.name === participantName ? { ...p, isPaid: true } : p) } : e)); };

    return (
        <>
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold font-heading">Expense Splitter</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium"><PlusCircleIcon className="h-5 w-5" />New Split</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="text-center"><p>Total Owed to You</p><p className="text-3xl font-bold text-soft-green-600">{totalOwedToYou.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></Card>
                <Card className="text-center"><p>Total You Owe</p><p className="text-3xl font-bold text-red-500">{totalYouOwe.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></Card>
            </div>
            <div className="space-y-4">
                {expenses.map(exp => (
                    <Card key={exp.id}>
                        <div className="flex justify-between items-start"><h3 className="text-xl font-bold font-heading">{exp.description}</h3><p className="font-semibold">{exp.totalAmount.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></div>
                        <p className="text-sm text-slate-500 mb-4">{new Date(exp.date).toLocaleDateString()}</p>
                        <ul className="space-y-2">{exp.participants.map(p => (<li key={p.name} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-navy-800 rounded-lg"><div><p className="font-medium">{p.name}</p><p className="text-sm">{p.amount.toLocaleString('en-US',{style:'currency', currency:settings.currency})}</p></div>{p.isPaid ? <span className="flex items-center gap-1 text-xs font-medium text-soft-green-600"><CheckCircleIcon className="h-4 w-4"/>Paid</span> : <span className="flex items-center gap-2"><button onClick={() => alert('Reminder sent!')} className="text-xs font-medium text-blue-500 hover:underline">Remind</button><button onClick={()=>handleMarkAsPaid(exp.id, p.name)} className="text-xs font-medium text-soft-green-600 hover:underline">Mark Paid</button></span>}</li>))}</ul>
                    </Card>
                ))}
            </div>
            {isModalOpen && <SplitModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </>
    );
};
