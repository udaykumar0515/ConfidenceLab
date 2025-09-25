import React, { useState } from 'react';
import { UserCircle2, BookOpen, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, name: email.split('@')[0] });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute animate-pulse top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute animate-pulse delay-100 top-40 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute animate-pulse delay-200 bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 w-full max-w-md relative transform hover:scale-105 transition-transform duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <UserCircle2 className="w-20 h-20 text-indigo-600 mb-4 animate-bounce" />
            <Sparkles className="absolute -right-2 -top-2 w-6 h-6 text-yellow-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Student!</h1>
          <p className="text-gray-600 mt-2 text-center flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Practice interviews with AI-powered feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="transform transition-all duration-200 hover:scale-105">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50 p-3 transition-colors duration-200 hover:bg-gray-50"
              placeholder="your.email@school.edu"
              required
            />
          </div>

          <div className="transform transition-all duration-200 hover:scale-105">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50 p-3 transition-colors duration-200 hover:bg-gray-50"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Start Your Practice Journey
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Ready to ace your interviews? Let's get started! 🚀
        </div>
      </div>
    </div>
  );
}

export default Login;