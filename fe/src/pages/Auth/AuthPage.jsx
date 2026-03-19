import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {/* Header với tabs */}
          <div className="flex bg-slate-800/70 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}