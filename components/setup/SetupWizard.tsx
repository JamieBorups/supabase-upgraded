
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
                        Welcome to The Arts Incubator! To get started, you need to configure the required environment variables in your hosting platform (e.g., Vercel, Netlify).
                    </p>
                </div>

                <div className="mt-8 space-y-6 text-left bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">Configuration Steps</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">1. Set Database Credentials</h3>
                            <p className="text-sm text-slate-600 mb-2">The app uses Supabase for data storage. If you don't have a project, create one at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold hover:underline">supabase.com</a>.</p>
                             <ol className="list-decimal list-inside space-y-2 mt-2 pl-4 text-sm text-slate-600">
                                <li>In your Supabase project, go to <strong>Project Settings</strong> (gear icon) &gt; <strong>API</strong>.</li>
                                <li>Find and copy the <strong>Project URL</strong> and the public <strong>`anon` key</strong>.</li>
                                <li>In your hosting provider's settings, add these two environment variables:
                                   <ul className="list-disc list-inside ml-5 mt-1">
                                        <li><EnvVar name="SUPABASE_URL" />: Your Project URL</li>
                                        <li><EnvVar name="SUPABASE_ANON_KEY" />: Your `anon` key</li>
                                   </ul>
                                </li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-800">2. Set Google AI API Key</h3>
                            <p className="text-sm text-slate-600 mb-2">AI features are powered by Google Gemini. This key is required for the app to function.</p>
                             <ol className="list-decimal list-inside space-y-2 mt-2 pl-4 text-sm text-slate-600">
                                <li>Go to the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold hover:underline">Google AI Studio</a> to get your API key.</li>
                                <li>In your hosting provider's settings, add this environment variable:
                                     <ul className="list-disc list-inside ml-5 mt-1">
                                        <li><EnvVar name="API_KEY" />: Your Google Gemini API key</li>
                                   </ul>
                                </li>
                            </ol>
                        </div>
                         <div>
                            <h3 className="font-semibold text-slate-800">3. Redeploy Your Application</h3>
                            <p className="text-sm text-slate-600">After setting the environment variables, you must <strong>redeploy your application</strong> for the changes to take effect.</p>
                        </div>
                    </div>
                </div>
                
                 <div className="mt-8">
                    <button onClick={handleReload} className="w-full px-6 py-3 text-lg font-semibold text-white bg-teal-600 rounded-md shadow-lg hover:bg-teal-700">
                        <i className="fa-solid fa-sync-alt mr-2"></i>
                        I've redeployed with the variables, reload now!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
