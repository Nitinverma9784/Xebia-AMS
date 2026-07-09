import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  subject: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export const TeacherLogin: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      const res = await authService.teacherLogin(data);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/teacher/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const onDirectLogin = async () => {
    try {
      const res = await authService.teacherLogin({
        email: 'teacher@school.edu',
        password: 'password'
      });
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/teacher/dashboard');
    } catch (err: any) {
      // Auto-register default account if it doesn't exist
      try {
        const regRes = await authService.teacherRegister({
          name: 'Teacher User',
          email: 'teacher@school.edu',
          password: 'password',
          subject: 'General'
        });
        login(regRes.user, regRes.token);
        toast.success('Direct login account created and authenticated!');
        navigate('/teacher/dashboard');
      } catch (regErr: any) {
        toast.error('Direct login failed.');
      }
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      const res = await authService.teacherRegister(data);
      login(res.user, res.token);
      toast.success(`Account created! Welcome, ${res.user.name}!`);
      navigate('/teacher/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--brand-surface)]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4A1F4F] via-[#511345] to-[#622865] relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Background orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#2563EB]/10 blur-3xl" />

        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto">
            <GraduationCap size={40} className="text-white" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Xebia LMS</p>
            <h1 className="text-4xl font-bold text-white mt-2">Teacher Portal</h1>
            <p className="text-white/70 mt-3 text-lg leading-relaxed">
              Manage assignments, review submissions,<br />and guide your students to success.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {['Create Assignments', 'Review Submissions', 'Grade Students', 'Track Progress'].map((f) => (
              <div key={f} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <ChevronRight size={14} className="text-[#2563EB]" />
                <span className="text-white/80 text-xs font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A1F4F] to-[#622865] flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Xebia LMS</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">Teacher Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-7">
            {isRegister
              ? 'Register as a teacher to get started'
              : 'Sign in to your teacher account'}
          </p>

          {isRegister ? (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Dr. Jane Smith"
                required
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register('name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="teacher@school.edu"
                required
                leftIcon={<Mail size={16} />}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <Input
                label="Subject (Optional)"
                placeholder="e.g. Mathematics, Physics"
                {...registerForm.register('subject')}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                loading={registerForm.formState.isSubmitting}
              >
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="teacher@school.edu"
                required
                leftIcon={<Mail size={16} />}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                loading={loginForm.formState.isSubmitting}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full border-[#4A1F4F] text-[#4A1F4F] hover:bg-[#4A1F4F]/5 mt-2"
                onClick={onDirectLogin}
              >
                Quick Direct Login (Demo)
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); loginForm.reset(); registerForm.reset(); }}
              className="text-sm text-[#4A1F4F] dark:text-purple-400 hover:underline font-medium cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--brand-border)]">
            <p className="text-xs text-center text-[var(--text-secondary)] mb-3">Other Portals</p>
            <Link
              to="/student/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--brand-border)] text-sm text-[var(--text-secondary)] hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
            >
              <BookOpen size={16} />
              Student Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
