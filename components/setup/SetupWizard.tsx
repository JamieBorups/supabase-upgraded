
import React from 'react';

const SetupWizard: React.FC = () => {
    
    const handleReload = () => {
        window.location.reload();
    };

    const EnvVar: React.FC<{name: string}> = ({ name }) => (
        <code className="bg-slate-200 text-slate-800 font-mono py-1 px-2 rounded-md text-sm">{name}</code>
    )

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg p-8">
                <div className="text-center">
                     <i className="fa-solid fa-cogs text-6xl text-teal-500"></i>
                    <h1 className="text-3xl font-bold text-slate-900 mt-4">Application Configuration Required</h1>
                    <p className="text-slate-600 mt-2">
                        Welcome to The Arts Incubator! To get started, you need to configure the required environment variables.
                    </p>
                </div>

                <div className="mt-8 space-y-6 text-left bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">Instructions:</h2>
                    <p className="text-slate-700">This application requires three environment variables to be set in its hosting environment to function correctly. You will need to get these keys from their respective services.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">1. Supabase Credentials (for the database)</h3>
                            <ul className="list-disc list-inside space-y-2 mt-2 pl-4 text-sm text-slate-600">
                                <li>Go to your Supabase project dashboard, then <code>Project Settings</code> {'>'} <code>API</code>.</li>
                                <li>Set the <EnvVar name="SUPABASE_URL" /> variable to your Project URL.</li>
                                <li>Set the <EnvVar name="SUPABASE_ANON_KEY" /> variable to your public <strong>anon key</strong>.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">2. Google Gemini API Key (for AI features)</h3>
                             <ul className="list-disc list-inside space-y-2 mt-2 pl-4 text-sm text-slate-600">
                                <li>Go to the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold hover:underline">Google AI Studio</a> to get your API key.</li>
                                <li>Set the <EnvVar name="API_KEY" /> variable to your generated Google Gemini API key.</li>
                            </ul>
                        </div>
                    </div>
                     <p className="text-xs text-slate-500 mt-4"><strong>Note:</strong> How you set environment variables depends on your hosting provider (e.g., Vercel, Netlify, a custom server). Please consult their documentation.</p>
                </div>
                
                 <div className="mt-8">
                    <button onClick={handleReload} className="w-full px-6 py-3 text-lg font-semibold text-white bg-teal-600 rounded-md shadow-lg hover:bg-teal-700">
                        <i className="fa-solid fa-sync-alt mr-2"></i>
                        I've set the environment variables, reload now!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;