import React, { useState } from 'react';
import { ForumPost } from '../types';
import { Card } from './Card';
import { PlusCircleIcon, XIcon, SendIcon } from './Icons';
import { moderateForumPost } from '../services/geminiService';

interface CommunityProps {
    posts: ForumPost[];
    onSavePost: (post: ForumPost) => void;
}

const NewPostModal: React.FC<{ onClose: () => void; onSave: (post: Omit<ForumPost, 'id' | 'comments'>) => void; }> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isModerating, setIsModerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputClasses = "w-full mt-1 p-2 rounded-lg bg-input border border-border focus:ring-1 focus:ring-ring outline-none";
    
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
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border flex justify-between items-center"><h3 className="text-xl font-bold font-heading">Create New Post</h3><button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-accent"><XIcon className="h-5 w-5"/></button></div>
                    <div className="p-6 space-y-4">
                        <div><label className="text-sm font-medium">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required /></div>
                        <div><label className="text-sm font-medium">Content</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className={inputClasses} required /></div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <div className="p-6 bg-secondary/50 border-t border-border flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted font-medium">Cancel</button><button type="submit" disabled={isModerating} className="py-2 px-4 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 font-medium">{isModerating ? 'Checking...' : 'Post'}</button></div>
                </form>
            </div>
        </div>
    );
};

export const Community: React.FC<CommunityProps> = ({ posts, onSavePost }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSavePost = (post: Omit<ForumPost, 'id' | 'comments'>) => {
        onSavePost({ ...post, id: '', comments: [] });
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold font-heading">Community Forum</h2>
                    <p className="text-muted-foreground text-lg">Share tips and discuss finances with other users.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 py-2 px-4 rounded-lg text-white bg-primary hover:bg-primary/90 font-medium"><PlusCircleIcon className="h-5 w-5" /><span>New Post</span></button>
            </div>
            <div className="space-y-4">
                {posts.map(post => (
                    <Card key={post.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                        <h3 className="text-xl font-bold font-heading">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">by {post.author} &bull; {post.timestamp}</p>
                        <p className="mt-2 text-foreground line-clamp-2">{post.content}</p>
                        <div className="mt-4 border-t border-border pt-3">
                            <h4 className="font-semibold text-sm mb-2">Comments ({post.comments.length})</h4>
                            {post.comments.map(comment => (<div key={comment.id} className="text-sm mb-2 p-3 bg-accent rounded-lg"><strong>{comment.author}:</strong> {comment.text}</div>))}
                             <div className="relative mt-2"><input type="text" placeholder="Add a comment..." className="w-full p-2 pr-10 rounded-lg bg-input border border-border"/><button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary"><SendIcon className="h-5 w-5"/></button></div>
                        </div>
                    </Card>
                ))}
            </div>
            {isModalOpen && <NewPostModal onClose={() => setIsModalOpen(false)} onSave={handleSavePost} />}
        </>
    );
};