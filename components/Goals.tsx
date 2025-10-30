import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { Card } from './Card';
import { TargetIcon, PlusCircleIcon, PencilIcon, TrashIcon, XIcon } from './Icons';

interface GoalsProps {
    goals: SavingsGoal[];
    onSaveGoal: (goal: SavingsGoal) => void;
    onDeleteGoal: (id: string) => void;
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-secondary rounded-full h-3">
        <div className="bg-primary h-3 rounded-full text-white text-xs flex items-center justify-center transition-all duration-500" style={{ width: `${Math.min(value, 100)}%` }}>
        </div>
    </div>
);

const GoalModal: React.FC<{
    goal: SavingsGoal | null;
    onClose: () => void;
    onSave: (goal: SavingsGoal) => void;
}> = ({ goal, onClose, onSave }) => {
    const [currentGoal, setCurrentGoal] = useState<SavingsGoal>(
        goal || { id: '', name: '', targetAmount: 1000, currentAmount: 0, targetDate: '' }
    );
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentGoal(prev => ({ ...prev, [name]: name.includes('Amount') ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentGoal);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                     <div className="p-6 border-b border-border">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold font-heading">{goal ? 'Edit Goal' : 'Create New Goal'}</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-accent"><XIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Goal Name</label>
                            <input type="text" name="name" value={currentGoal.name} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Current Amount ($)</label>
                                <input type="number" name="currentAmount" value={currentGoal.currentAmount} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Target Amount ($)</label>
                                <input type="number" name="targetAmount" value={currentGoal.targetAmount} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Target Date</label>
                            <input type="date" name="targetDate" value={currentGoal.targetDate} onChange={handleChange} className={inputClasses} required />
                        </div>
                    </div>
                    <div className="p-6 bg-secondary/50 border-t border-border flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted font-medium">Cancel</button>
                        <button type="submit" className="py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 font-medium">Save Goal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const Goals: React.FC<GoalsProps> = ({ goals, onSaveGoal, onDeleteGoal }) => {
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
        onSaveGoal(goal);
        handleCloseModal();
    };
    
    const handleDeleteGoal = (id: string) => {
        if(window.confirm("Are you sure you want to delete this goal?")) {
            onDeleteGoal(id);
        }
    };

    return (
        <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold font-heading">Savings Goals</h2>
                    <p className="text-muted-foreground text-lg">Track and manage your financial targets.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-primary hover:bg-primary/90 font-medium transition-transform hover:scale-105">
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
                                    <p className="text-sm text-muted-foreground">Target: {goal.targetDate}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(goal)} className="p-1.5 text-muted-foreground hover:text-primary"><PencilIcon className="h-4 w-4" /></button>
                                    <button onClick={() => handleDeleteGoal(goal.id!)} className="p-1.5 text-muted-foreground hover:text-destructive"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="flex-grow my-4 space-y-2">
                                <ProgressBar value={progress} />
                                <div className="text-sm flex justify-between">
                                    <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
                                    <span className="text-muted-foreground">
                                       ${(goal.targetAmount - goal.currentAmount).toLocaleString()} left
                                    </span>
                                </div>
                            </div>
                            <div className="text-center font-semibold text-lg">
                                <span className="text-primary">${goal.currentAmount.toLocaleString()}</span> / <span className="text-muted-foreground">${goal.targetAmount.toLocaleString()}</span>
                            </div>
                        </Card>
                    );
                })}

                {goals.length === 0 && (
                     <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-24 border-2 border-dashed border-border rounded-lg">
                        <TargetIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="font-semibold text-xl text-foreground">No Savings Goals Yet</h3>
                        <p>Click "New Goal" to start planning for your future.</p>
                    </div>
                )}
            </div>
            
            {isModalOpen && <GoalModal goal={selectedGoal} onClose={handleCloseModal} onSave={handleSaveGoal} />}
        </>
    );
};