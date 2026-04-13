import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

export default function Login({ setToken }: { setToken: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netscaler-darker p-4">
      <div className="max-w-md w-full bg-netscaler-dark p-8 rounded-lg shadow-2xl border border-netscaler-gray">
        <div className="flex justify-center mb-8">
          <img src="/netscaler_logo.png" alt="NetScaler" className="h-12 object-contain" onError={(e) => {
            e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Citrix_NetScaler_Logo.svg/512px-Citrix_NetScaler_Logo.svg.png';
          }} />
        </div>
        
        <h2 className="text-2xl font-semibold text-center mb-6 text-white">Gateway Monitor</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-netscaler-gray rounded-md leading-5 bg-netscaler-darker text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-netscaler-blue focus:border-netscaler-blue sm:text-sm"
                placeholder="Username"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-netscaler-gray rounded-md leading-5 bg-netscaler-darker text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-netscaler-blue focus:border-netscaler-blue sm:text-sm"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-netscaler-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-netscaler-blue transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
