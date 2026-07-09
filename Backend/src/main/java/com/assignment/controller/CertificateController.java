package com.assignment.controller;

import com.assignment.dto.response.ApiResponse;
import com.assignment.dto.response.CertificateResponse;
import com.assignment.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    // --- Student Certificate Endpoints ---

    @GetMapping("/api/student/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getMyCertificates(Principal principal) {
        List<CertificateResponse> response = certificateService.getStudentCertificates(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificate(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "STUDENT");
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/assignment/{assignmentId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateByAssignment(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateByAssignment(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/quiz/{quizId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateByQuiz(
            @PathVariable Long quizId,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateByQuiz(quizId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/{id}/download")
    public ResponseEntity<Void> downloadCertificate(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "STUDENT");
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(response.getCertificateUrl()))
                .build();
    }

    // --- Teacher Certificate Endpoints ---

    @GetMapping("/api/teacher/certificates/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }
}
