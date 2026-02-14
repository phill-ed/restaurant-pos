'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, users } = usePOS();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      router.push('/dashboard');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handlePinClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        setTimeout(() => {
          if (login(newPin)) {
            router.push('/dashboard');
          } else {
            setError('Invalid PIN. Please try again.');
            setPin('');
          }
        }, 200);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Restaurant POS</h1>
          <p className="text-slate-400">Enter your PIN to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50">
          {/* PIN Display */}
          <div className="mb-6">
            <div className="flex justify-center gap-3 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-colors ${
                    pin.length > i ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            {error && (
              <p className="text-center text-red-400 text-sm">{error}</p>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'C'].map((digit, i) => (
              <button
                key={i}
                onClick={() => {
                  if (digit === 'C') {
                    handleClear();
                  } else if (digit) {
                    handlePinClick(digit);
                  }
                }}
                disabled={!digit}
                className={`
                  h-14 rounded-xl text-xl font-semibold transition-all
                  ${digit === 'C' 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : digit
                      ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
                      : 'bg-transparent'
                  }
                  disabled:opacity-0 disabled:cursor-not-allowed
                `}
              >
                {digit === 'C' ? <Lock size={20} /> : digit}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Users */}
        <div className="mt-6 bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <p className="text-sm text-slate-400 mb-3">Demo Accounts (PIN):</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="capitalize">{user.role}:</span>
                <span className="font-mono text-emerald-400">{user.pin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
