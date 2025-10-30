import { openDB, IDBPDatabase } from 'idb';
import { UserProfile, Transaction, RecurringExpense, SavingsGoal, Bill, UserSettings, Asset, Liability, ForumPost, Challenge, Badge, Investment, SplitExpense, StoredDocument, LinkedAccount } from '../types';
import { TRANSACTIONS, INITIAL_BILLS, INITIAL_ASSETS, INITIAL_LIABILITIES, INITIAL_FORUM_POSTS, INITIAL_CHALLENGES, EARNED_BADGES, INITIAL_INVESTMENTS, INITIAL_SPLIT_EXPENSES } from '../constants';


const DB_NAME = 'SmartFinanceDB';
const DB_VERSION = 1;

const STORES = [
    'userProfile', 'settings', 'transactions', 'recurringExpenses', 
    'savingsGoals', 'bills', 'assets', 'liabilities', 'forumPosts', 
    'challenges', 'badges', 'investments', 'splitExpenses', 
    'documents', 'linkedAccounts'
];

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
    if (dbPromise) return dbPromise;

    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            STORES.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    if (['userProfile', 'settings'].includes(storeName)) {
                         db.createObjectStore(storeName);
                    } else {
                         db.createObjectStore(storeName, { keyPath: 'id' });
                    }
                }
            });
        },
    });
    return dbPromise;
};

// Generic store interaction functions
const getAllFromDB = async <T>(storeName: string): Promise<T[]> => {
    const db = await initDB();
    return db.getAll(storeName);
};

const getFromDB = async <T>(storeName: string, key: string | number): Promise<T | undefined> => {
    const db = await initDB();
    return db.get(storeName, key);
};

const addToDB = async <T>(storeName: string, value: T, key?: string | number): Promise<any> => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.add(value, key);
    return tx.done;
};

const putToDB = async <T>(storeName: string, value: T, key?: string | number): Promise<any> => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.put(value, key);
    return tx.done;
};

const removeFromDB = async (storeName: string, key: string | number): Promise<any> => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.delete(key);
    return tx.done;
};

// Seed initial data if stores are empty
export const seedInitialData = async () => {
    const db = await initDB();
    const txCount = await db.count('transactions');
    if (txCount === 0) {
        console.log('Seeding initial database...');
        const tx = db.transaction(STORES, 'readwrite');
        const seedPromises: Promise<any>[] = [];

        TRANSACTIONS.forEach(item => seedPromises.push(tx.objectStore('transactions').add(item)));
        INITIAL_BILLS.forEach(item => seedPromises.push(tx.objectStore('bills').add(item)));
        INITIAL_ASSETS.forEach(item => seedPromises.push(tx.objectStore('assets').add(item)));
        INITIAL_LIABILITIES.forEach(item => seedPromises.push(tx.objectStore('liabilities').add(item)));
        INITIAL_FORUM_POSTS.forEach(item => seedPromises.push(tx.objectStore('forumPosts').add(item)));
        INITIAL_CHALLENGES.forEach(item => seedPromises.push(tx.objectStore('challenges').add(item)));
        EARNED_BADGES.forEach(item => seedPromises.push(tx.objectStore('badges').add(item)));
        INITIAL_INVESTMENTS.forEach(item => seedPromises.push(tx.objectStore('investments').add(item)));
        INITIAL_SPLIT_EXPENSES.forEach(item => seedPromises.push(tx.objectStore('splitExpenses').add(item)));
        
        seedPromises.push(tx.objectStore('settings').put({ theme: 'dark', currency: 'USD', travelMode: false, goalAutomation: false, notifications: { dailySummary: true, billReminders: true, budgetAlerts: true } }, 'userSettings'));
        
        await Promise.all(seedPromises);
        await tx.done;
        console.log('Database seeded.');
    }
};

// Export specific functions for each store
export const db = {
    // UserProfile
    getUserProfile: () => getFromDB<UserProfile>('userProfile', 'main'),
    putUserProfile: (profile: UserProfile) => putToDB('userProfile', profile, 'main'),
    
    // Settings
    getSettings: () => getFromDB<UserSettings>('settings', 'userSettings'),
    putSettings: (settings: UserSettings) => putToDB('settings', settings, 'userSettings'),

    // Generic list functions
    getAll: <T>(storeName: string) => getAllFromDB<T>(storeName),
    add: <T>(storeName: string, item: T) => addToDB(storeName, item),
    put: <T>(storeName: string, item: T) => putToDB(storeName, item),
    delete: (storeName: string, id: string | number) => removeFromDB(storeName, id),

    // Clear all data
    deleteAllData: async () => {
        const db = await initDB();
        const tx = db.transaction(STORES, 'readwrite');
        const clearPromises = STORES.map(store => tx.objectStore(store).clear());
        await Promise.all(clearPromises);
        await tx.done;
    },
};