
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { generatePasswordHash } from '../../utils/crypto.ts';
import { Input } from '../ui/Input.tsx';

const LoginScreen: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { settings, users } = state;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!users || users.length === 0) {
            notify('No users found in the database. Please check the initial setup.', 'error');
            setIsLoading(false);
            return;
        }

        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (!user) {
            notify('Invalid username or password.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const enteredPasswordHash = await generatePasswordHash(password);
            if (enteredPasswordHash === user.passwordHash) {
                dispatch({ type: 'SET_CURRENT_USER', payload: user });
                notify(`Welcome, ${user.username}!`, 'success');
            } else {
                notify('Invalid username or password.', 'error');
            }
        } catch (error) {
            notify('An error occurred during login.', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <form
                onSubmit={handleLogin}
                className="bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-lg shadow-2xl text-white border border-white/20"
            >
                <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-center" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {settings.general?.collectiveName || 'The Arts Incubator'}
                </h1>
                <p className="text-center text-slate-200 mt-2 mb-8">Please sign in to continue</p>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-100 mb-2">Username</label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="bg-white/20 border-white/30 text-white placeholder-slate-300 focus:ring-teal-400"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-100 mb-2">Password</label>
                         <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/20 border-white/30 text-white placeholder-slate-300 focus:ring-teal-400"
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-8 py-3 text-lg font-semibold bg-white text-slate-800 rounded-md shadow-lg
                                   hover:bg-slate-200 transition-all duration-300 transform hover:scale-105
                                   focus:outline-none focus:ring-4 focus:ring-white/50
                                   disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                Signing In...
                            </>
                        ) : 'Sign In'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginScreen;
