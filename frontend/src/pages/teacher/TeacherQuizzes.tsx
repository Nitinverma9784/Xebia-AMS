import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Eye, Edit, Trash2, HelpCircle, Upload, 
  ArrowLeft, ArrowUp, ArrowDown, Copy, Settings, Check, 
  AlertTriangle, FileSpreadsheet, Download, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { SubjectSelector } from '../../components/shared/SubjectSelector';
import { teacherService } from '../../services/teacher.service';
import { formatDate, getDueDateCountdown, getDueDateColor } from '../../utils/helpers';
import type { Assignment, PaginationMeta, Question } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllBatches } from '../../store/batchSlice';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Other'];

interface QuizMetadata {
  instructions: string;
  timeLimit: number; // in minutes
  attemptsAllowed: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export const TeacherQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [deleteModal, setDeleteModal] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Split Panel Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [activeCreatorTab, setActiveCreatorTab] = useState<'manual' | 'import'>('manual');

  // Left Panel Form State (Quiz Details)
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizBatchId, setQuizBatchId] = useState('');
  const [quizDueDate, setQuizDueDate] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(30); // default 30 mins
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quizInstructions, setQuizInstructions] = useState('Please answer all questions carefully.');
  const [passingPercentage, setPassingPercentage] = useState(50); // Default 50%

  // Right Panel Builder State (Questions)
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [activeBuilderQuestion, setActiveBuilderQuestion] = useState<any | null>(null);
  const [activeBuilderIndex, setActiveBuilderIndex] = useState<number | null>(null);

  // Assign Batch Modal State
  const [assignModalQuiz, setAssignModalQuiz] = useState<Assignment | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Excel Upload State
  const [isExcelDragging, setIsExcelDragging] = useState(false);
  const excelRef = useRef<HTMLInputElement>(null);

  // Redux Batches
  const { batches } = useAppSelector((s) => s.batch);

  // Fetch batches
  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  // Set default batch selection when batches load
  useEffect(() => {
    if (batches.length > 0 && !quizBatchId) {
      setQuizBatchId(String(batches[0].id));
    }
  }, [batches, quizBatchId]);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await teacherService.getAssignments(params);
      
      const quizList = res.assignments.filter((a: Assignment) => a.assignmentType === 'QUIZ');
      setQuizzes(quizList);
      setPagination({
        ...res.pagination,
        total: quizList.length,
        totalPages: Math.ceil(quizList.length / 10)
      });
    } catch {
      toast.error('Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter, statusFilter, page]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Sync open modal if ?create=1 is present
  useEffect(() => {
    const open = new URLSearchParams(window.location.search).get('create');
    if (open === '1') {
      handleOpenCreateModal();
    }
  }, [batches]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingQuizId(null);
    setQuizTitle('');
    setQuizDescription('');
    setQuizSubject('Mathematics');
    setQuizTopic('');
    setQuizBatchId('');
    setQuizDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // tomorrow
    setQuizTimeLimit(30);
    setQuizAttempts(1);
    setQuizDifficulty('Medium');
    setQuizInstructions('Please answer all questions carefully.');
    setPassingPercentage(50);
    setQuestionsList([]);
    setActiveBuilderQuestion(null);
    setActiveBuilderIndex(null);
    setActiveCreatorTab('manual');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = async (quizItem: Assignment) => {
    setIsEditMode(true);
    setEditingQuizId(quizItem.id);
    setLoading(true);
    try {
      const res = await teacherService.getAssignmentById(quizItem.id);
      const q = res;
      setQuizTitle(q.title || '');
      setQuizDescription(q.description || '');
      setQuizSubject(q.subject || 'Mathematics');
      setQuizTopic(q.topic || '');
      setQuizBatchId(String(q.batchId || ''));
      setQuizDueDate(q.dueDate || '');
      
      // Parse serialized metadata from instructions
      let time = 30;
      let att = 1;
      let diff: 'Easy' | 'Medium' | 'Hard' = 'Medium';
      let inst = q.instructions || '';
      try {
        if (q.instructions && q.instructions.trim().startsWith('{')) {
          const meta = JSON.parse(q.instructions);
          inst = meta.realInstructions || '';
          time = meta.timeLimit || 30;
          att = meta.attemptsAllowed || 1;
          diff = meta.difficulty || 'Medium';
        }
      } catch {}
      
      setQuizTimeLimit(time);
      setQuizAttempts(att);
      setQuizDifficulty(diff);
      setQuizInstructions(inst);
      
      const passPercent = q.totalMarks > 0 ? Math.round((q.passingMarks / q.totalMarks) * 100) : 50;
      setPassingPercentage(passPercent);

      // Parse questions list and their internal text metadata (explanation, etc.)
      const parsedQuestions = (q.questions || []).map((quest: any) => {
        let text = quest.questionText || '';
        let expl = '';
        let neg = 0;
        try {
          if (text.trim().startsWith('{')) {
            const questMeta = JSON.parse(text);
            text = questMeta.text || '';
            expl = questMeta.explanation || '';
            neg = questMeta.negativeMarks || 0;
          }
        } catch {}

        return {
          id: quest.id,
          questionType: quest.questionType || 'MCQ',
          questionText: text,
          optionA: quest.optionA || '',
          optionB: quest.optionB || '',
          optionC: quest.optionC || '',
          optionD: quest.optionD || '',
          correctAnswer: quest.correctAnswer || 'A',
          marks: quest.marks || 2,
          difficulty: quest.difficulty || 'Medium',
          explanation: expl,
          negativeMarks: neg
        };
      });
      
      setQuestionsList(parsedQuestions);
      setActiveBuilderQuestion(null);
      setActiveBuilderIndex(null);
      setActiveCreatorTab('manual');
      setShowCreateModal(true);
    } catch {
      toast.error('Failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    const sp = new URLSearchParams(window.location.search);
    sp.delete('create');
    window.history.replaceState({}, '', `${window.location.pathname}${sp.toString() ? '?' + sp.toString() : ''}`);
  };

  // Reorder actions
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questionsList.length) return;
    const updated = [...questionsList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuestionsList(updated);
    if (activeBuilderIndex === index) {
      setActiveBuilderIndex(targetIndex);
    } else if (activeBuilderIndex === targetIndex) {
      setActiveBuilderIndex(index);
    }
  };

  // Duplicate action
  const duplicateQuestion = (index: number) => {
    const source = questionsList[index];
    const duplicated = {
      ...source,
      id: undefined, // remove DB id to trigger insertion
      questionText: `${source.questionText} (Copy)`
    };
    const updated = [...questionsList];
    updated.splice(index + 1, 0, duplicated);
    setQuestionsList(updated);
    toast.success('Question duplicated');
  };

  // Delete action
  const deleteQuestion = (index: number) => {
    const updated = [...questionsList];
    updated.splice(index, 1);
    setQuestionsList(updated);
    if (activeBuilderIndex === index) {
      setActiveBuilderQuestion(null);
      setActiveBuilderIndex(null);
    } else if (activeBuilderIndex !== null && activeBuilderIndex > index) {
      setActiveBuilderIndex(activeBuilderIndex - 1);
    }
    toast.success('Question deleted');
  };

  // Validation function for imported questions
  const getQuestionErrors = (q: any): string[] => {
    const errors: string[] = [];
    if (!q.questionText || !q.questionText.trim()) {
      errors.push('Question text is required.');
    }
    if (q.questionType === 'MCQ' || q.questionType === 'MSQ') {
      if (!q.optionA || !q.optionA.trim()) errors.push('Option A is required.');
      if (!q.optionB || !q.optionB.trim()) errors.push('Option B is required.');
      if (!q.optionC || !q.optionC.trim()) errors.push('Option C is required.');
      if (!q.optionD || !q.optionD.trim()) errors.push('Option D is required.');
    }
    if (q.questionType === 'TRUE_FALSE') {
      if (!q.optionA || !q.optionA.trim()) errors.push('Option A (True) is required.');
      if (!q.optionB || !q.optionB.trim()) errors.push('Option B (False) is required.');
      const validTF = ['A', 'B', 'TRUE', 'FALSE'];
      if (!q.correctAnswer || !validTF.includes(String(q.correctAnswer).trim().toUpperCase())) {
        errors.push('Correct Answer must be A, B, True, or False.');
      }
    }
    if (q.questionType === 'MCQ') {
      const validOptions = ['A', 'B', 'C', 'D'];
      if (!q.correctAnswer || !validOptions.includes(String(q.correctAnswer).trim().toUpperCase())) {
        errors.push('Correct Answer must be A, B, C, or D.');
      }
    }
    if (q.questionType === 'MSQ') {
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        errors.push('Correct options required.');
      } else {
        const parts = q.correctAnswer.split(',').map((p: string) => p.trim().toUpperCase());
        const invalid = parts.filter((p: string) => !['A', 'B', 'C', 'D'].includes(p));
        if (invalid.length > 0) {
          errors.push('Correct Answers must be selected from options A, B, C, or D (e.g. "A,B").');
        }
      }
    }
    if (!q.marks || isNaN(Number(q.marks)) || Number(q.marks) <= 0) {
      errors.push('Marks must be a positive number.');
    }
    return errors;
  };

  const hasAnyValidationErrors = () => {
    return questionsList.some(q => getQuestionErrors(q).length > 0);
  };

  // Excel Drop Handler
  const handleExcelFile = async (file: File) => {
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Invalid file type. Please upload an Excel file (.xlsx or .xls).');
      return;
    }
    const toastId = toast.loading('Parsing Excel file...');
    try {
      const res = await teacherService.importExcel(file);
      const imported = res.data || [];
      const formatted = imported.map((q: any) => {
        // detection logic inside ExcelParserHelper is already robust, we just clean up
        let type = q.questionType || 'MCQ';
        let optA = q.optionA || '';
        let optB = q.optionB || '';
        
        // detect true false
        if (optA.toLowerCase() === 'true' && optB.toLowerCase() === 'false') {
          type = 'TRUE_FALSE';
        }
        // detect fill in blank
        if (!optA && !optB) {
          type = 'SHORT_ANSWER';
        }

        return {
          questionType: type,
          questionText: q.questionText || '',
          optionA: optA,
          optionB: optB,
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          correctAnswer: q.correctAnswer || 'A',
          marks: q.marks || 2,
          difficulty: q.difficulty || 'Medium',
          explanation: '',
          negativeMarks: 0
        };
      });

      setQuestionsList((prev) => [...prev, ...formatted]);
      toast.success(`Successfully loaded ${formatted.length} questions! Check for errors below.`, { id: toastId });
      setActiveCreatorTab('manual'); // redirect to list preview
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to import Excel file.', { id: toastId });
    }
  };

  const onExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsExcelDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  };

  // Excel template downloader
  const downloadExcelTemplate = async () => {
    try {
      const blob = await teacherService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel template downloaded!');
    } catch {
      toast.error('Failed to download template. Ensure backend is running.');
    }
  };

  // Submit handler (saves draft or publishes)
  const onSubmitQuiz = async (status: 'draft' | 'published') => {
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required.');
      return;
    }
    if (status === 'published' && !quizBatchId) {
      toast.error('Please select a batch to publish the quiz.');
      return;
    }
    if (!quizDueDate) {
      toast.error('Due date is required.');
      return;
    }
    if (questionsList.length === 0) {
      toast.error('Please add or import at least one question.');
      return;
    }
    if (hasAnyValidationErrors()) {
      toast.error('Please fix all question validation errors before saving.');
      return;
    }

    const totalMarks = questionsList.reduce((sum, q) => sum + Number(q.marks || 0), 0);
    const passingMarks = Math.round(totalMarks * (passingPercentage / 100));

    // Serialize custom settings into instructions
    const instructionsData = JSON.stringify({
      realInstructions: quizInstructions,
      timeLimit: quizTimeLimit,
      attemptsAllowed: quizAttempts,
      difficulty: quizDifficulty,
      category: quizTopic || 'Quiz'
    });

    // Format questions and serialize question-level extra metadata
    const questionsPayload = questionsList.map((q) => {
      let finalQuestionText = q.questionText;
      if (q.explanation || q.negativeMarks) {
        finalQuestionText = JSON.stringify({
          text: q.questionText,
          explanation: q.explanation || '',
          negativeMarks: Number(q.negativeMarks || 0)
        });
      }

      return {
        id: q.id,
        questionText: finalQuestionText,
        questionType: q.questionType,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: String(q.correctAnswer).trim(),
        marks: q.marks,
        difficulty: q.difficulty
      };
    });

    const payload = {
      title: quizTitle,
      description: quizDescription,
      instructions: instructionsData,
      assignmentType: 'QUIZ',
      subject: quizSubject,
      topic: quizTopic,
      batchId: quizBatchId,
      maxMarks: totalMarks,
      passingMarks,
      dueDate: quizDueDate,
      dueTime: '23:59:00',
      lateSubmissionAllowed: false,
      maxFileSize: 10485760,
      questions: questionsPayload,
      status: status === 'published' ? 'published' : 'draft'
    };

    const loadingToast = toast.loading(isEditMode ? 'Updating quiz...' : 'Creating quiz...');

    try {
      if (isEditMode && editingQuizId) {
        await teacherService.updateAssignment(editingQuizId, payload as any);
        toast.success('Quiz updated successfully!', { id: loadingToast });
      } else {
        await teacherService.createAssignment(payload as any);
        toast.success(status === 'published' ? 'Quiz published successfully!' : 'Quiz saved as draft!', { id: loadingToast });
      }
      handleCloseCreateModal();
      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save quiz.', { id: loadingToast });
    }
  };

  const handleAssignBatch = async () => {
    if (!assignModalQuiz) return;
    if (selectedBatchIds.length === 0) {
      toast.error('Please select at least one batch.');
      return;
    }
    setAssigning(true);
    try {
      await teacherService.assignBatch(assignModalQuiz.id, selectedBatchIds);
      toast.success('Quiz assigned successfully!');
      setAssignModalQuiz(null);
      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign quiz to batches.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await teacherService.deleteAssignment(deleteModal.id);
      toast.success('Quiz deleted.');
      setDeleteModal(null);
      fetchQuizzes();
    } catch {
      toast.error('Failed to delete quiz.');
    } finally {
      setDeleting(false);
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <Layout role="teacher" title="Quizzes" subtitle="Manage online quizzes and analyze results">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search quizzes..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#6C1D5F] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap">
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            {SUBJECTS.map((s) => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenCreateModal}
          >
            New Quiz
          </Button>
        </div>
      </div>

      {/* Main Quizzes Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Quiz Title', 'Subject', 'Due Date', 'Students', 'Submitted', 'Pending', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon="help-circle"
                      title="No quizzes found"
                      description="Create an online quiz or upload a questions Excel file to get started."
                      action={{ label: 'Create Quiz', onClick: handleOpenCreateModal }}
                    />
                  </td>
                </tr>
              ) : (
                quizzes.map((a) => (
                  <tr key={a.id} className="table-row-hover">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <HelpCircle size={13} className="text-[#01AC9F] dark:text-teal-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-[var(--text-primary)] max-w-[180px] truncate">{a.title}</span>
                          <span className="self-start text-[9px] uppercase font-black text-[#01AC9F] dark:text-teal-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded mt-0.5">Quiz</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{a.subject}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-[var(--text-primary)]">{formatDate(a.dueDate)}</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${getDueDateColor(a.dueDate)}`}>
                        {getDueDateCountdown(a.dueDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.totalStudents ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.submittedCount ?? 0}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.pendingCount ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={a.status as any} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/teacher/submitted?tab=quizzes&assignment=${a.id}`}
                          title="View Results"
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-teal-50 hover:text-[#01AC9F] dark:hover:bg-teal-500/10 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        {a.status === 'draft' && (
                          <button
                            onClick={() => {
                              setAssignModalQuiz(a);
                              setSelectedBatchIds([]);
                            }}
                            title="Assign Batch"
                            className="p-1.5 rounded-lg text-[var(--brand-primary)] text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors cursor-pointer"
                          >
                            <Plus size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(a)}
                          title="Edit Quiz"
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteModal(a)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && quizzes.length > 0 && (
          <div className="border-t border-[var(--brand-border)] px-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Redesigned Full Screen Split Panel Creator Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title={isEditMode ? 'Edit Quiz Workspace' : 'New Quiz Workspace'}
        size="xl"
      >
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 select-none">
          
          {/* ==================== LEFT COLUMN: Quiz Details ==================== */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="border-b border-[var(--brand-border)] pb-2 mb-1">
              <h3 className="text-xs font-bold text-[#6C1D5F] dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings size={14} /> 1. Quiz Settings
              </h3>
            </div>
            
            <Input label="Quiz Title" placeholder="e.g. Midterm Physics Evaluation" required value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
            <Textarea label="Description" placeholder="Enter short quiz description..." rows={2} value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} />
            
            <Select
              label="Subject"
              value={quizSubject}
              onChange={(e) => setQuizSubject(e.target.value)}
              options={SUBJECTS.filter(s => s !== 'All').map(s => ({ value: s, label: s }))}
            />

            <Input label="Topic / Category" placeholder="e.g. Gravitation" value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} />

            <Select
              label="Target Batch (Optional)"
              value={quizBatchId}
              onChange={(e) => setQuizBatchId(e.target.value)}
              options={[
                { value: '', label: 'Save as Draft (No Batch)' },
                ...(batches || []).map(b => ({ value: String(b.id), label: b.batchName }))
              ]}
            />

            <Input label="Due Date" type="date" min={todayDate} required value={quizDueDate} onChange={(e) => setQuizDueDate(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Time Limit (Mins)" type="number" min={5} value={String(quizTimeLimit)} onChange={(e) => setQuizTimeLimit(Number(e.target.value))} />
              <Input label="Attempts Allowed" type="number" min={1} value={String(quizAttempts)} onChange={(e) => setQuizAttempts(Number(e.target.value))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Difficulty Level"
                value={quizDifficulty}
                onChange={(e) => setQuizDifficulty(e.target.value as any)}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' }
                ]}
              />
              <Input label="Passing Marks (%)" type="number" min={10} max={100} value={String(passingPercentage)} onChange={(e) => setPassingPercentage(Number(e.target.value))} />
            </div>

            <Textarea label="Instructions" placeholder="Specific instructions for candidates..." rows={2} value={quizInstructions} onChange={(e) => setQuizInstructions(e.target.value)} />

            {/* Calculations Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[var(--brand-border)]">
              <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                <span>Total Questions:</span>
                <span className="font-bold text-[var(--text-primary)]">{questionsList.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mt-1.5">
                <span>Total Marks:</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {questionsList.reduce((sum, q) => sum + Number(q.marks || 0), 0)} pts
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mt-1.5">
                <span>Passing Mark:</span>
                <span className="font-bold text-[#01AC9F]">
                  {Math.round(questionsList.reduce((sum, q) => sum + Number(q.marks || 0), 0) * (passingPercentage / 100))} pts ({passingPercentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: Question Builder ==================== */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Header Tabs */}
            <div className="flex border-b border-[var(--brand-border)] mb-4">
              <button
                type="button"
                onClick={() => setActiveCreatorTab('manual')}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeCreatorTab === 'manual' 
                    ? 'border-[#6C1D5F] text-[#6C1D5F] dark:text-purple-400' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Questions List ({questionsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCreatorTab('import')}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCreatorTab === 'import' 
                    ? 'border-[#6C1D5F] text-[#6C1D5F] dark:text-purple-400' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileSpreadsheet size={13} /> Excel Import
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="space-y-4 mt-2">
              {activeCreatorTab === 'manual' ? (
                <>
                  {/* Button to add new question manually */}
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-xs text-[var(--text-secondary)]">Create, edit, duplicate, and reorder questions.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => {
                        setActiveBuilderQuestion({
                          questionType: 'MCQ',
                          questionText: '',
                          optionA: '',
                          optionB: '',
                          optionC: '',
                          optionD: '',
                          correctAnswer: 'A',
                          marks: 2,
                          difficulty: 'Medium',
                          explanation: '',
                          negativeMarks: 0
                        });
                        setActiveBuilderIndex(null);
                      }}
                    >
                      Add Question
                    </Button>
                  </div>

                  {questionsList.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-[var(--brand-border)] rounded-2xl">
                      <HelpCircle className="mx-auto mb-2 text-[var(--text-secondary)] animate-bounce" size={26} />
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Workspace Empty</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Start by adding a question manually or import from Excel tab.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questionsList.map((q, idx) => {
                        const errs = getQuestionErrors(q);
                        const isInvalid = errs.length > 0;
                        const isCurrentlyEditing = activeBuilderIndex === idx;

                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border relative transition-all ${
                              isInvalid 
                                ? 'bg-red-500/5 border-red-300 dark:border-red-900/40' 
                                : isCurrentlyEditing 
                                  ? 'bg-[#6C1D5F]/5 border-[#6C1D5F]/40' 
                                  : 'bg-white dark:bg-slate-800/10 border-[var(--brand-border)]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-[var(--text-secondary)]">
                                    {idx + 1}
                                  </span>
                                  {q.questionText}
                                </p>

                                {/* MCQ/MSQ options grid */}
                                {(q.questionType === 'MCQ' || q.questionType === 'MSQ') && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 pl-6">
                                    {['A', 'B', 'C', 'D'].map((optKey) => {
                                      const val = q[`option${optKey}`];
                                      const isCorrect = q.questionType === 'MSQ' 
                                        ? String(q.correctAnswer).split(',').map((p: string) => p.trim()).includes(optKey)
                                        : q.correctAnswer === optKey;

                                      return (
                                        <p key={optKey} className={`text-[10px] px-2.5 py-1.5 rounded-lg border ${
                                          isCorrect 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                                            : 'border-[var(--brand-border)] text-[var(--text-secondary)]'
                                        }`}>
                                          <strong>{optKey}:</strong> {val || '—'}
                                        </p>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* True/False display */}
                                {q.questionType === 'TRUE_FALSE' && (
                                  <div className="flex gap-4 mt-2.5 pl-6">
                                    {['A', 'B'].map((optKey) => {
                                      const val = optKey === 'A' ? (q.optionA || 'True') : (q.optionB || 'False');
                                      const isCorrect = String(q.correctAnswer).trim().toUpperCase() === optKey || String(q.correctAnswer).trim().toUpperCase() === val.toUpperCase();
                                      return (
                                        <p key={optKey} className={`text-[10px] px-2.5 py-1.5 rounded-lg border ${
                                          isCorrect 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                                            : 'border-[var(--brand-border)] text-[var(--text-secondary)]'
                                        }`}>
                                          <strong>{optKey === 'A' ? 'True' : 'False'}:</strong> {val}
                                        </p>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Short answer display */}
                                {q.questionType === 'SHORT_ANSWER' && (
                                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 pl-6">
                                    Correct text matching: <span className="font-bold text-emerald-600">{q.correctAnswer}</span>
                                  </p>
                                )}

                                {/* Warning log */}
                                {isInvalid && (
                                  <div className="mt-2.5 pl-6 flex items-start gap-1.5 text-[10px] text-red-500 font-semibold bg-red-500/5 p-2 rounded-lg">
                                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                      {errs.map((e, idxE) => <p key={idxE}>• {e}</p>)}
                                    </div>
                                  </div>
                                )}

                                {/* Question settings footer details */}
                                <div className="flex gap-3 pl-6 mt-3 text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                                  <span>{q.marks} Marks</span>
                                  <span>•</span>
                                  <span className={
                                    q.difficulty === 'Easy' ? 'text-emerald-600' :
                                    q.difficulty === 'Hard' ? 'text-red-500' : 'text-amber-500'
                                  }>{q.difficulty}</span>
                                  <span>•</span>
                                  <span>{q.questionType}</span>
                                  {q.explanation && (
                                    <>
                                      <span>•</span>
                                      <span className="lowercase italic text-[var(--text-secondary)] font-normal">has explanation</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setActiveBuilderQuestion({ ...q });
                                      setActiveBuilderIndex(idx);
                                    }}
                                    className="p-1 rounded text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 cursor-pointer"
                                    title="Edit Question"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => duplicateQuestion(idx)}
                                    className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer"
                                    title="Duplicate Question"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(idx)}
                                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                <div className="flex gap-1 mt-1">
                                  <button
                                    disabled={idx === 0}
                                    onClick={() => moveQuestion(idx, 'up')}
                                    className="p-1 rounded border border-[var(--brand-border)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    disabled={idx === questionsList.length - 1}
                                    onClick={() => moveQuestion(idx, 'down')}
                                    className="p-1 rounded border border-[var(--brand-border)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* EXCEL IMPORT TAB VIEW */
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">Bulk Excel Upload</span>
                      <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Use our predefined header structure for automatic matching.</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download size={13} />}
                      onClick={downloadExcelTemplate}
                    >
                      Download Template
                    </Button>
                  </div>

                  <div
                    className={`drop-zone p-10 text-center border-dashed border-2 rounded-2xl cursor-pointer ${
                      isExcelDragging ? 'bg-[#6C1D5F]/5 border-[#6C1D5F]' : 'border-[var(--brand-border)] hover:border-slate-400'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsExcelDragging(true); }}
                    onDragLeave={() => setIsExcelDragging(false)}
                    onDrop={onExcelDrop}
                    onClick={() => excelRef.current?.click()}
                  >
                    <Upload size={32} className="mx-auto mb-3 text-[#6C1D5F]" />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Drag & Drop Excel Spreadsheet here</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">or click to browse local files (.xlsx, .xls) · Max 10MB</p>
                    <input
                      ref={excelRef}
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={(e) => { if (e.target.files?.[0]) handleExcelFile(e.target.files[0]); }}
                    />
                  </div>

                  {/* Excel import notes */}
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-[var(--text-secondary)] space-y-1.5 leading-normal">
                    <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={12} /> Excel Structure Specifications
                    </p>
                    <p>1. The first row must contain column headers. Question parsing begins on row 2.</p>
                    <p>2. Columns: **A: Question**, **B: Option A**, **C: Option B**, **D: Option C**, **E: Option D**, **F: Correct Answer** (A, B, C, D), **G: Marks** (numerical), **H: Difficulty** (optional).</p>
                    <p>3. If Options C and D are left empty, the parser automatically treats the row as a True/False statement.</p>
                    <p>4. If Options A, B, C, and D are all empty, the parser treats the row as a Short Answer / Fill in the Blank.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer buttons */}
        <div className="flex items-center justify-between border-t border-[var(--brand-border)] pt-4 mt-5">
          <Button variant="ghost" onClick={handleCloseCreateModal}>Cancel</Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={questionsList.length === 0 || hasAnyValidationErrors()}
              onClick={() => onSubmitQuiz('draft')}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              disabled={questionsList.length === 0 || hasAnyValidationErrors()}
              onClick={() => onSubmitQuiz('published')}
            >
              {isEditMode ? 'Save Changes' : 'Publish Quiz'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Question Form Submodal (Add/Edit Question) */}
      <Modal
        isOpen={!!activeBuilderQuestion}
        onClose={() => setActiveBuilderQuestion(null)}
        title={activeBuilderIndex !== null ? 'Edit Question Details' : 'Create Question Details'}
        size="lg"
      >
        {activeBuilderQuestion && (
          <div className="space-y-4 select-none">
            <Select
              label="Question Type"
              value={activeBuilderQuestion.questionType || 'MCQ'}
              onChange={(e) => {
                const type = e.target.value;
                let correct = activeBuilderQuestion.correctAnswer;
                if (type === 'TRUE_FALSE') correct = 'A';
                if (type === 'MCQ') correct = 'A';
                if (type === 'MSQ') correct = 'A';
                setActiveBuilderQuestion({ 
                  ...activeBuilderQuestion, 
                  questionType: type,
                  correctAnswer: correct
                });
              }}
              options={[
                { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
                { value: 'MSQ', label: 'Multiple Select (MSQ)' },
                { value: 'TRUE_FALSE', label: 'True / False' },
                { value: 'SHORT_ANSWER', label: 'Short Answer / Fill in Blank' }
              ]}
            />

            <Textarea
              label="Question Text"
              required
              rows={3}
              value={activeBuilderQuestion.questionText}
              onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, questionText: e.target.value })}
              placeholder="e.g. Which of the following is a prime number?"
            />

            {/* Render choices fields conditionally */}
            {(activeBuilderQuestion.questionType === 'MCQ' || activeBuilderQuestion.questionType === 'MSQ') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Option A" required value={activeBuilderQuestion.optionA} onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionA: e.target.value })} />
                  <Input label="Option B" required value={activeBuilderQuestion.optionB} onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionB: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Option C" required value={activeBuilderQuestion.optionC} onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionC: e.target.value })} />
                  <Input label="Option D" required value={activeBuilderQuestion.optionD} onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionD: e.target.value })} />
                </div>
              </>
            )}

            {activeBuilderQuestion.questionType === 'TRUE_FALSE' && (
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-[var(--brand-border)] text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="font-bold">Option A:</span> True
                </div>
                <div>
                  <span className="font-bold">Option B:</span> False
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1">Correct Option(s)</label>
                
                {activeBuilderQuestion.questionType === 'MCQ' && (
                  <Select
                    value={activeBuilderQuestion.correctAnswer}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: e.target.value })}
                    options={[
                      { value: 'A', label: 'Option A' },
                      { value: 'B', label: 'Option B' },
                      { value: 'C', label: 'Option C' },
                      { value: 'D', label: 'Option D' }
                    ]}
                  />
                )}

                {activeBuilderQuestion.questionType === 'MSQ' && (
                  <div className="flex flex-wrap gap-2 py-1.5">
                    {['A', 'B', 'C', 'D'].map((val) => {
                      const selectedList = String(activeBuilderQuestion.correctAnswer || '').split(',').map(s => s.trim()).filter(Boolean);
                      const isChecked = selectedList.includes(val);

                      return (
                        <label key={val} className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let newList = [...selectedList];
                              if (isChecked) {
                                newList = newList.filter(item => item !== val);
                              } else {
                                newList.push(val);
                              }
                              newList.sort();
                              setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: newList.join(',') });
                            }}
                            className="rounded border-[var(--brand-border)] text-[#6C1D5F] focus:ring-[#6C1D5F] shrink-0"
                          />
                          <span>{val}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {activeBuilderQuestion.questionType === 'TRUE_FALSE' && (
                  <Select
                    value={activeBuilderQuestion.correctAnswer}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: e.target.value })}
                    options={[
                      { value: 'A', label: 'True (Option A)' },
                      { value: 'B', label: 'False (Option B)' }
                    ]}
                  />
                )}

                {activeBuilderQuestion.questionType === 'SHORT_ANSWER' && (
                  <input
                    type="text"
                    required
                    value={activeBuilderQuestion.correctAnswer}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: e.target.value })}
                    placeholder="Enter correct text answer..."
                    className="w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#6C1D5F] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs transition-colors focus:outline-none"
                  />
                )}
              </div>

              <Input 
                label="Marks" 
                type="number" 
                min={0.5} 
                step={0.5} 
                value={String(activeBuilderQuestion.marks)} 
                onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, marks: Number(e.target.value) })} 
              />
              
              <Select
                label="Difficulty"
                value={activeBuilderQuestion.difficulty || 'Medium'}
                onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, difficulty: e.target.value as any })}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' }
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Negative Marks (Optional)" type="number" min={0} step={0.25} value={String(activeBuilderQuestion.negativeMarks || 0)} onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, negativeMarks: Number(e.target.value) })} />
              <Input label="Explanation (Optional)" placeholder="Explain why correct answer is correct..." value={activeBuilderQuestion.explanation || ''} onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, explanation: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--brand-border)]">
              <Button variant="ghost" onClick={() => setActiveBuilderQuestion(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!activeBuilderQuestion.questionText || !activeBuilderQuestion.questionText.trim()) {
                    toast.error('Question text is required.');
                    return;
                  }
                  const updated = [...questionsList];
                  if (activeBuilderIndex !== null) {
                    updated[activeBuilderIndex] = activeBuilderQuestion;
                  } else {
                    updated.push(activeBuilderQuestion);
                  }
                  setQuestionsList(updated);
                  setActiveBuilderQuestion(null);
                  setActiveBuilderIndex(null);
                  toast.success('Question saved to builder list.');
                }}
              >
                Save to Quiz
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Quiz Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Quiz"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-primary)] font-medium">
              Are you sure you want to delete <strong>"{deleteModal?.title}"</strong>?
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              This will remove the quiz and delete all submitted student attempts. This action is irreversible.
            </p>
          </div>
        </div>
      </Modal>

      {/* Assign Batch Modal */}
      <Modal
        isOpen={!!assignModalQuiz}
        onClose={() => setAssignModalQuiz(null)}
        title="Assign Quiz to Batches"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignModalQuiz(null)}>Cancel</Button>
            <Button variant="primary" loading={assigning} onClick={handleAssignBatch}>Assign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Select one or more batches to assign the quiz <strong>"{assignModalQuiz?.title}"</strong>.
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto border border-[var(--brand-border)] p-3 rounded-xl">
            {(batches || []).map((b) => {
              const isChecked = selectedBatchIds.includes(String(b.id));
              return (
                <label key={b.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedBatchIds(selectedBatchIds.filter(id => id !== String(b.id)));
                      } else {
                        setSelectedBatchIds([...selectedBatchIds, String(b.id)]);
                      }
                    }}
                    className="rounded border-[var(--brand-border)] text-[#6C1D5F] focus:ring-[#6C1D5F]"
                  />
                  <span>{b.batchName}</span>
                </label>
              );
            })}
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
