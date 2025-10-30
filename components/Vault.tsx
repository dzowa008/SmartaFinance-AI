import React, { useState, useRef } from 'react';
import { StoredDocument } from '../types';
import { Card } from './Card';
import { UploadIcon, ShieldCheckIcon, FileTextIcon, TrashIcon } from './Icons';

interface VaultProps {
    documents: StoredDocument[];
    onSaveDocument: (doc: StoredDocument) => void;
    onDeleteDocument: (id: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const Vault: React.FC<VaultProps> = ({ documents, onSaveDocument, onDeleteDocument }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const base64Content = await fileToBase64(file);
        const newDoc: StoredDocument = {
            id: '', // ID will be set by the parent
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            tags: ['untagged'],
            content: base64Content,
        };
        onSaveDocument(newDoc);
        if (event.target) event.target.value = ''; // Reset file input
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            onDeleteDocument(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div><h2 className="text-3xl font-bold font-heading">Smart Document Vault</h2><p className="text-muted-foreground text-lg">Securely store your receipts, invoices, and financial documents.</p></div>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-primary hover:bg-primary/90 font-medium">
                    <UploadIcon className="h-5 w-5" /><span>Upload Document</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>

            <Card className="bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-4">
                    <ShieldCheckIcon className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Your documents are secure</h3>
                        <p className="text-sm text-muted-foreground">All uploaded files are stored locally in your browser's secure database and are never sent to a server.</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map(doc => (
                    <Card key={doc.id} className="flex flex-col">
                         <div className="flex-shrink-0 bg-accent rounded-lg p-4 flex items-center justify-center">
                            <FileTextIcon className="h-12 w-12 text-muted-foreground"/>
                         </div>
                         <div className="flex-grow mt-4">
                            <p className="font-semibold truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB &bull; {new Date(doc.uploadDate).toLocaleDateString()}</p>
                            <div className="mt-2 flex gap-1">
                                {doc.tags.map(tag => <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{tag}</span>)}
                            </div>
                         </div>
                         <div className="mt-4 pt-3 border-t border-border flex justify-end">
                            <button onClick={() => handleDelete(doc.id)} className="p-1 text-muted-foreground hover:text-destructive"><TrashIcon className="h-4 w-4"/></button>
                         </div>
                    </Card>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center text-muted-foreground py-24 border-2 border-dashed border-border rounded-lg">
                    <h3 className="font-semibold text-xl text-foreground">Your Vault is Empty</h3>
                    <p>Upload your first document to get started.</p>
                </div>
            )}
        </div>
    );
};