import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('access_token', response.access_token);
      toast.success('Logged in successfully!');
      
      // Re-check auth status and then navigate
      await checkUserAuth();
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
            <img src="/logo.jpg" alt="Chicago Social" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Chicago Social</h1>
          <p className="text-sm text-neutral-500">Web3 Social Network</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., 0xtester or 0xadmin"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-foreground placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-foreground placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg font-semibold bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="space-y-2 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-semibold text-blue-900">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-blue-800">
            <p><span className="font-medium">User:</span> 0xtester / 00000000</p>
            <p><span className="font-medium">Admin:</span> 0xadmin / 00000000</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400">
          This is a demo with mock data
        </p>
      </div>
    </div>
  );
}
