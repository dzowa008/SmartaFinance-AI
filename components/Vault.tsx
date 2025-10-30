
import React, { useState, useRef } from 'react';
import { StoredDocument } from '../types';
import { Card } from './Card';
import { UploadIcon, ShieldCheckIcon, FileTextIcon, TrashIcon } from './Icons';

interface VaultProps {
    documents: StoredDocument[];
    setDocuments: React.Dispatch<React.SetStateAction<StoredDocument[]>>;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const Vault: React.FC<VaultProps> = ({ documents, setDocuments }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const base64Content = await fileToBase64(file);
        const newDoc: StoredDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            tags: ['untagged'],
            content: base64Content,
        };
        setDocuments(prev => [newDoc, ...prev]);
        event.target.value = ''; // Reset file input
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            setDocuments(docs => docs.filter(d => d.id !== id));
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-3xl font-bold font-heading">Smart Document Vault</h2><p className="text-slate-500 text-lg">Securely store your receipts, invoices, and financial documents.</p></div>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium">
                    <UploadIcon className="h-5 w-5" /><span>Upload Document</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>

            <Card className="mb-6 bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-4">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-500"/>
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Your documents are secure</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">All uploaded files are protected with simulated end-to-end encryption. Only you can access them.</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map(doc => (
                    <Card key={doc.id} className="flex flex-col">
                         <div className="flex-shrink-0 bg-slate-100 dark:bg-navy-800 rounded-lg p-4 flex items-center justify-center">
                            <FileTextIcon className="h-12 w-12 text-slate-400"/>
                         </div>
                         <div className="flex-grow mt-4">
                            <p className="font-semibold truncate">{doc.name}</p>
                            <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB &bull; {new Date(doc.uploadDate).toLocaleDateString()}</p>
                            <div className="mt-2 flex gap-1">
                                {doc.tags.map(tag => <span key={tag} className="text-xs bg-slate-200 dark:bg-navy-700 px-2 py-0.5 rounded-full">{tag}</span>)}
                            </div>
                         </div>
                         <div className="mt-4 pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end">
                            <button onClick={() => handleDelete(doc.id)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                         </div>
                    </Card>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center text-slate-500 py-24 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-lg">
                    <h3 className="font-semibold text-xl text-slate-600 dark:text-slate-300">Your Vault is Empty</h3>
                    <p>Upload your first document to get started.</p>
                </div>
            )}
        </>
    );
};
