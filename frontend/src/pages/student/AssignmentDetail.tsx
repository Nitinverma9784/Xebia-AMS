import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Award, User, Download, Upload, X, CheckCircle2,
  AlertCircle, Clock, BookOpen, FileText, MessageSquare, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { studentService } from '../../services/student.service';
import { formatDate, formatDateTime, getDueDateCountdown, getDueDateColor, isOverdue, getFileIcon } from '../../utils/helpers';
import type { Assignment } from '../../types';

export const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAssignment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await studentService.getAssignmentDetail(id);
      setAssignment(res.assignment);
    } catch {
      toast.error('Failed to load assignment.');
      navigate('/student/assignments');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  const handleFile = (file: File) => {
    const allowed = ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, ZIP, PPT, Images');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum 25MB allowed.');
      return;
    }
    setUploadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!uploadFile || !assignment) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await studentService.submitAssignment(assignment.id, uploadFile, setUploadProgress);
      toast.success(assignment.submission ? 'Submission replaced successfully!' : 'Assignment submitted successfully!');
      setUploadFile(null);
      setUploadProgress(0);
      fetchAssignment(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setUploading(false);
    }
  };

  const overdue = assignment ? isOverdue(assignment.dueDate) : false;
  const canReplace = false;

  if (loading) {
    return (
      <Layout role="student" title="Assignment Detail">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5 space-y-3">
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (!assignment) return null;

  return (
    <Layout role="student" title={assignment.title} subtitle={assignment.subject}>
      <div className="max-w-3xl mx-auto space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> Back to Assignments
        </button>

        {/* Header Card */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">{assignment.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1">
                  <BookOpen size={11} /> {assignment.subject}
                </span>
                <Badge
                  variant={(assignment.submissionStatus || 'not_submitted') as any}
                  label={
                    assignment.submissionStatus === 'not_submitted' ? 'Not Submitted'
                    : assignment.submissionStatus === 'submitted' ? 'Submitted'
                    : 'Reviewed'
                  }
                />
                {overdue && !assignment.submission && <Badge variant="overdue" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Calendar size={14} />, label: 'Due Date', value: `${formatDate(assignment.dueDate)} • ${assignment.dueTime || '23:59:00'}` },
              { icon: <Clock size={14} />, label: 'Time Left', value: getDueDateCountdown(assignment.dueDate), color: getDueDateColor(assignment.dueDate) },
              { icon: <Award size={14} />, label: 'Max Marks', value: String(assignment.maxMarks) },
              { icon: <User size={14} />, label: 'Teacher', value: assignment.teacher?.name || 'Unknown' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1">
                  {item.icon}
                  <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                </div>
                <p className={`text-sm font-semibold ${item.color || 'text-[var(--text-primary)]'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Description */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <FileText size={15} className="text-[#6C1D5F] dark:text-purple-400" /> Description
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{assignment.description}</p>

          {assignment.instructions && (
            <>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-3 flex items-center gap-2">
                <MessageSquare size={15} className="text-[#01AC9F]" /> Instructions
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{assignment.instructions}</p>
            </>
          )}

          {assignment.attachment && (
            <div className="mt-5 pt-4 border-t border-[var(--brand-border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Attachment</h3>
              <a
                href={assignment.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#01AC9F] text-[#01AC9F] text-sm hover:bg-[#01AC9F0D] transition-colors"
              >
                <span>{getFileIcon(assignment.attachmentName || 'file')}</span>
                {assignment.attachmentName || 'Download Attachment'}
                <Download size={14} />
              </a>
            </div>
          )}
        </Card>

        {/* Submission Section */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Upload size={15} className="text-[#6C1D5F] dark:text-purple-400" />
            {assignment.submission ? 'Your Submission' : 'Submit Assignment'}
          </h3>

          {/* Existing submission details */}
          {assignment.submission && (
            <div className="mb-5 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Submitted Successfully</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {formatDateTime(assignment.submission.submittedAt)}
                  </p>
                  <a
                    href={assignment.submission.uploadedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline mt-2"
                  >
                    <span>{getFileIcon(assignment.submission.fileName)}</span>
                    {assignment.submission.fileName}
                    <Download size={11} />
                  </a>
                </div>
              </div>

              {/* Marks & Feedback */}
              {assignment.submission.status === 'reviewed' && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Your Score</span>
                    <span className="text-lg font-bold text-[#01AC9F]">
                      {assignment.submission.marks}/{assignment.maxMarks}
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#6C1D5F] to-[#01AC9F] h-2 rounded-full progress-bar"
                      style={{ width: `${((assignment.submission.marks || 0) / assignment.maxMarks) * 100}%` }}
                    />
                  </div>
                  {assignment.submission.feedback && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-blue-200 dark:border-blue-500/10">
                      <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Teacher Feedback</p>
                      <p className="text-sm text-[var(--text-primary)]">{assignment.submission.feedback}</p>
                    </div>
                  )}
                  <Badge variant="reviewed" size="md" label="Reviewed by Teacher" />
                </div>
              )}
            </div>
          )}

          {/* Upload section */}
          {!assignment.submission && !overdue && (
            <>
              {uploadFile ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 mb-4">
                  <span className="text-2xl">{getFileIcon(uploadFile.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{uploadFile.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => setUploadFile(null)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className={`drop-zone ${isDragging ? 'dragging' : ''} p-8 text-center cursor-pointer mb-4`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                    <Upload size={22} className="text-[#01AC9F]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Drop file here or <span className="text-[#01AC9F]">browse</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, ZIP, PPT, Images · Max 25MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.zip,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                </div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Uploading...</span>
                    <span className="text-[#01AC9F] font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-[#01AC9F] h-1.5 rounded-full progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                size="lg"
                loading={uploading}
                disabled={!uploadFile}
                onClick={handleSubmit}
                icon={<Upload size={16} />}
                className="w-full"
              >
                Submit Assignment
              </Button>
            </>
          )}

          {/* Submitted (disabled submission button) */}
          {assignment.submission && (
            <div className="space-y-4">
              <Button
                variant="outline"
                size="lg"
                disabled
                icon={<CheckCircle2 size={16} />}
                className="w-full bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border-[var(--brand-border)]"
              >
                Submitted
              </Button>
            </div>
          )}

          {/* Overdue (Submission Closed button) */}
          {overdue && !assignment.submission && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Submission Deadline Passed</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
                    This assignment is no longer accepting submissions.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800 text-red-500 border-red-200 dark:border-red-500/20"
              >
                Submission Closed
              </Button>
            </div>
          )}

          {/* Reviewed notice */}
          {assignment.submission?.status === 'reviewed' && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <AlertCircle size={12} />
              Submissions cannot be replaced after grading.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
