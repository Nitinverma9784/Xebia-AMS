import api from './api';

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  assignmentId: string | null;
  assignmentTitle: string | null;
  quizId: string | null;
  quizTitle: string | null;
  certificateUrl: string;
  cloudinaryPublicId: string | null;
  marks: number;
  generatedAt: string;
  certificateType: 'ASSIGNMENT' | 'QUIZ';

  // New verification / PDF details
  certificateId?: string;
  teacherId?: string;
  teacherName?: string;
  completionDate?: string;
  generatedDate?: string;
  pdfFileUrl?: string;
  verificationToken?: string;
  qrCodeUrl?: string;
}

export const certificateService = {
  getMyCertificates: async (): Promise<Certificate[]> => {
    const res = await api.get('/student/certificates');
    return res.data.data || [];
  },

  getCertificateById: async (id: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/${id}`);
    return res.data.data;
  },

  getCertificateByAssignment: async (assignmentId: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/assignment/${assignmentId}`);
    return res.data.data;
  },

  getCertificateByQuiz: async (quizId: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/quiz/${quizId}`);
    return res.data.data;
  },

  getDownloadUrl: (id: string): string => {
    return `${api.defaults.baseURL}/student/certificates/${id}/download`;
  },

  searchCertificatesForTeacher: async (studentName?: string, type?: string): Promise<Certificate[]> => {
    const params: Record<string, string> = {};
    if (studentName) params.studentName = studentName;
    if (type) params.type = type;
    const res = await api.get('/teacher/certificates', { params });
    return res.data.data || [];
  },

  verifyCertificate: async (token: string): Promise<Certificate> => {
    const res = await api.get(`/certificates/verify/${token}`);
    return res.data.data;
  }
};
