import React from 'react';
import { Card } from './Card';
import { ShieldCheckIcon, DownloadIcon, TrashIcon } from './Icons';
import { db } from '../services/dbService';
import { Transaction } from '../types';

interface SecurityProps {
    onDataDeletion: () => void;
}

export const Security: React.FC<SecurityProps> = ({ onDataDeletion }) => {

    const handleDownloadData = async () => {
        const data = await db.getAll<Transaction>('transactions');
        if (data && data.length > 0) {
            const header = "id,date,description,amount,category,type\n";
            const csv = data.map(row => `${row.id},${row.date},"${row.description}",${row.amount},${row.category},${row.type}`).join('\n');
            const blob = new Blob([header + csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'smartfinance_transactions.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert("No transaction data to download.");
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
             <div>
                <h2 className="text-3xl font-bold font-heading">Security & Privacy</h2>
                <p className="text-muted-foreground text-lg">Manage your data and understand our commitment to your privacy.</p>
            </div>
             <div className="space-y-8 mt-6">
                <Card>
                    <div className="flex items-center gap-4">
                        <ShieldCheckIcon className="h-10 w-10 text-primary"/>
                        <div>
                            <h3 className="text-xl font-bold font-heading">Our Commitment to Your Security</h3>
                            <p className="text-muted-foreground">Your trust is our top priority.</p>
                        </div>
                    </div>
                    <ul className="mt-6 space-y-4 list-disc list-inside text-muted-foreground">
                        <li><strong>Client-Side Storage:</strong> All your financial data is stored locally and securely in your browser's private IndexedDB database. It never leaves your device.</li>
                        <li><strong>Secure Authentication:</strong> Your account is protected using modern authentication standards like JWT (JSON Web Tokens) to ensure every request is verified.</li>
                        <li><strong>Privacy First:</strong> We are GDPR compliant and believe in data minimization. We only collect the data necessary to provide you with our services.</li>
                        <li><strong>You're In Control:</strong> We provide you with the tools to view, manage, and delete your data at any time.</li>
                    </ul>
                </Card>
                
                 <Card>
                    <h3 className="text-xl font-bold font-heading mb-4">Manage Your Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-accent rounded-lg">
                            <h4 className="font-semibold flex items-center gap-2"><DownloadIcon className="h-5 w-5"/> Download Your Data</h4>
                            <p className="text-sm text-muted-foreground my-2">Download a copy of all your transaction data in CSV format.</p>
                            <button onClick={handleDownloadData} className="text-sm font-medium text-primary hover:underline">Download Data</button>
                        </div>
                         <div className="p-4 bg-destructive/10 rounded-lg">
                            <h4 className="font-semibold flex items-center gap-2 text-destructive"><TrashIcon className="h-5 w-5"/> Delete Your Data</h4>
                            <p className="text-sm text-destructive/80 my-2">Permanently delete your account and all associated financial data from this browser. This action cannot be undone.</p>
                            <button onClick={onDataDeletion} className="text-sm font-medium text-destructive hover:underline">Delete All Data</button>
                        </div>
                    </div>
                </Card>
             </div>
        </div>
    );
};