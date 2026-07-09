package com.assignment.service;

import com.assignment.dto.response.CertificateResponse;
import java.util.List;

public interface CertificateService {
    CertificateResponse generateCertificateForSubmission(Long submissionId);
    List<CertificateResponse> getStudentCertificates(String studentEmail);
    CertificateResponse getCertificateById(Long id, String email, String role);
    CertificateResponse getCertificateByAssignment(Long assignmentId, String studentEmail);
    CertificateResponse getCertificateByQuiz(Long quizId, String studentEmail);
    List<CertificateResponse> searchCertificatesForTeacher(String teacherEmail, String studentName, String type);
    CertificateResponse getCertificateByToken(String token);
}
