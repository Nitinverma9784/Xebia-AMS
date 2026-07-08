import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  LogOut,
  X,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  role: 'teacher' | 'student';
  isMobileOpen: boolean;
  onClose: () => void;
}

const teacherNav: NavItem[] = [
  { to: '/teacher/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/teacher/batches', icon: <Users size={18} />, label: 'Batches' },
  { to: '/teacher/assignments', icon: <FileText size={18} />, label: 'Assignments' },
  { to: '/teacher/quizzes', icon: <HelpCircle size={18} />, label: 'Quiz' },
  { to: '/teacher/submitted', icon: <ClipboardList size={18} />, label: 'Submitted' },
  { to: '/teacher/profile', icon: <User size={18} />, label: 'Profile' },
];

const studentNav: NavItem[] = [
  { to: '/student/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/student/assignments', icon: <BookOpen size={18} />, label: 'Assignments' },
  { to: '/student/quizzes', icon: <HelpCircle size={18} />, label: 'Quiz' },
  { to: '/student/progress', icon: <TrendingUp size={18} />, label: 'Learning Progress' },
  { to: '/student/profile', icon: <User size={18} />, label: 'Profile' },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, isMobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = role === 'teacher' ? teacherNav : studentNav;
  const portalLabel = role === 'teacher' ? 'Teacher Portal' : 'Student Portal';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-white dark:bg-[#0F172A]
          border-r border-[var(--brand-border)]
          flex flex-col
          sidebar-transition
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo - Exact same brand gradient for both portals */}
        <div className="bg-gradient-to-br from-[#6C1D5F] to-[#84117C] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70">Xebia LMS</p>
                <p className="text-sm font-bold text-white">{portalLabel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-white/70 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-[#6C1D5F] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--text-primary)]'
                }
              `}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile at bottom */}
        <div className="p-3 border-t border-[var(--brand-border)]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C1D5F] to-[#84117C] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
