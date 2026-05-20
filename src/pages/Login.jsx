import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('access_token', response.access_token);
      toast.success('Logged in successfully!');
      await checkUserAuth();
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[380px] space-y-6">

        {/* Logo + brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm">
            <img src="/logo.jpg" alt="Chicago Social" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Chicago Social</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Web3 Social Network</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="0xtester or 0xadmin"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-foreground">Demo Credentials</p>
          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">User:</span> 0xtester / 00000000</p>
          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Admin:</span> 0xadmin / 00000000</p>
        </div>

        <p className="text-center text-xs text-muted-foreground">Demo environment with mock data</p>
      </div>
    </div>
  );
}
