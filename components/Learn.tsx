
import React, { useState } from 'react';
import { Card } from './Card';
import { generateLesson } from '../services/geminiService';
import { marked } from 'marked';

type Lesson = { lesson: string; question: string; options: string[]; answer: string; };

const TOPICS = ["Budgeting Basics", "Understanding Credit Scores", "Introduction to Investing", "Saving for Retirement (401k/IRA)", "Managing Debt"];

export const Learn: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleSelectTopic = async (topic: string) => {
        setSelectedTopic(topic);
        setIsLoading(true);
        setLesson(null);
        setSelectedAnswer(null);
        setIsCorrect(null);
        const result = await generateLesson(topic);
        setLesson(result);
        setIsLoading(false);
    };
    
    const handleAnswerSubmit = (option: string) => {
        setSelectedAnswer(option);
        setIsCorrect(option === lesson?.answer);
    };

    return (
        <>
            <h2 className="text-3xl font-bold font-heading mb-6">AI Financial Education Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <h3 className="text-xl font-bold font-heading mb-4">Topics</h3>
                    <ul className="space-y-2">
                        {TOPICS.map(topic => (
                            <li key={topic}>
                                <button onClick={() => handleSelectTopic(topic)} className={`w-full text-left p-2 rounded-lg ${selectedTopic === topic ? 'bg-soft-green-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                                    {topic}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="md:col-span-2">
                    {!selectedTopic ? (
                        <div className="text-center text-slate-500 py-24">Select a topic to start learning.</div>
                    ) : isLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 w-3/4 bg-slate-200 dark:bg-navy-800 rounded"></div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-navy-800 rounded"></div>
                            <div className="h-4 w-5/6 bg-slate-200 dark:bg-navy-800 rounded"></div>
                            <div className="pt-8"><div className="h-5 w-1/2 bg-slate-200 dark:bg-navy-800 rounded"></div><div className="space-y-2 mt-4"><div className="h-10 bg-slate-200 dark:bg-navy-800 rounded"></div><div className="h-10 bg-slate-200 dark:bg-navy-800 rounded"></div></div></div>
                        </div>
                    ) : lesson ? (
                        <div>
                            <h3 className="text-2xl font-bold font-heading mb-4">{selectedTopic}</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: marked(lesson.lesson, { breaks: true }) }} />
                            <h4 className="text-lg font-semibold mb-3">{lesson.question}</h4>
                            <div className="space-y-2">
                                {lesson.options.map(option => (
                                    <button 
                                        key={option} 
                                        onClick={() => handleAnswerSubmit(option)}
                                        disabled={selectedAnswer !== null}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                            selectedAnswer === null ? 'border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800' :
                                            option === lesson.answer ? 'border-soft-green-500 bg-soft-green-500/10' :
                                            option === selectedAnswer ? 'border-red-500 bg-red-500/10' : 'border-slate-200 dark:border-navy-700'
                                        }`}
                                    >{option}</button>
                                ))}
                            </div>
                            {isCorrect === true && <p className="mt-4 text-soft-green-600 font-semibold">Correct! Well done.</p>}
                            {isCorrect === false && <p className="mt-4 text-red-500 font-semibold">Not quite. The correct answer was: {lesson.answer}</p>}
                        </div>
                    ) : (
                         <div className="text-center text-slate-500 py-24">Could not load lesson. Please try again.</div>
                    )}
                </Card>
            </div>
        </>
    );
};
