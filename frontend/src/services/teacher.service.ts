import api from './api';
import type { CreateAssignmentData, GradeSubmissionData, Assignment, Submission } from '../types';

const getOrCreateDefaultBatchId = async () => {
  try {
    const res = await api.get('/teacher/batches');
    const batches = res.data.data || [];
    if (batches.length > 0) {
      return batches[0].id;
    }
    const createRes = await api.post('/teacher/batches', {
      batchName: 'General Class',
      description: 'Default batch for all students',
    });
    return createRes.data.data.id;
  } catch (e) {
    console.error("Error getting/creating default batch", e);
    throw e;
  }
};

const mapSubmission = (s: any, assignmentMaxMarks: number = 100): Submission => {
  let fileName = s.submissionUrl ? s.submissionUrl.substring(s.submissionUrl.lastIndexOf('/') + 1) : 'submission-file';
  try {
    fileName = decodeURIComponent(fileName);
  } catch {}
  if (fileName.includes('_')) {
    fileName = fileName.substring(fileName.indexOf('_') + 1);
  }

  return {
    id: String(s.id),
    assignmentId: String(s.assignmentId),
    studentId: String(s.studentId),
    uploadedFile: s.submissionUrl,
    fileName: fileName,
    submittedAt: s.submittedAt,
    marks: s.marks,
    feedback: s.feedback,
    status: s.status === 'REVIEWED' ? 'reviewed' : 'submitted',
    student: {
      id: String(s.studentId),
      name: s.studentName || 'Student',
      email: s.studentEmail || '',
      enrollmentNumber: s.studentEnrollment || 'ENR-' + s.studentId,
    },
    assignment: {
      id: String(s.assignmentId),
      title: s.assignmentTitle || 'Assignment',
      maxMarks: assignmentMaxMarks,
    }
  };
};

