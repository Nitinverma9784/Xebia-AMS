import React, { useEffect, useState } from 'react';
import { Award, Search, Calendar, Download, Eye, ExternalLink, ShieldCheck, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/shared/EmptyState';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const TeacherCertificates: React.FC = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce search keystrokes to prevent duplicate API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificateService.searchCertificatesForTeacher(debouncedSearch, typeFilter);
      setCerts(data);
    } catch (err) {
      setError('Failed to retrieve issued certificates');
      toast.dismiss();
      toast.error('Failed to retrieve issued certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [debouncedSearch, typeFilter]);

  const handleVerify = (cert: Certificate) => {
    const verificationUrl = `${window.location.origin}/verify-certificate/${cert.verificationToken}`;
    window.open(verificationUrl, '_blank');
  };

  return (
    <Layout role="teacher" title="Certificates Issued" subtitle="Track and verify student certificates">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 select-none">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
            className="w-full search-bar-modern"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none focus:outline-none focus:border-[#4A1F4F]"
          >
            <option value="">All Types</option>
            <option value="ASSIGNMENT">Assignments Only</option>
            <option value="QUIZ">Quizzes Only</option>
          </select>

          <Button
            variant="outline"
            className="p-2.5 rounded-xl border-[var(--brand-border)] text-[var(--text-secondary)] hover:text-[#4A1F4F]"
            onClick={fetchCertificates}
            disabled={loading}
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Certificate ID', 'Student', 'Activity Name', 'Type', 'Grade Secured', 'Issue Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <AlertCircle size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{error}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Please check your query parameters or try again.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-[#2563EB] border-[#2563EB]/20 hover:bg-[#2563EB]/5"
                        onClick={fetchCertificates}
                      >
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : certs.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="award"
                      title="No certificates found"
                      description="No automatically generated completion certificates match the filter options."
                    />
                  </td>
                </tr>
              ) : (
                certs.map((c) => {
                  const date = c.completionDate ? new Date(c.completionDate) : new Date(c.generatedAt);
                  const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={c.id} className="table-row-hover">
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {c.certificateId}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)]">
                        {c.studentName}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-primary)] max-w-[200px] truncate">
                        {c.assignmentTitle || c.quizTitle || c.assignmentName}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[9px] uppercase font-black text-[#4A1F4F] dark:text-purple-400 bg-[#F5EAF8] dark:bg-purple-950/20 px-1.5 py-0.5 rounded">
                          {c.certificateType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {c.marks.toFixed(1)} Pts
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)]">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedCert(c)}
                            title="Preview Certificate Details"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[#F5EAF8] hover:text-[#4A1F4F] dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => window.open(c.pdfFileUrl || c.certificateUrl, '_blank')}
                            title="View Certificate"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          >
                            <ExternalLink size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await certificateService.downloadCertificate(c.id, `certificate-${c.id}.pdf`);
                              } catch (err) {
                                const url = c.pdfFileUrl || c.certificateUrl;
                                const downloadUrl = url.includes('/upload/') ? url.replace('/upload/', '/upload/fl_attachment/') : url;
                                window.open(downloadUrl, '_blank');
                              }
                            }}
                            title="Download PDF"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Details Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Certificate Details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedCert(null)}>Close</Button>
            <Button
              variant="outline"
              className="flex items-center gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
              onClick={() => selectedCert && handleVerify(selectedCert)}
            >
              <ShieldCheck size={14} />
              <span>Verify Authenticity</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedCert && window.open(selectedCert.pdfFileUrl || selectedCert.certificateUrl, '_blank')}
            >
              <Download size={14} />
              <span>Download PDF</span>
            </Button>
          </>
        }
      >
        {selectedCert && (
          <div className="space-y-4 text-sm select-none">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-[var(--brand-border)]">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Certificate ID</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{selectedCert.certificateId}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Student Name</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedCert.studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Activity Completed</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedCert.assignmentTitle || selectedCert.quizTitle || selectedCert.assignmentName}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Activity Type</span>
                <span className="font-bold text-[#4A1F4F] dark:text-purple-400">{selectedCert.certificateType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Grade Secured</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCert.marks.toFixed(2)} Pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Issue Date</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedCert.completionDate ? new Date(selectedCert.completionDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : new Date(selectedCert.generatedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-800/20 border border-[var(--brand-border)] rounded-2xl">
              <div className="flex flex-col items-center gap-1">
                {selectedCert.qrCodeUrl && (
                  <img
                    src={selectedCert.qrCodeUrl}
                    alt="Verification QR Code"
                    className="w-32 h-32 rounded-lg border border-[var(--brand-border)]"
                  />
                )}
                <span className="text-[10px] text-[var(--text-secondary)] mt-1">Verification Ledger Link QR</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
