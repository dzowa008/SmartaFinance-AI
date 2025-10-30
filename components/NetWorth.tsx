
import React, { useState } from 'react';
import { Asset, Liability, UserSettings } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HISTORICAL_DATA } from '../constants';

interface NetWorthProps {
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    liabilities: Liability[];
    setLiabilities: React.Dispatch<React.SetStateAction<Liability[]>>;
    settings: UserSettings;
}

const ItemModal: React.FC<{
    item: Asset | Liability | null;
    type: 'Asset' | 'Liability';
    onClose: () => void;
    onSave: (item: Asset | Liability) => void;
}> = ({ item, type, onClose, onSave }) => {
    const [currentItem, setCurrentItem] = useState(
        item || { name: '', type: type === 'Asset' ? 'Cash' : 'Loan', [type === 'Asset' ? 'value' : 'amount']: 0 }
    );

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
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold font-heading">{item ? 'Edit' : 'Create New'} {type}</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-navy-700"><XIcon className="h-5 w-5"/></button>
                    </div>
                    <div><label className="text-sm font-medium">{type} Name</label><input type="text" name="name" value={currentItem.name} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Type</label><select name="type" value={currentItem.type} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800 appearance-none">{typeOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                        <div><label className="text-sm font-medium">Amount ($)</label><input type="number" name={valueKey} value={(currentItem as any)[valueKey]} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-200 dark:bg-navy-700 hover:bg-slate-300">Cancel</button><button type="submit" className="py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700">Save</button></div>
                </form>
            </div>
        </div>
    );
};

export const NetWorth: React.FC<NetWorthProps> = ({ assets, setAssets, liabilities, setLiabilities, settings }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'Asset' | 'Liability' | null; item: Asset | Liability | null }>({ isOpen: false, type: null, item: null });

    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const handleOpenModal = (type: 'Asset' | 'Liability', item: Asset | Liability | null = null) => setModalState({ isOpen: true, type, item });
    const handleCloseModal = () => setModalState({ isOpen: false, type: null, item: null });

    const handleSave = (item: Asset | Liability) => {
        if ('value' in item) { // It's an Asset
            if (item.id) setAssets(assets.map(a => a.id === item.id ? item : a));
            else setAssets([...assets, { ...item, id: `a-${Date.now()}` }]);
        } else { // It's a Liability
            if (item.id) setLiabilities(liabilities.map(l => l.id === item.id ? item : l));
            else setLiabilities([...liabilities, { ...item, id: `l-${Date.now()}` }]);
        }
        handleCloseModal();
    };

    const handleDelete = (type: 'Asset' | 'Liability', id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
            if (type === 'Asset') setAssets(assets.filter(a => a.id !== id));
            else setLiabilities(liabilities.filter(l => l.id !== id));
        }
    };
    
    const ItemList: React.FC<{ title: string; items: (Asset | Liability)[]; type: 'Asset' | 'Liability' }> = ({ title, items, type }) => (
        <Card>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold font-heading">{title}</h3><button onClick={() => handleOpenModal(type)} className="flex items-center gap-1 text-sm text-soft-green-600 hover:underline"><PlusCircleIcon className="h-4 w-4"/>Add New</button></div>
            <ul className="space-y-2">{items.map(item => (<li key={item.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.type}</p></div><div className="flex items-center gap-2"><p className="font-bold">${('value' in item ? item.value : item.amount).toLocaleString()}</p><button onClick={() => handleOpenModal(type, item)} className="p-1 text-slate-400 hover:text-blue-500"><PencilIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(type, item.id)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button></div></li>))}</ul>
        </Card>
    );

    return (
        <>
            <h2 className="text-3xl font-bold font-heading mb-6">Net Worth Tracker</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-3 text-center"><p className="text-sm text-slate-500">Total Net Worth</p><p className="text-5xl font-extrabold font-heading text-navy-800 dark:text-white my-2">{netWorth.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
                <Card className="text-center"><p className="text-sm text-slate-500 flex items-center justify-center gap-2"><TrendingUpIcon className="h-5 w-5 text-soft-green-500"/>Total Assets</p><p className="text-3xl font-bold text-soft-green-600">{totalAssets.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
                <Card className="text-center"><p className="text-sm text-slate-500 flex items-center justify-center gap-2"><TrendingDownIcon className="h-5 w-5 text-red-500"/>Total Liabilities</p><p className="text-3xl font-bold text-red-500">{totalLiabilities.toLocaleString('en-US', { style: 'currency', currency: settings.currency })}</p></Card>
            </div>
            <Card className="mb-6"><h3 className="text-xl font-bold font-heading mb-4">Net Worth Growth</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={HISTORICAL_DATA}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="month" tick={{ fill: 'currentColor', fontSize: 12 }} /><YAxis tick={{ fill: 'currentColor', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`}/><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155' }}/><Line type="monotone" dataKey="netWorth" stroke="#617efc" strokeWidth={3} name="Net Worth"/></LineChart></ResponsiveContainer></div></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><ItemList title="Assets" items={assets} type="Asset" /><ItemList title="Liabilities" items={liabilities} type="Liability" /></div>
            {modalState.isOpen && <ItemModal item={modalState.item} type={modalState.type!} onClose={handleCloseModal} onSave={handleSave} />}
        </>
    );
};
