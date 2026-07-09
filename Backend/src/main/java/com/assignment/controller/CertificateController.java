package com.assignment.controller;

import com.assignment.dto.response.ApiResponse;
import com.assignment.dto.response.CertificateResponse;
import com.assignment.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
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

    private byte[] downloadFileFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new com.assignment.exception.BadRequestException("File URL is empty");
        }
        try {
            java.io.InputStream in = new java.net.URL(fileUrl).openStream();
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int n;
            while ((n = in.read(buffer)) != -1) {
                out.write(buffer, 0, n);
            }
            in.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new com.assignment.exception.CustomException("Failed to download PDF content: " + e.getMessage(), 500);
        }
    }

    @GetMapping("/api/student/certificates/{id}/download")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "STUDENT");
        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/api/student/certificates/{id}/view")
    public ResponseEntity<byte[]> viewCertificate(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "STUDENT");
        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // --- Teacher Certificate Endpoints ---

    @GetMapping("/api/teacher/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> searchCertificates(
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String type,
            Principal principal
    ) {
        List<CertificateResponse> response = certificateService.searchCertificatesForTeacher(principal.getName(), studentName, type);
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved successfully", response));
    }

    @GetMapping("/api/teacher/certificates/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/teacher/certificates/{id}/download")
    public ResponseEntity<byte[]> downloadCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/api/teacher/certificates/{id}/view")
    public ResponseEntity<byte[]> viewCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // --- Public Verification Endpoint ---

    @GetMapping("/api/certificates/verify/{token}")
    public ResponseEntity<ApiResponse<CertificateResponse>> verifyCertificate(
            @PathVariable String token
    ) {
        CertificateResponse response = certificateService.getCertificateByToken(token);
        return ResponseEntity.ok(ApiResponse.success("Certificate verified successfully", response));
    }
}
