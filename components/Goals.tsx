
import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { Card } from './Card';
import { TargetIcon, PlusCircleIcon, PencilIcon, TrashIcon, XIcon } from './Icons';

interface GoalsProps {
    goals: SavingsGoal[];
    setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-slate-200 dark:bg-navy-800 rounded-full h-4">
        <div className="bg-soft-green-500 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${Math.min(value, 100)}%` }}>
            {value.toFixed(0)}%
        </div>
    </div>
);

const GoalModal: React.FC<{
    goal: SavingsGoal | null;
    onClose: () => void;
    onSave: (goal: SavingsGoal) => void;
}> = ({ goal, onClose, onSave }) => {
    const [currentGoal, setCurrentGoal] = useState<SavingsGoal>(
        goal || { name: '', targetAmount: 1000, currentAmount: 0, targetDate: '' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentGoal(prev => ({ ...prev, [name]: name.includes('Amount') ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentGoal);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold font-heading">{goal ? 'Edit Goal' : 'Create New Goal'}</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-navy-700"><XIcon className="h-5 w-5"/></button>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Goal Name</label>
                        <input type="text" name="name" value={currentGoal.name} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Current Amount ($)</label>
                            <input type="number" name="currentAmount" value={currentGoal.currentAmount} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Target Amount ($)</label>
                            <input type="number" name="targetAmount" value={currentGoal.targetAmount} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Target Date</label>
                        <input type="date" name="targetDate" value={currentGoal.targetDate} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-200 dark:bg-navy-700 hover:bg-slate-300 dark:hover:bg-navy-600 font-medium">Cancel</button>
                        <button type="submit" className="py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium">Save Goal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const Goals: React.FC<GoalsProps> = ({ goals, setGoals }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

    const handleOpenModal = (goal: SavingsGoal | null = null) => {
        setSelectedGoal(goal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedGoal(null);
        setIsModalOpen(false);
    };

    const handleSaveGoal = (goal: SavingsGoal) => {
        if (goal.id) {
            setGoals(goals.map(g => g.id === goal.id ? goal : g));
        } else {
            setGoals([...goals, { ...goal, id: `goal-${Date.now()}` }]);
        }
        handleCloseModal();
    };
    
    const handleDeleteGoal = (id: string) => {
        if(window.confirm("Are you sure you want to delete this goal?")) {
            setGoals(goals.filter(g => g.id !== id));
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold font-heading">Savings Goals</h2>
                    <p className="text-slate-500 text-lg">Track and manage your financial targets.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium transition-transform hover:scale-105">
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>New Goal</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                        <Card key={goal.id} className="flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold font-heading">{goal.name}</h3>
                                    <p className="text-sm text-slate-400">Target Date: {goal.targetDate}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(goal)} className="p-1.5 text-slate-500 hover:text-blue-500"><PencilIcon className="h-4 w-4" /></button>
                                    <button onClick={() => handleDeleteGoal(goal.id!)} className="p-1.5 text-slate-500 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="flex-grow my-4">
                                <ProgressBar value={progress} />
                            </div>
                            <div className="text-center font-semibold">
                                <span className="text-soft-green-500">${goal.currentAmount.toLocaleString()}</span> / <span>${goal.targetAmount.toLocaleString()}</span>
                            </div>
                        </Card>
                    );
                })}

                {goals.length === 0 && (
                     <div className="md:col-span-2 lg:col-span-3 text-center text-slate-500 py-24 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-lg">
                        <TargetIcon className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                        <h3 className="font-semibold text-xl text-slate-600 dark:text-slate-300">No Savings Goals Yet</h3>
                        <p>Click "New Goal" to start planning for your future.</p>
                    </div>
                )}
            </div>
            
            {isModalOpen && <GoalModal goal={selectedGoal} onClose={handleCloseModal} onSave={handleSaveGoal} />}
        </>
    );
};
