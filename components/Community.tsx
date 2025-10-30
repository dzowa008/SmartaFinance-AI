
import React, { useState } from 'react';
import { ForumPost } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, XIcon, SendIcon } from './Icons';
import { moderateForumPost } from '../services/geminiService';

interface CommunityProps {
    posts: ForumPost[];
    setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
}

const NewPostModal: React.FC<{ onClose: () => void; onSave: (post: Omit<ForumPost, 'id' | 'comments'>) => void; }> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isModerating, setIsModerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsModerating(true);
        setError(null);
        const moderationResult = await moderateForumPost(content);
        if (moderationResult === 'safe') {
            onSave({ title, content, author: 'You', timestamp: 'Just now' });
        } else {
            setError('This post was flagged as inappropriate and cannot be published. Please revise your content.');
        }
        setIsModerating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-xl font-bold font-heading">Create New Post</h3><button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-navy-700"><XIcon className="h-5 w-5"/></button></div>
                    <div><label className="text-sm font-medium">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    <div><label className="text-sm font-medium">Content</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-navy-800" required /></div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-200 dark:bg-navy-700 hover:bg-slate-300">Cancel</button><button type="submit" disabled={isModerating} className="py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 disabled:bg-slate-400">{isModerating ? 'Checking...' : 'Post'}</button></div>
                </form>
            </div>
        </div>
    );
};

export const Community: React.FC<CommunityProps> = ({ posts, setPosts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSavePost = (post: Omit<ForumPost, 'id' | 'comments'>) => {
        setPosts(prev => [{ ...post, id: `p-${Date.now()}`, comments: [] }, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-3xl font-bold font-heading">Community Forum</h2><p className="text-slate-500 text-lg">Share tips and discuss finances with other users.</p></div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium"><PlusCircleIcon className="h-5 w-5" /><span>New Post</span></button>
            </div>
            <div className="space-y-4">
                {posts.map(post => (
                    <Card key={post.id} className="cursor-pointer">
                        <h3 className="text-xl font-bold font-heading">{post.title}</h3>
                        <p className="text-sm text-slate-500">by {post.author} &bull; {post.timestamp}</p>
                        <p className="mt-2 text-slate-700 dark:text-slate-300 line-clamp-2">{post.content}</p>
                        <div className="mt-4 border-t border-slate-200 dark:border-navy-800 pt-3">
                            <h4 className="font-semibold text-sm mb-2">Comments ({post.comments.length})</h4>
                            {post.comments.map(comment => (<div key={comment.id} className="text-sm mb-2 p-2 bg-slate-100 dark:bg-navy-800 rounded-lg"><strong>{comment.author}:</strong> {comment.text}</div>))}
                             <div className="relative mt-2"><input type="text" placeholder="Add a comment..." className="w-full p-2 pr-10 rounded-lg bg-slate-100 dark:bg-navy-800"/><button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-soft-green-500"><SendIcon className="h-5 w-5"/></button></div>
                        </div>
                    </Card>
                ))}
            </div>
            {isModalOpen && <NewPostModal onClose={() => setIsModalOpen(false)} onSave={handleSavePost} />}
        </>
    );
};
