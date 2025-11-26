import React, { useState } from 'react';
import { Bike, LogIn, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { NeoButton } from './NeoButton';
import { NeoCard } from './NeoCard';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <NeoCard className="max-w-md w-full">
        <div className="text-center mb-6">
          <Bike className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-black">MECHANIC LOGIN</h2>
          <p className="text-sm text-gray-600 font-mono">Access your workshop dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
              placeholder="mechanic@workshop.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {(localError || error) && (
            <div className="bg-mk-red/10 border-2 border-mk-red text-mk-red p-3 text-sm font-bold">
              {localError || error}
            </div>
          )}

          <NeoButton fullWidth type="submit" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</>
            ) : (
              <><LogIn className="w-5 h-5" /> LOGIN</>
            )}
          </NeoButton>
        </form>

        {onSwitchToRegister && (
          <div className="mt-4 text-center">
            <button
              onClick={onSwitchToRegister}
              className="text-sm text-gray-600 hover:text-black font-mono flex items-center justify-center gap-1 mx-auto"
            >
              <UserPlus className="w-4 h-4" /> Create new account
            </button>
          </div>
        )}
      </NeoCard>
    </div>
  );
};

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mechanic' as 'customer' | 'mechanic' | 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      // Auto-login after registration
      await login(formData.email, formData.password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <NeoCard className="max-w-md w-full">
        <div className="text-center mb-6">
          <UserPlus className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-black">CREATE ACCOUNT</h2>
          <p className="text-sm text-gray-600 font-mono">Join MotoTrackr</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
              placeholder="John Mukasa"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none bg-white"
            >
              <option value="mechanic">Mechanic</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none pr-12"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-3 border-4 border-black font-mono focus:ring-4 focus:ring-mk-yellow focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-mk-red/10 border-2 border-mk-red text-mk-red p-3 text-sm font-bold">
              {error}
            </div>
          )}

          <NeoButton fullWidth type="submit" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
            ) : (
              <><UserPlus className="w-5 h-5" /> CREATE ACCOUNT</>
            )}
          </NeoButton>
        </form>

        {onSwitchToLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-sm text-gray-600 hover:text-black font-mono flex items-center justify-center gap-1 mx-auto"
            >
              <LogIn className="w-4 h-4" /> Already have an account? Login
            </button>
          </div>
        )}
      </NeoCard>
    </div>
  );
};
