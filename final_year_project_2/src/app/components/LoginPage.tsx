import { useState } from 'react';
import {
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Loader2,
  Sparkles,
  Brain,
  Heart,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { supabase } from '../../utils/supabase/client';

interface LoginPageProps {
  onLoginSuccess: (userId: string, email: string) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Login failed');

        onLoginSuccess(data.user.id, data.user.email || '');
      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Signup failed');

        // Insert profile row
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email,
          });

        if (profileError) throw profileError;

        onLoginSuccess(data.user.id, data.user.email || '');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side */}
        <div className="hidden md:block space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-9 h-9 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                MindCare
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                AI-Powered Wellness Companion
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">
              Your Journey to Better Mental Health
            </h2>

            <div className="space-y-4">
              <Feature
                icon={<Sparkles className="w-5 h-5 text-white" />}
                title="AI Emotion Recognition"
                desc="Advanced speech and text analysis to understand your emotional state"
                gradient="from-purple-400 to-purple-600"
              />

              <Feature
                icon={<Heart className="w-5 h-5 text-white" />}
                title="Personalized Support"
                desc="Breathing exercises and motivational guidance"
                gradient="from-blue-400 to-blue-600"
              />

              <Feature
                icon={<Brain className="w-5 h-5 text-white" />}
                title="Track Your Progress"
                desc="Visualize stress patterns and celebrate growth"
                gradient="from-teal-400 to-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <Card className="p-8 shadow-2xl bg-white/90 backdrop-blur-sm border-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to continue'
                : 'Start your wellness journey'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-blue-600"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}