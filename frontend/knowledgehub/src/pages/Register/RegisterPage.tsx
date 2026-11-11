import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { BackendStatusBanner } from '../../components/common/BackendStatusBanner';
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Mail,
  Zap,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const msg = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      setSuccessMessage(msg || 'Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex flex-col text-[#F3F4F6]">
      <BackendStatusBanner />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Product Statement */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0E1217] border-r border-[#222733] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Logo size="lg" />
          </div>

          {/* Center Brand Statement */}
          <div className="relative z-10 max-w-md space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Build Your Personal Knowledge Base</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Architect your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-300 to-sky-400">
                  learning journey.
                </span>
              </h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Join KnowledgeHub to capture insights, organize technical documentation, track active learning progress, and retain critical concepts forever.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F3F4F6]">One-Click Quick Capture</h4>
                  <p className="text-xs text-[#64748B]">Auto-detect URLs, markdown formatting, and smart tagging.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F3F4F6]">Structured Topic Trees</h4>
                  <p className="text-xs text-[#64748B]">Group knowledge cleanly across frameworks, languages, and patterns.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-xs text-[#64748B] flex items-center justify-between border-t border-[#1E232D] pt-4">
            <span>Spring Boot REST API</span>
            <span className="font-mono text-[11px]">v1.0.0</span>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-2 lg:hidden">
              <Logo size="md" className="mb-2" />
            </div>

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Create your account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#94A3B8]">
                Start building your developer knowledge workspace.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-[#11151B] p-6 sm:p-7 rounded-xl border border-[#222733] shadow-xl">
              {error && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Alex Developer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@knowledgehub.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Password"
                    isPassword
                    placeholder="••••••••"
                    helperText="Must be at least 8 characters long."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Confirm Password"
                    isPassword
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#222733]" />
                  </div>
                  <div className="relative flex justify-center text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                    <span className="bg-[#11151B] px-2">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => alert('Social OAuth can be linked via Spring Security')}
                    leftIcon={<Code2 className="w-3.5 h-3.5 text-indigo-400 mr-1" />}
                  >
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => alert('Google OAuth can be linked via Spring Security')}
                    leftIcon={<Mail className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                  >
                    Google
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom link */}
            <p className="text-center text-xs sm:text-sm text-[#94A3B8]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

