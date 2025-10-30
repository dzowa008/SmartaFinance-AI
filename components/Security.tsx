
import React from 'react';
import { Card } from './Card';
import { ShieldCheckIcon, DownloadIcon, TrashIcon } from './Icons';

interface SecurityProps {
    onDataDeletion: () => void;
}

export const Security: React.FC<SecurityProps> = ({ onDataDeletion }) => {

    const handleDownloadData = () => {
        const data = localStorage.getItem('transactions');
        if (data) {
            const blob = new Blob([data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'smartfinance_data.csv';
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert("No transaction data to download.");
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold font-heading mb-6">Security & Privacy</h2>
             <div className="space-y-8">
                <Card>
                    <div className="flex items-center gap-4">
                        <ShieldCheckIcon className="h-10 w-10 text-soft-green-500"/>
                        <div>
                            <h3 className="text-xl font-bold font-heading">Our Commitment to Your Security</h3>
                            <p className="text-slate-500">Your trust is our top priority.</p>
                        </div>
                    </div>
                    <ul className="mt-6 space-y-4 list-disc list-inside text-slate-600 dark:text-slate-300">
                        <li><strong>End-to-End Encryption:</strong> All your financial data is encrypted both in transit and at rest. We use industry-standard TLS 1.3 and AES-256 encryption.</li>
                        <li><strong>Secure Authentication:</strong> Your account is protected using modern authentication standards like JWT (JSON Web Tokens) to ensure every request is verified.</li>
                        <li><strong>Privacy First:</strong> We are GDPR compliant and believe in data minimization. We only collect the data necessary to provide you with our services.</li>
                        <li><strong>You're In Control:</strong> We provide you with the tools to view, manage, and delete your data at any time.</li>
                    </ul>
                </Card>
                
                 <Card>
                    <h3 className="text-xl font-bold font-heading mb-4">Manage Your Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-navy-800/50 rounded-lg">
                            <h4 className="font-semibold flex items-center gap-2"><DownloadIcon className="h-5 w-5"/> Download Your Data</h4>
                            <p className="text-sm text-slate-500 my-2">Download a copy of all your transaction data in CSV format.</p>
                            <button onClick={handleDownloadData} className="text-sm font-medium text-soft-green-600 hover:underline">Download Data</button>
                        </div>
                         <div className="p-4 bg-red-500/10 rounded-lg">
                            <h4 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-400"><TrashIcon className="h-5 w-5"/> Delete Your Data</h4>
                            <p className="text-sm text-red-900/80 dark:text-red-300/80 my-2">Permanently delete your account and all associated financial data. This action cannot be undone.</p>
                            <button onClick={onDataDeletion} className="text-sm font-medium text-red-600 hover:underline">Delete All Data</button>
                        </div>
                    </div>
                </Card>
             </div>
        </div>
    );
};
