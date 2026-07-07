import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Star, ChevronDown, ChevronUp, CheckCircle2, FileText, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { EmptyState } from '../../components/shared/EmptyState';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { teacherService } from '../../services/teacher.service';
import { formatDateTime, getFileIcon } from '../../utils/helpers';
import type { Assignment, Submission } from '../../types';

export const SubmittedAssignments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeModal, setGradeModal] = useState<Submission | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  // Load assignments
  useEffect(() => {
    teacherService.getAssignments({ status: 'published', limit: '100' })
      .then((res) => {
        setAssignments(res.assignments);
        const qid = searchParams.get('assignment');
        if (qid) {
          const found = res.assignments.find((a: Assignment) => a.id === qid);
          if (found) selectAssignment(found);
        }
      })
      .catch(() => toast.error('Failed to load assignments.'))
      .finally(() => setLoadingAssignments(false));
  }, []);

  const selectAssignment = useCallback(async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await teacherService.getSubmissions(assignment.id);
      setSubmissions(res.submissions);
    } catch {
      toast.error('Failed to load submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  const openGradeModal = (sub: Submission) => {
    setGradeModal(sub);
    setMarks(sub.marks !== null && sub.marks !== undefined ? String(sub.marks) : '');
    setFeedback(sub.feedback || '');
  };

  const handleGrade = async () => {
    if (!gradeModal || !marks) { toast.error('Please enter marks.'); return; }
    setSaving(true);
    try {
      const res = await teacherService.gradeSubmission({
        submissionId: gradeModal.id,
        marks: parseInt(marks),
        feedback,
      });
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => s.id === gradeModal.id ? res.submission : s)
      );
      toast.success('Submission graded successfully!');
      setGradeModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to grade submission.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout role="teacher" title="Submitted Assignments" subtitle="Review and grade student submissions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Assignment List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[var(--brand-border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Published Assignments</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Select an assignment to view submissions</p>
            </div>
            <div className="divide-y divide-[var(--brand-border)] max-h-[calc(100vh-280px)] overflow-y-auto">
              {loadingAssignments ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                ))
              ) : assignments.length === 0 ? (
                <EmptyState icon="inbox" title="No published assignments" description="Publish an assignment first." />
              ) : (
                assignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectAssignment(a)}
                    className={`w-full text-left p-4 transition-colors cursor-pointer ${
                      selectedAssignment?.id === a.id
                        ? 'bg-[#6C1D5F08] border-l-2 border-l-[#6C1D5F]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={12} className="text-[#6C1D5F] dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{a.title}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{a.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#01AC9F]">
                            {a.submittedCount ?? 0}/{a.totalStudents ?? 0} submitted
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="lg:col-span-2">
          {!selectedAssignment ? (
            <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl h-full flex items-center justify-center">
              <EmptyState
                icon="file"
                title="Select an assignment"
                description="Choose an assignment from the left panel to view student submissions."
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--brand-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{selectedAssignment.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''} · Max Marks: {selectedAssignment.maxMarks}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#01AC9F]">
                    {submissions.filter(s => s.status === 'reviewed').length}/{submissions.length} graded
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                      {['Student', 'Enrollment No.', 'Submitted', 'File', 'Status', 'Marks', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--brand-border)]">
                    {loadingSubmissions ? (
                      Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                    ) : submissions.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState icon="inbox" title="No submissions yet" description="Students haven't submitted for this assignment yet." />
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="table-row-hover">
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{sub.student?.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{sub.student?.email}</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)] font-mono">{sub.student?.enrollmentNumber}</td>
                          <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">{formatDateTime(sub.submittedAt)}</td>
                          <td className="px-4 py-3.5">
                            <a
                              href={sub.uploadedFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-[#01AC9F] hover:underline"
                            >
                              <span>{getFileIcon(sub.fileName)}</span>
                              <span className="max-w-[80px] truncate">{sub.fileName}</span>
                              <Download size={11} />
                            </a>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={sub.status as any} />
                          </td>
                          <td className="px-4 py-3.5">
                            {sub.marks !== null && sub.marks !== undefined ? (
                              <span className="text-sm font-semibold text-[#6C1D5F] dark:text-purple-300">
                                {sub.marks}/{selectedAssignment.maxMarks}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--text-secondary)]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <Button
                              variant={sub.status === 'reviewed' ? 'outline' : 'primary'}
                              size="sm"
                              icon={sub.status === 'reviewed' ? <CheckCircle2 size={13} /> : <Star size={13} />}
                              onClick={() => openGradeModal(sub)}
                            >
                              {sub.status === 'reviewed' ? 'Edit Grade' : 'Grade'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grade Modal */}
      <Modal
        isOpen={!!gradeModal}
        onClose={() => setGradeModal(null)}
        title="Grade Submission"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setGradeModal(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleGrade}>Save Review</Button>
          </>
        }
      >
        {gradeModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-[var(--text-secondary)]">Student</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{gradeModal.student?.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{gradeModal.student?.enrollmentNumber}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Submitted File</p>
              <a href={gradeModal.uploadedFile} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#01AC9F] hover:underline">
                <span>{getFileIcon(gradeModal.fileName)}</span>
                {gradeModal.fileName}
                <Download size={13} />
              </a>
            </div>
            <Input
              label={`Marks (out of ${selectedAssignment?.maxMarks})`}
              type="number"
              min={0}
              max={selectedAssignment?.maxMarks}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="Enter marks"
              required
            />
            <Textarea
              label="Feedback (Optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback for the student..."
              rows={4}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};
