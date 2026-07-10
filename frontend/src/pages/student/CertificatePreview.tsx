import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Award, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import toast from 'react-hot-toast';

export const CertificatePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      certificateService.getCertificatePreview(id)
        .then(data => {
          setCert(data);
        })
        .catch(err => {
          toast.error(err.response?.data?.message || 'Failed to load certificate preview');
          navigate('/student/certificates');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!id || !cert) return;
    setDownloading(true);
    const loadingToast = toast.loading('Generating and downloading your certificate...');
    try {
      await certificateService.downloadOrGenerateCertificate(id, `certificate-${id}.pdf`);
      toast.success('Certificate downloaded successfully!', { id: loadingToast });
      
      // Fetch preview data again to update preview state with final generated ID / dates
      const updated = await certificateService.getCertificatePreview(id);
      setCert(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate and download certificate', { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Layout role="student" title="Certificate Preview">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="animate-spin text-[#4A1F4F]" size={40} />
          <p className="text-sm font-medium text-slate-500">Loading certificate preview...</p>
        </div>
      </Layout>
    );
  }

  if (!cert) return null;

  const formattedDate = cert.completionDate
    ? new Date(cert.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Layout role="student" title="Certificate Preview">
      <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          
          <Button
            variant="primary"
            onClick={handleDownload}
            loading={downloading}
            className="flex items-center justify-center gap-2 text-xs font-bold px-5 py-2.5 shadow-lg shadow-[#4A1F4F]/10 w-full sm:w-auto"
          >
            <Download size={14} />
            Download Certificate
          </Button>
        </div>

        {/* Certificate Container (HTML Preview) */}
        <div className="bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-6 sm:p-12 relative select-none">
          {/* Certificate Inner Frame */}
          <div className="border-[8px] border-[#4A1F4F] rounded-xl p-4 sm:p-8 relative min-h-[480px] flex flex-col justify-between">
            {/* Inner Thin Border */}
            <div className="absolute inset-2 border border-slate-200 pointer-events-none rounded" />

            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#4A1F4F] rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#4A1F4F] rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#4A1F4F] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#4A1F4F] rounded-tr-sm pointer-events-none" />

            {/* Header Logos */}
            <div className="flex justify-between items-center z-10">
              {/* LMS Portal Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4A1F4F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  L
                </div>
                <span className="font-bold text-slate-800 tracking-tight text-sm">LMS Portal</span>
              </div>
              {/* Xebia Brand Logo */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#4A1F4F] flex items-center justify-center text-white font-bold text-xs">
                  X
                </div>
                <span className="font-bold text-slate-800 tracking-tight text-sm">Xebia</span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-center my-6 flex-1 flex flex-col justify-center gap-4">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#4A1F4F] tracking-tight">
                Certificate of Achievement
              </h1>
              <div className="w-40 h-0.5 bg-purple-100 mx-auto" />

              <p className="text-slate-400 text-xs sm:text-sm font-medium italic">
                Congratulations,
              </p>
              <h2 className="font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight leading-none px-4">
                {cert.studentName}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                you have successfully completed the {cert.certificateType === 'QUIZ' ? 'Quiz' : 'Assignment'}
              </p>
              <h3 className="font-bold text-lg sm:text-xl text-slate-800 italic leading-none px-4">
                "{cert.quizTitle || cert.assignmentTitle || cert.assignmentName}"
              </h3>
              
              <div className="mt-2 text-xs sm:text-sm text-slate-500 flex flex-col gap-1">
                <p className="font-bold text-[#2563EB]">
                  Grade Secured: {cert.marks.toFixed(2)} / {cert.maxMarks?.toFixed(2) || '100.00'}
                </p>
                <p className="text-slate-400">
                  Completion Date: {formattedDate}
                </p>
              </div>
            </div>

            {/* Footer Elements */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 mt-4 pt-4 border-t border-slate-100 z-10">
              {/* QR Code / ID */}
              <div className="flex items-center gap-3">
                {cert.qrCodeUrl ? (
                  <img
                    src={cert.qrCodeUrl}
                    alt="Verification QR"
                    className="w-16 h-16 object-contain rounded border border-slate-100 bg-white p-1"
                  />
                ) : (
                  <div className="w-16 h-16 rounded border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-1 text-[8px] text-slate-400 text-center leading-tight">
                    <span>Scan to</span>
                    <span>Verify</span>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Certificate ID</span>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {cert.certificateId}
                  </span>
                </div>
              </div>

              {/* Seal Stamp */}
              <div className="w-16 h-16 rounded-full bg-yellow-100/50 border-2 border-dashed border-yellow-500/80 flex flex-col items-center justify-center p-1 relative rotate-12">
                <span className="text-[8px] font-bold text-[#4A1F4F] leading-none">LMS</span>
                <span className="text-[8px] font-bold text-[#4A1F4F] leading-none">PORTAL</span>
                <span className="text-[6px] text-yellow-600 font-bold mt-1 tracking-wider uppercase">Certified</span>
              </div>

              {/* Instructor Signature */}
              <div className="flex flex-col items-center gap-1 w-44">
                <div className="w-full border-b border-slate-300 pb-1 flex flex-col items-center justify-center min-h-[24px]">
                  <span className="font-serif italic text-sm text-indigo-900 select-none">
                    {cert.teacherName}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-600 block leading-tight">
                    {cert.teacherName}
                  </span>
                  <span className="text-[8px] text-slate-400 block leading-none">
                    Authorized Instructor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
