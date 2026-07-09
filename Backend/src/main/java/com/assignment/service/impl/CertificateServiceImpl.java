package com.assignment.service.impl;

import com.assignment.dto.response.CertificateResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Certificate;
import com.assignment.entity.Student;
import com.assignment.entity.Submission;
import com.assignment.enums.SubmissionStatus;
import com.assignment.exception.BadRequestException;
import com.assignment.exception.CustomException;
import com.assignment.exception.ResourceNotFoundException;
import com.assignment.exception.UnauthorizedException;
import com.assignment.mapper.CertificateMapper;
import com.assignment.repository.CertificateRepository;
import com.assignment.repository.StudentRepository;
import com.assignment.repository.SubmissionRepository;
import com.assignment.service.CertificateService;
import com.assignment.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final CloudinaryService cloudinaryService;
    private final CertificateMapper certificateMapper;

    @Override
    @Transactional
    public CertificateResponse generateCertificateForSubmission(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.REVIEWED) {
            throw new BadRequestException("Submission must be evaluated and reviewed before generating certificate");
        }

        Student student = submission.getStudent();
        Assignment assignment = submission.getAssignment();

        // 1. Validate / Check for duplicate certificate generation
        boolean isQuiz = assignment.getAssignmentType() == com.assignment.enums.AssignmentType.QUIZ;
        Optional<Certificate> existingCert = isQuiz ?
                certificateRepository.findByStudentIdAndQuizId(student.getId(), assignment.getId()) :
                certificateRepository.findByStudentIdAndAssignmentId(student.getId(), assignment.getId());

        if (existingCert.isPresent()) {
            return certificateMapper.toResponse(existingCert.get());
        }

        // 2. Generate Certificate image
        String studentName = student.getFullName();
        String title = assignment.getTitle();
        Double marks = submission.getMarks();
        Double maxMarks = assignment.getTotalMarks();
        LocalDateTime completedAt = submission.getReviewedAt() != null ? submission.getReviewedAt() : submission.getSubmittedAt();
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
        String completionDate = completedAt.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String teacherName = assignment.getTeacher() != null ? assignment.getTeacher().getFullName() : "Course Instructor";

        byte[] certBytes = renderCertificate(studentName, title, marks, maxMarks, completionDate, teacherName, isQuiz);

        // 3. Upload Certificate to Cloudinary
        String folder = "assignment_system/certificates";
        String certificateUrl = cloudinaryService.uploadBytes(certBytes, folder);
        if (certificateUrl == null) {
            throw new CustomException("Cloudinary upload failed: secure URL is empty", 500);
        }

        // Parse public ID from URL or set placeholder (Cloudinary public ID is useful but URL is essential)
        String publicId = null;
        try {
            int lastSlash = certificateUrl.lastIndexOf('/');
            int dot = certificateUrl.lastIndexOf('.');
            if (lastSlash != -1 && dot != -1 && lastSlash < dot) {
                publicId = certificateUrl.substring(lastSlash + 1, dot);
            }
        } catch (Exception e) {
            // Ignore parsing error
        }

        // 4. Save to Database
        Certificate certificate = Certificate.builder()
                .student(student)
                .assignment(isQuiz ? null : assignment)
                .quiz(isQuiz ? assignment : null)
                .certificateUrl(certificateUrl)
                .cloudinaryPublicId(publicId)
                .marks(marks)
                .generatedAt(LocalDateTime.now())
                .certificateType(isQuiz ? "QUIZ" : "ASSIGNMENT")
                .build();

        Certificate saved = certificateRepository.save(certificate);
        return certificateMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> getStudentCertificates(String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        List<Certificate> certs = certificateRepository.findByStudentId(student.getId());
        return certificateMapper.toResponseList(certs);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateById(Long id, String email, String role) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));

        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            if (!cert.getStudent().getId().equals(student.getId())) {
                throw new UnauthorizedException("Access Denied: You can only view your own certificates");
            }
        }

        return certificateMapper.toResponse(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByAssignment(Long assignmentId, String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        Certificate cert = certificateRepository.findByStudentIdAndAssignmentId(student.getId(), assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found for this assignment"));
        return certificateMapper.toResponse(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByQuiz(Long quizId, String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        Certificate cert = certificateRepository.findByStudentIdAndQuizId(student.getId(), quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found for this quiz"));
        return certificateMapper.toResponse(cert);
    }

    private byte[] renderCertificate(String studentName, String title, Double marks, Double maxMarks, String completionDate, String teacherName, boolean isQuiz) {
        int width = 1200;
        int height = 800;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();

        // Anti-aliasing
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Background
        g2d.setColor(new Color(253, 253, 253));
        g2d.fillRect(0, 0, width, height);

        // Subtle gradient in top-left
        GradientPaint cornerGradient = new GradientPaint(0, 0, new Color(108, 29, 95, 20), 400, 400, new Color(108, 29, 95, 0));
        g2d.setPaint(cornerGradient);
        g2d.fillRect(0, 0, 500, 500);

        // Outer border
        g2d.setColor(new Color(108, 29, 95)); // Brand color: #6C1D5F
        g2d.setStroke(new BasicStroke(14));
        g2d.drawRect(20, 20, width - 40, height - 40);

        // Inner thin border
        g2d.setColor(new Color(210, 210, 210));
        g2d.setStroke(new BasicStroke(2));
        g2d.drawRect(35, 35, width - 70, height - 70);

        // Corner ornaments
        g2d.setColor(new Color(108, 29, 95));
        g2d.fillRect(30, 30, 50, 6);
        g2d.fillRect(30, 30, 6, 50);
        g2d.fillRect(width - 80, 30, 50, 6);
        g2d.fillRect(width - 36, 30, 6, 50);
        g2d.fillRect(30, height - 36, 50, 6);
        g2d.fillRect(30, height - 80, 6, 50);
        g2d.fillRect(width - 80, height - 36, 50, 6);
        g2d.fillRect(width - 36, height - 80, 6, 50);

        // Xebia Logo (Top Right)
        int logoX = width - 210;
        int logoY = 60;
        g2d.setColor(new Color(108, 29, 95));
        g2d.fillRoundRect(logoX, logoY, 40, 40, 10, 10);
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("SansSerif", Font.BOLD, 26));
        g2d.drawString("X", logoX + 11, logoY + 29);

        g2d.setColor(new Color(51, 51, 51));
        g2d.setFont(new Font("SansSerif", Font.BOLD, 22));
        g2d.drawString("xebia", logoX + 50, logoY + 29);

        // Header Title
        g2d.setColor(new Color(108, 29, 95));
        g2d.setFont(new Font("Serif", Font.BOLD, 48));
        drawCenteredString(g2d, "Certificate of Completion", width, 200);

        // Underline
        g2d.setColor(new Color(220, 200, 215));
        g2d.fillRect(width / 2 - 180, 220, 360, 3);

        // Greeting
        g2d.setColor(new Color(102, 102, 102));
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 20));
        drawCenteredString(g2d, "This certificate is proudly awarded to", width, 285);

        // Student Name
        g2d.setColor(new Color(51, 51, 51));
        g2d.setFont(new Font("SansSerif", Font.BOLD, 38));
        drawCenteredString(g2d, studentName, width, 360);

        // Underline Student Name
        g2d.setColor(new Color(108, 29, 95));
        g2d.fillRect(width / 2 - 220, 380, 440, 2);

        // Description text
        g2d.setColor(new Color(102, 102, 102));
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 18));
        drawCenteredString(g2d, "for successfully completing the " + (isQuiz ? "Quiz" : "Assignment"), width, 445);

        // Assignment / Quiz Title
        g2d.setColor(new Color(51, 51, 51));
        g2d.setFont(new Font("SansSerif", Font.BOLD, 26));
        drawCenteredString(g2d, "\"" + title + "\"", width, 495);

        // Score details
        g2d.setColor(new Color(102, 102, 102));
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 18));
        String marksText = String.format("Marks Obtained: %.2f / %.2f", marks, maxMarks);
        drawCenteredString(g2d, marksText, width, 555);

        // Date
        String dateText = "Completion Date: " + completionDate;
        drawCenteredString(g2d, dateText, width, 595);

        // Signatures (Bottom)
        g2d.setColor(new Color(102, 102, 102));
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 16));

        // Left Signature (Instructor)
        g2d.fillRect(150, 680, 250, 1);
        String instructorLabel = (teacherName != null && !teacherName.isBlank()) ? teacherName : "Course Instructor";
        g2d.drawString(instructorLabel, 150, 710);
        g2d.setFont(new Font("SansSerif", Font.ITALIC, 14));
        g2d.drawString(isQuiz ? "System Evaluated" : "Evaluated By", 150, 730);

        // Right Signature (Verification)
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 16));
        g2d.fillRect(width - 400, 680, 250, 1);
        g2d.drawString("Authorized Signature", width - 400, 710);
        g2d.setFont(new Font("SansSerif", Font.ITALIC, 14));
        g2d.drawString("System Generated Verification", width - 400, 730);

        g2d.dispose();

        // Convert to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "png", baos);
        } catch (IOException e) {
            throw new CustomException("Failed to render certificate image", 500);
        }
        return baos.toByteArray();
    }

    private void drawCenteredString(Graphics2D g, String text, int width, int y) {
        FontMetrics metrics = g.getFontMetrics(g.getFont());
        int x = (width - metrics.stringWidth(text)) / 2;
        g.drawString(text, x, y);
    }
}
