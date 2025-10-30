import React from 'react';
import { UserSettings } from '../types';
import { Card } from './Card';
import { SunIcon, MoonIcon, BellIcon, ShieldCheckIcon, GlobeIcon, SparklesIcon } from './Icons';

interface SettingsProps {
    settings: UserSettings;
    setSettings: (settings: UserSettings) => void;
    setView: (view: 'security' | 'goals') => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></span>
    </button>
);

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings, setView }) => {
    
    const handleSettingChange = (updatedSettings: Partial<UserSettings>) => {
        const newSettings = { ...settings, ...updatedSettings };
        setSettings(newSettings);

        // Also update theme on the document
        if(updatedSettings.theme) {
            if (updatedSettings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };
    
    const handleThemeChange = (theme: 'light' | 'dark') => handleSettingChange({ theme });
    const handleNotificationChange = (key: keyof UserSettings['notifications']) => handleSettingChange({ notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => handleSettingChange({ currency: e.target.value as UserSettings['currency'] });
    const handleTravelModeChange = () => handleSettingChange({ travelMode: !settings.travelMode });
    const handleGoalAutomationChange = () => handleSettingChange({ goalAutomation: !settings.goalAutomation });

    return (
        <div className="max-w-4xl mx-auto">
             <div>
                <h2 className="text-3xl font-bold font-heading">Settings</h2>
                <p className="text-muted-foreground text-lg">Customize your SmartFinance experience.</p>
            </div>
            <div className="space-y-8 mt-6">
                <Card>
                    <h3 className="text-xl font-bold font-heading mb-4">Appearance</h3>
                    <div className="space-y-2">
                        <p className="font-medium">Theme</p>
                        <div className="flex gap-2 rounded-lg bg-secondary p-1">
                            <button onClick={() => handleThemeChange('light')} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md transition-colors ${settings.theme === 'light' ? 'bg-card' : ''}`}><SunIcon className="h-5 w-5"/> Light</button>
                            <button onClick={() => handleThemeChange('dark')} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md transition-colors ${settings.theme === 'dark' ? 'bg-card' : ''}`}><MoonIcon className="h-5 w-5"/> Dark</button>
                        </div>
                    </div>
                </Card>
                
                 <Card>
                     <h3 className="text-xl font-bold font-heading mb-4">Automation</h3>
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium flex items-center gap-2"><SparklesIcon className="h-5 w-5"/> Goal-based Budget Automation</p>
                            <p className="text-sm text-muted-foreground">Allow AI to suggest reallocating funds to meet your goals faster.</p>
                        </div>
                        <Toggle checked={settings.goalAutomation} onChange={handleGoalAutomationChange} />
                    </div>
                 </Card>

                 <Card>
                     <h3 className="text-xl font-bold font-heading mb-4">Regional</h3>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="currency" className="font-medium">Currency</label>
                            <select id="currency" value={settings.currency} onChange={handleCurrencyChange} className="w-full mt-1 p-2 rounded-lg bg-input border border-border appearance-none">
                                <option value="USD">USD - United States Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium flex items-center gap-2"><GlobeIcon className="h-5 w-5"/> Travel Mode</p>
                                <p className="text-sm text-muted-foreground">Enables travel-specific AI insights on your dashboard.</p>
                            </div>
                            <Toggle checked={settings.travelMode} onChange={handleTravelModeChange} />
                        </div>
                     </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2"><BellIcon className="h-5 w-5"/> Notifications</h3>
                    <ul className="space-y-3">
                        {Object.entries(settings.notifications).map(([key, value]) => (
                             <li key={key} className="flex justify-between items-center">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <Toggle checked={value} onChange={() => handleNotificationChange(key as keyof UserSettings['notifications'])} />
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5"/> Security & Privacy</h3>
                    <p className="text-muted-foreground mb-4">Manage your account security and control how your data is used.</p>
                    <button onClick={() => setView('security')} className="font-medium text-primary hover:underline">
                        Go to Security & Privacy Center &rarr;
                    </button>
                </Card>
            </div>
        </div>
    );
};