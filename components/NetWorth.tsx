import React, { useState } from 'react';
import { Asset, Liability, UserSettings } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HISTORICAL_DATA } from '../constants';

interface NetWorthProps {
    assets: Asset[];
    onSaveAsset: (asset: Asset) => void;
    onDeleteAsset: (id: string) => void;
    liabilities: Liability[];
    onSaveLiability: (liability: Liability) => void;
    onDeleteLiability: (id: string) => void;
    settings: UserSettings;
}

const ItemModal: React.FC<{
    item: Asset | Liability | null;
    type: 'Asset' | 'Liability';
    onClose: () => void;
    onSave: (item: Asset | Liability) => void;
}> = ({ item, type, onClose, onSave }) => {
    const [currentItem, setCurrentItem] = useState(
        item || { id: '', name: '', type: type === 'Asset' ? 'Cash' : 'Loan', [type === 'Asset' ? 'value' : 'amount']: 0 }
    );
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: (name === 'value' || name === 'amount') ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentItem as Asset | Liability);
    };

    const typeOptions = type === 'Asset' 
        ? ['Cash', 'Investment', 'Property', 'Other']
        : ['Loan', 'Credit Card', 'Mortgage', 'Other'];
    const valueKey = type === 'Asset' ? 'value' : 'amount';

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h3 className="text-xl font-bold font-heading">{item ? 'Edit' : 'Create New'} {type}</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-accent"><XIcon className="h-5 w-5"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div><label className="text-sm font-medium">{type} Name</label><input type="text" name="name" value={currentItem.name} onChange={handleChange} className={inputClasses} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Type</label><select name="type" value={currentItem.type} onChange={handleChange} className={`${inputClasses} appearance-none`}>{typeOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                            <div><label className="text-sm font-medium">Amount ($)</label><input type="number" name={valueKey} value={(currentItem as any)[valueKey]} onChange={handleChange} className={inputClasses} required /></div>
                        </div>
                    </div>
                    <div className="p-6 bg-secondary/50 border-t border-border flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted font-medium">Cancel</button><button type="submit" className="py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 font-medium">Save</button></div>
                </form>
            </div>
        </div>
    );
};

export const NetWorth: React.FC<NetWorthProps> = (props) => {
    const { assets, onSaveAsset, onDeleteAsset, liabilities, onSaveLiability, onDeleteLiability, settings } = props;
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'Asset' | 'Liability' | null; item: Asset | Liability | null }>({ isOpen: false, type: null, item: null });

    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const handleOpenModal = (type: 'Asset' | 'Liability', item: Asset | Liability | null = null) => setModalState({ isOpen: true, type, item });
    const handleCloseModal = () => setModalState({ isOpen: false, type: null, item: null });

    const handleSave = (item: Asset | Liability) => {
        if ('value' in item) onSaveAsset(item);
        else onSaveLiability(item);
        handleCloseModal();
    };

    const handleDelete = (type: 'Asset' | 'Liability', id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
            if (type === 'Asset') onDeleteAsset(id);
            else onDeleteLiability(id);
        }
    };
    
    const ItemList: React.FC<{ title: string; items: (Asset | Liability)[]; type: 'Asset' | 'Liability' }> = ({ title, items, type }) => (
        <Card>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold font-heading">{title}</h3><button onClick={() => handleOpenModal(type)} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"><PlusCircleIcon className="h-4 w-4"/>Add New</button></div>
            <ul className="space-y-2">{items.map(item => (<li key={item.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.type}</p></div><div className="flex items-center gap-2"><p className="font-bold">${('value' in item ? item.value : item.amount).toLocaleString()}</p><button onClick={() => handleOpenModal(type, item)} className="p-1 text-muted-foreground hover:text-primary"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(type, item.id)} className="p-1 text-muted-foreground hover:text-destructive"><TrashIcon className="h-4 w-4"/></button></div></li>))}</ul>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold font-heading">Net Worth Tracker</h2>
                <p className="text-muted-foreground text-lg">Understand your financial position by tracking assets and liabilities.</p>
            </div>
            <Card className="lg:col-span-3 text-center"><p className="text-sm text-muted-foreground">Total Net Worth</p><p className="text-5xl font-extrabold font-heading text-foreground my-2">{netWorth.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="text-center"><p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><TrendingUpIcon className="h-5 w-5 text-primary"/>Total Assets</p><p className="text-3xl font-bold text-primary">{totalAssets.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
                <Card className="text-center"><p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><TrendingDownIcon className="h-5 w-5 text-destructive"/>Total Liabilities</p><p className="text-3xl font-bold text-destructive">{totalLiabilities.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
            </div>
            <Card><h3 className="text-xl font-bold font-heading mb-4">Net Worth Growth</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={HISTORICAL_DATA}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`}/><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/><Line type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" strokeWidth={3} name="Net Worth"/></LineChart></ResponsiveContainer></div></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><ItemList title="Assets" items={assets} type="Asset" /><ItemList title="Liabilities" items={liabilities} type="Liability" /></div>
            {modalState.isOpen && <ItemModal item={modalState.item} type={modalState.type!} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
};