import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { teacherService } from '../../services/teacher.service';
import type { Subject } from '../../types';

interface SubjectSelectorProps {
  value: string;
  onChange: (subjectName: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

const COMMON_SUBJECTS = [
  'FSD',
  'DBMS',
  'Java',
  'Python',
  'Operating System',
  'Computer Networks'
];

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
  const [searchTerm, setSearchTerm] = useState(value || '');

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

  // Sync internal searchTerm with value when value changes externally
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Fetch subjects from database
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const res = await teacherService.getSubjects();
        const data: Subject[] = res.data || [];
        setSubjects(data);
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Combine database subjects with common subjects, ensuring deduplication
  const getSuggestions = () => {
    const suggestionsSet = new Set<string>();

    // Add common subjects first
    COMMON_SUBJECTS.forEach((sub) => suggestionsSet.add(sub));

    // Add fetched subjects
    subjects.forEach((s) => {
      if (s.subjectName) {
        const formatted = s.subjectCode ? `${s.subjectCode} - ${s.subjectName}` : s.subjectName;
        suggestionsSet.add(formatted);
      }
    });

    return Array.from(suggestionsSet);
  };

  const suggestions = getSuggestions();

  // Filter suggestions based on what's typed
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setSearchTerm(opt);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input container simulating a searchable combobox */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Select or type a subject..."
          className={`w-full bg-white dark:bg-[#1E293B] border focus:outline-none rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors cursor-text ${
            error ? 'border-red-500' : 'border-[var(--brand-border)] focus:border-[#6C1D5F]'
          }`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl shadow-xl p-2 space-y-1 animate-slide-up max-h-[250px] overflow-y-auto flex flex-col">
          {loading && subjects.length === 0 ? (
            <div className="text-center py-4 text-xs text-[var(--text-secondary)]">
              Loading suggestions...
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-4 text-xs text-[var(--text-secondary)]">
              No matching suggestions. Type to use "{searchTerm}"
            </div>
          ) : (
            filteredSuggestions.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#6C1D5F10] text-[#6C1D5F] dark:text-purple-400 font-bold'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  <BookOpen size={13} className={isSelected ? 'text-[#6C1D5F] dark:text-purple-400' : 'text-[var(--text-secondary)]'} />
                  <span className="truncate">{opt}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
