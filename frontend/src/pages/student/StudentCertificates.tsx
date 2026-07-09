import React, { useEffect, useState } from 'react';
import { Award, Calendar, ExternalLink, Download, Share2, Search, BookOpen, User, CheckCircle, Eye } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const StudentCertificates: React.FC = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getMyCertificates();
      setCerts(data);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleShare = (cert: Certificate) => {
    const frontendUrl = window.location.origin;
    const verificationUrl = `${frontendUrl}/verify-certificate/${cert.verificationToken}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      toast.success('Verification link copied to clipboard!');
    } else {
      toast.error('Sharing not supported on this browser');
    }
  };

  const filteredCerts = certs.filter((c) => {
    const title = (c.assignmentTitle || c.quizTitle || c.assignmentName || '').toLowerCase();
    const certId = (c.certificateId || '').toLowerCase();
    return title.includes(search.toLowerCase()) || certId.includes(search.toLowerCase());
  });

  return (
    <Layout role="student" title="Certificates" subtitle="View and share your achievements">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 select-none">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificates by title or ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#6C1D5F] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse space-y-4 p-6 border border-[var(--brand-border)]">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredCerts.length === 0 ? (
        <Card className="py-16 text-center border border-[var(--brand-border)]">
          <EmptyState
            icon="award"
            title="No certificates earned yet"
            description={
              search ? 'No certificates match your search query.' : 'Complete assignments or quizzes with a passing grade to earn certificates!'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCerts.map((c) => {
            const date = c.completionDate ? new Date(c.completionDate) : new Date(c.generatedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <Card
                key={c.id}
                className="hover:shadow-md transition-all duration-200 border border-[var(--brand-border)] flex flex-col justify-between p-6 relative overflow-hidden group"
              >
                {/* Visual Accent Badge */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award size={24} className="text-emerald-500 mt-6 mr-6" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-[#6C1D5F] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded">
                      {c.certificateType}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] pr-8 line-clamp-1">
                      {c.assignmentTitle || c.quizTitle || c.assignmentName}
                    </h3>
                    <p className="text-[10px] font-mono text-[var(--text-secondary)]">ID: {c.certificateId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-[var(--brand-border)] text-xs text-[var(--text-secondary)]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Date of Issue</span>
                      <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                        <Calendar size={12} /> {formattedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Grade Secured</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle size={12} /> {c.marks.toFixed(1)} Pts
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/30 border border-[var(--brand-border)] rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-[#01AC9F]">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase font-bold text-[var(--text-secondary)] block">Instructor / Reviewer</span>
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate block">
                        {c.teacherName || 'System Verified Evaluator'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--brand-border)] flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1 text-xs py-2 flex items-center justify-center gap-1.5 shadow-purple-500/10 shadow-lg cursor-pointer"
                    onClick={() => window.open(`${api.defaults.baseURL}/student/certificates/${c.id}/view`, '_blank')}
                  >
                    <span>View Certificate</span>
                    <Eye size={13} />
                  </Button>
                  <Button
                    variant="outline"
                    className="p-2 cursor-pointer flex items-center justify-center border-[var(--brand-border)] text-[var(--text-secondary)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    title="Download PDF"
                    onClick={() => window.open(`${api.defaults.baseURL}/student/certificates/${c.id}/download`, '_blank')}
                  >
                    <Download size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    className="p-2 cursor-pointer flex items-center justify-center border-[var(--brand-border)] text-[var(--text-secondary)] hover:text-[#6C1D5F] hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    title="Share Verification Link"
                    onClick={() => handleShare(c)}
                  >
                    <Share2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
};
