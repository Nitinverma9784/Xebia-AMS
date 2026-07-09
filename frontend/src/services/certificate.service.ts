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
  }
};
