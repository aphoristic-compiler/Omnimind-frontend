'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BotSortingAnimation } from '@/components/login/bot-sorting-animation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && !email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp 
        ? { username: username.trim(), email: email.trim(), password: password.trim() }
        : { username: username.trim(), password: password.trim() };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server error. Please try again later.');
      }

      if (!response.ok) {
        // Handle different error formats from FastAPI
        const errorMessage = typeof data?.detail === 'string' 
          ? data.detail 
          : typeof data?.message === 'string'
            ? data.message
            : Array.isArray(data?.detail)
              ? data.detail.map((e: { msg?: string }) => e.msg || e).join(', ')
              : 'Authentication failed. Please try again.';
        throw new Error(errorMessage);
      }

      // Save the JWT token from the backend
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', username.trim());

      toast({
        title: isSignUp ? 'Account created!' : 'Welcome back!',
        description: `${isSignUp ? 'Signed up' : 'Logged in'} as ${username}`,
      });

      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      toast({
        title: isSignUp ? 'Sign Up Error' : 'Login Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-background">
      {/* Left side - Bot Animation */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <BotSortingAnimation />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center relative">
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loginGrid)" />
          </svg>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 z-20 text-foreground/60 hover:text-foreground transition-colors duration-300 flex items-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Mobile brand */}
        <div className="absolute top-6 right-6 lg:hidden">
          <h2 className="text-lg font-display text-foreground/90">OmniMind</h2>
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-md px-8 py-12">
          <div className="animate-char-in" style={{ animationDelay: '0ms' }}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-display mb-3 text-foreground">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-foreground/60 text-sm">
                {isSignUp
                  ? 'Join OmniMind and start managing your knowledge'
                  : 'Sign in to access your knowledge hub'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mb-6">
              {/* Username Input */}
              <div className="space-y-2 animate-char-in" style={{ animationDelay: '50ms' }}>
                <label htmlFor="username" className="block text-sm font-medium text-foreground/80">
                  Username{!isSignUp && ' or Email'}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isSignUp ? 'Choose a username' : 'Enter your username or email'}
                  className="w-full px-4 py-3 bg-secondary/50 border border-foreground/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 hover:border-foreground/20"
                  disabled={isLoading}
                />
              </div>

              {/* Email Input - Only show for sign up */}
              {isSignUp && (
                <div className="space-y-2 animate-char-in" style={{ animationDelay: '75ms' }}>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-secondary/50 border border-foreground/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 hover:border-foreground/20"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-2 animate-char-in" style={{ animationDelay: '100ms' }}>
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-secondary/50 border border-foreground/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 hover:border-foreground/20"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-char-in">
                  {error}
                </div>
              )}

              {/* Remember me / Forgot password */}
              {!isSignUp && (
                <div className="flex items-center justify-between text-sm animate-char-in" style={{ animationDelay: '150ms' }}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-foreground/20 accent-primary" />
                    <span className="text-foreground/60">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-primary/80 hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim() || (isSignUp && !email.trim())}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 h-12 font-medium group animate-char-in"
                style={{ animationDelay: '200ms' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>



            {/* Toggle Sign Up / Sign In */}
            <div className="text-center text-sm text-foreground/60 mt-8 animate-char-in" style={{ animationDelay: '260ms' }}>
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Create one
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-foreground/30">
          <span>Privacy Policy</span>
          <span>|</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </main>
  );
}