export const teacherService = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/teacher/dashboard');
    const dbData = res.data.data;
    
    let submittedCount = 0;
    let pendingCount = 0;
    try {
      const assignmentsRes = await api.get('/teacher/assignments', { params: { page: '0', size: '100' } });
      const assignments = assignmentsRes.data.data || [];
      
      const submissionPromises = assignments.map(async (assignment: any) => {
        try {
          const subRes = await api.get(`/teacher/assignments/${assignment.id}/submitted`);
          const submissions = subRes.data.data || [];
          const submittedSubmissions = submissions.length;
          
          const pendingReview = submissions.filter((s: any) => s.status === 'SUBMITTED').length;
          return { submittedSubmissions, pendingReview };
        } catch {
          return { submittedSubmissions: 0, pendingReview: 0 };
        }
      });
      
      const results = await Promise.all(submissionPromises);
      results.forEach(r => {
        submittedCount += r.submittedSubmissions;
        pendingCount += r.pendingReview;
      });
    } catch (e) {
      console.error("Error calculating submissions count", e);
    }
    
    return {
      stats: {
        totalAssignments: dbData.totalAssignments,
        activeAssignments: dbData.activeAssignments,
        submittedAssignments: submittedCount,
        pendingAssignments: pendingCount,
        totalStudents: dbData.totalStudents,
      }
    };
  },

  // Assignments
  getAssignments: async (params?: Record<string, string>) => {
    const res = await api.get('/teacher/assignments', { params: { page: '0', size: '1000' } });
    const rawAssignments = res.data.data || [];

    const mappedPromises = rawAssignments.map(async (a: any) => {
      let submittedCount = 0;
      let pendingCount = 0;
      let totalStudents = 0;

      try {
        const [subRes, pendingRes] = await Promise.all([
          api.get(`/teacher/assignments/${a.id}/submitted`),
          api.get(`/teacher/assignments/${a.id}/pending`),
        ]);
        submittedCount = (subRes.data.data || []).length;
        pendingCount = (pendingRes.data.data || []).length;
        totalStudents = submittedCount + pendingCount;
      } catch (e) {
        console.error("Error fetching stats for assignment", a.id, e);
      }

      let attachmentName = a.resourceUrl ? a.resourceUrl.substring(a.resourceUrl.lastIndexOf('/') + 1) : undefined;
      if (attachmentName) {
        try {
          attachmentName = decodeURIComponent(attachmentName);
        } catch {}
        if (attachmentName.includes('_')) {
          attachmentName = attachmentName.substring(attachmentName.indexOf('_') + 1);
        }
      }

      return {
        id: String(a.id),
        title: a.title,
        subject: a.subject || 'General',
        topic: a.topic || '',
        description: a.description || '',
        instructions: a.instructions || '',
        dueDate: a.dueDate || '',
        dueTime: a.dueTime || '23:59:00',
        maxMarks: a.totalMarks || 100,
        attachment: a.resourceUrl || undefined,
        attachmentName: attachmentName,
        status: a.status === 'ACTIVE' ? 'published' : 'draft',
        teacherId: String(a.teacherId || ''),
        createdAt: a.createdAt || '',
        updatedAt: a.updatedAt || '',
        batchId: String(a.batchId || ''),
        batchName: a.batchName || '',
        totalStudents,
        submittedCount,
        pendingCount,
      };
    });

    let mapped = await Promise.all(mappedPromises);

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      mapped = mapped.filter((a: any) =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        (a.batchName || '').toLowerCase().includes(searchLower)
      );
    }

    if (params?.subject) {
      const sub = params.subject.toLowerCase();
      mapped = mapped.filter((a: any) => a.subject.toLowerCase() === sub);
    }

    if (params?.status) {
      const status = params.status;
      mapped = mapped.filter((a: any) => a.status === status);
    }

    const page = params?.page ? parseInt(params.page) : 1;
    const limit = params?.limit ? parseInt(params.limit) : 10;
    const total = mapped.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = mapped.slice(start, end);

    return {
      assignments: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  getAssignmentById: async (id: string) => {
    const res = await api.get(`/teacher/assignments/${id}`);
    const a = res.data.data;
    
    let attachmentName = a.resourceUrl ? a.resourceUrl.substring(a.resourceUrl.lastIndexOf('/') + 1) : undefined;
    if (attachmentName) {
      try {
        attachmentName = decodeURIComponent(attachmentName);
      } catch {}
      if (attachmentName.includes('_')) {
        attachmentName = attachmentName.substring(attachmentName.indexOf('_') + 1);
      }
    }
    
    return {
      id: String(a.id),
      title: a.title,
      subject: a.subject || 'General',
      topic: a.topic || '',
      description: a.description || '',
      instructions: a.instructions || '',
      dueDate: a.dueDate || '',
      dueTime: a.dueTime || '23:59:00',
      maxMarks: a.totalMarks || 100,
      attachment: a.resourceUrl || undefined,
      attachmentName: attachmentName,
      status: a.status === 'ACTIVE' ? 'published' : 'draft',
      teacherId: String(a.teacherId || ''),
      createdAt: a.createdAt || '',
      updatedAt: a.updatedAt || '',
      batchId: String(a.batchId || ''),
      batchName: a.batchName || '',
    };
  },

  createAssignment: async (data: CreateAssignmentData & { batchId: string }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('instructions', data.instructions || '');
    formData.append('subject', data.subject);
    if (data.topic !== undefined) formData.append('topic', data.topic);
    formData.append('batchId', String(data.batchId));
    formData.append('totalMarks', String(data.maxMarks));
    
    const passingMarks = Math.round(data.maxMarks * 0.4);
    formData.append('passingMarks', String(passingMarks));
    
    formData.append('dueDate', data.dueDate);
    formData.append('dueTime', '23:59:00');
    formData.append('assignmentType', 'PDF');
    
    if (data.attachment) {
      formData.append('resourceFile', data.attachment);
    }
    
    formData.append('lateSubmissionAllowed', 'true');
    formData.append('maxFileSize', '26214400');
    
    const res = await api.post('/teacher/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateAssignment: async (id: string, data: Partial<CreateAssignmentData> & { batchId?: string }) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.instructions !== undefined) formData.append('instructions', data.instructions || '');
    if (data.subject !== undefined) formData.append('subject', data.subject);
    if (data.topic !== undefined) formData.append('topic', data.topic);
    if (data.batchId !== undefined) formData.append('batchId', String(data.batchId));
    
    if (data.maxMarks !== undefined) {
      formData.append('totalMarks', String(data.maxMarks));
      const passingMarks = Math.round(data.maxMarks * 0.4);
      formData.append('passingMarks', String(passingMarks));
    }
    
    if (data.dueDate !== undefined) {
      formData.append('dueDate', data.dueDate);
    }
    formData.append('dueTime', '23:59:00');
    formData.append('assignmentType', 'PDF');
    
    if (data.attachment) {
      formData.append('resourceFile', data.attachment);
    }
    
    const res = await api.put(`/teacher/assignments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteAssignment: async (id: string) => {
    const res = await api.delete(`/teacher/assignments/${id}`);
    return res.data;
  },

  // Submissions
  getSubmissions: async (assignmentId: string) => {
    const [assignmentRes, submissionsRes] = await Promise.all([
      api.get(`/teacher/assignments/${assignmentId}`),
      api.get(`/teacher/assignments/${assignmentId}/submitted`),
    ]);
    
    const maxMarks = assignmentRes.data.data?.totalMarks || 100;
    const rawSubmissions = submissionsRes.data.data || [];
    
    const mapped = rawSubmissions.map((s: any) => mapSubmission(s, maxMarks));
    return {
      submissions: mapped,
    };
  },

  gradeSubmission: async (data: GradeSubmissionData) => {
    const res = await api.put(`/teacher/submissions/${data.submissionId}/review`, {
      marks: data.marks,
      feedback: data.feedback || '',
    });
    
    const s = res.data.data;
    const mapped = mapSubmission(s);
    return {
      submission: mapped,
    };
  },

  // Profile
  updateProfile: async (data: FormData) => {
    const name = data.get('name') as string;
    const userStr = localStorage.getItem('lms_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (name) user.name = name;
      localStorage.setItem('lms_user', JSON.stringify(user));
      return { user };
    }
    throw new Error('User not found');
  },
};
