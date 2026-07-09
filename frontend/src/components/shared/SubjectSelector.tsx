import React, { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, BookOpen, Filter } from 'lucide-react';
import { teacherService } from '../../services/teacher.service';
import type { Subject } from '../../types';

interface SubjectSelectorProps {
  value: string;
  onChange: (subjectName: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  value,
  onChange,
  error,
  label = 'Subject',
  required = false,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch subjects from database
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedSemester) params.semester = selectedSemester;
        if (selectedDepartment) params.department = selectedDepartment;
        
        const res = await teacherService.getSubjects(params);
        const data: Subject[] = res.data || [];
        setSubjects(data);

        // Auto-select if only one subject exists
        if (data.length === 1 && !value) {
          const defaultSub = `${data[0].subjectCode} - ${data[0].subjectName}`;
          onChange(defaultSub);
          localStorage.setItem('lastSelectedSubject', defaultSub);
        } else if (data.length > 1 && !value) {
          // Fallback to last selected subject from localStorage
          const lastSelected = localStorage.getItem('lastSelectedSubject');
          if (lastSelected) {
            const matches = data.some(s => `${s.subjectCode} - ${s.subjectName}` === lastSelected);
            if (matches) {
              onChange(lastSelected);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedSemester, selectedDepartment, onChange, value]);

  // Unique semesters & departments for filter dropdowns
  const semesters = ['All Semesters', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  const departments = ['All Departments', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];

  // Local filter for search text
  const filteredSubjects = subjects.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.subjectName.toLowerCase().includes(term) ||
      s.subjectCode.toLowerCase().includes(term)
    );
  });

  const handleSelect = (s: Subject) => {
    const displayValue = `${s.subjectCode} - ${s.subjectName}`;
    onChange(displayValue);
    localStorage.setItem('lastSelectedSubject', displayValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Toggle Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white dark:bg-[#1E293B] border focus:outline-none rounded-xl py-2.5 px-3.5 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
          error ? 'border-red-500' : 'border-[var(--brand-border)] focus:border-[#EF4444]'
        } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className="truncate text-[var(--text-primary)]">
          {loading ? 'Loading subjects...' : value || 'Select Subject'}
        </span>
        <ChevronDown size={16} className="text-[var(--text-secondary)] shrink-0 ml-2" />
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl shadow-xl p-3 space-y-3 animate-slide-up max-h-[420px] flex flex-col">
          
          {/* Filters Section */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[var(--brand-border)] shrink-0">
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value === 'All Semesters' ? '' : e.target.value)}
                className="w-full pl-2 pr-6 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] rounded-lg text-[var(--text-primary)] cursor-pointer appearance-none focus:outline-none focus:border-[#EF4444]"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value === 'All Departments' ? '' : e.target.value)}
                className="w-full pl-2 pr-6 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] rounded-lg text-[var(--text-primary)] cursor-pointer appearance-none focus:outline-none focus:border-[#EF4444]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] focus:border-[#EF4444] rounded-xl py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-colors"
            />
          </div>

          {/* Scrollable List */}
          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
                {subjects.length === 0 ? 'No Subjects Available' : 'No matching subjects'}
              </div>
            ) : (
              filteredSubjects.map((s) => {
                const displayVal = `${s.subjectCode} - ${s.subjectName}`;
                const isSelected = value === displayVal;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EF444410] text-[#EF4444] dark:text-red-400 font-bold'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <BookOpen size={13} className={isSelected ? 'text-[#EF4444] dark:text-red-400' : 'text-[var(--text-secondary)]'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{s.subjectCode}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] truncate">{s.subjectName}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
