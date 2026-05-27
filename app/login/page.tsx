'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BotSortingAnimation } from '@/components/login/bot-sorting-animation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
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

    try {
      setIsLoading(true);
      
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Authentication failed');
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
              {/* Username/Email Input */}
              <div className="space-y-2 animate-char-in" style={{ animationDelay: '50ms' }}>
                <label htmlFor="username" className="block text-sm font-medium text-foreground/80">
                  Username or Email
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-secondary/50 border border-foreground/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 hover:border-foreground/20"
                  disabled={isLoading}
                />
              </div>

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
                disabled={isLoading || !username.trim() || !password.trim()}
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

            {/* Divider */}
            <div className="relative my-6 animate-char-in" style={{ animationDelay: '220ms' }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-foreground/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-4 text-foreground/40">or continue with</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3 animate-char-in" style={{ animationDelay: '240ms' }}>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary/30 border border-foreground/10 rounded-lg hover:bg-secondary/50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm text-foreground/70">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary/30 border border-foreground/10 rounded-lg hover:bg-secondary/50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm text-foreground/70">GitHub</span>
              </button>
            </div>

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
