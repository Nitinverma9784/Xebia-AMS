import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--brand-surface)] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--brand-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B5AD] to-[#00998F] flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Learning Management System</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">Xebia LMS</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] cursor-pointer transition-colors"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#00B5AD]/10 to-[#2563EB]/10 blur-2xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00B5AD] to-[#00998F] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <GraduationCap size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-4">
          Xebia <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B5AD] to-[#2563EB]">LMS</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-md mx-auto mb-10 leading-relaxed">
          A unified learning management system for teachers and students to collaborate on assignments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <Link
            to="/teacher/login"
            className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl hover:border-[#00B5AD] hover:shadow-lg transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00B5AD] to-[#00998F] flex items-center justify-center shadow-sm">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] group-hover:text-[#00B5AD] transition-colors">Teacher Portal</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Create & grade assignments</p>
            </div>
          </Link>

          <Link
            to="/student/login"
            className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl hover:border-[#2563EB] hover:shadow-lg transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0B7F76] flex items-center justify-center shadow-sm">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] group-hover:text-[#2563EB] transition-colors">Student Portal</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">View & submit assignments</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[var(--text-secondary)] border-t border-[var(--brand-border)]">
        © 2026 Xebia LMS — Built with ❤️
      </footer>
    </div>
  );
};
