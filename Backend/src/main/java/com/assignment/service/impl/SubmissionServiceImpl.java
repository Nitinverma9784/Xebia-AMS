package com.assignment.service.impl;

import com.assignment.dto.request.StudentSubmitRequest;
import com.assignment.dto.request.SubmissionReviewRequest;
import com.assignment.dto.response.AssignmentStatusResponse;
import com.assignment.dto.response.StudentResponse;
import com.assignment.dto.response.SubmissionResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Student;
import com.assignment.entity.Submission;
import com.assignment.entity.Teacher;
import com.assignment.enums.SubmissionStatus;
import com.assignment.exception.BadRequestException;
import com.assignment.exception.ResourceNotFoundException;
import com.assignment.mapper.SubmissionMapper;
import com.assignment.mapper.UserMapper;
import com.assignment.repository.AssignmentRepository;
import com.assignment.repository.StudentRepository;
import com.assignment.repository.SubmissionRepository;
import com.assignment.repository.TeacherRepository;
import com.assignment.service.CloudinaryService;
import com.assignment.service.RedisService;
import com.assignment.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CloudinaryService cloudinaryService;
    private final RedisService redisService;
    private final SubmissionMapper submissionMapper;
    private final UserMapper userMapper;

    private Student getStudent(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (student.getRole() != com.assignment.enums.Role.STUDENT) {
            throw new com.assignment.exception.UnauthorizedException("Access Denied: Only students can perform this action");
        }
        return student;
    }

    private Teacher getTeacher(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        if (teacher.getRole() != com.assignment.enums.Role.TEACHER) {
            throw new com.assignment.exception.UnauthorizedException("Access Denied: Only teachers can perform this action");
        }
        return teacher;
    }

    private void rebuildAssignmentStatusCache(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) return;

        List<Student> students = studentRepository.findByBatchId(assignment.getBatch().getId());
        List<Long> allStudentIds = students.stream().map(Student::getId).toList();

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        List<Long> submittedStudentIds = submissions.stream()
                .filter(sub -> sub.getStatus() == SubmissionStatus.SUBMITTED || sub.getStatus() == SubmissionStatus.REVIEWED)
                .map(sub -> sub.getStudent().getId())
                .toList();

        List<Long> pendingStudentIds = allStudentIds.stream()
                .filter(id -> !submittedStudentIds.contains(id))
                .toList();

        int total = allStudentIds.size();
        int submitted = submittedStudentIds.size();
        int pending = pendingStudentIds.size();
        double pct = total > 0 ? ((double) submitted / total) * 100.0 : 0.0;

        AssignmentStatusResponse cache = AssignmentStatusResponse.builder()
                .submittedStudentIds(submittedStudentIds)
                .pendingStudentIds(pendingStudentIds)
                .submittedCount(submitted)
                .pendingCount(pending)
                .completionPercentage(Math.round(pct * 100.0) / 100.0)
                .build();

        redisService.saveAssignmentStatus(assignmentId, cache);
    }

    @Override
    @Transactional
    public SubmissionResponse submitAssignment(Long assignmentId, StudentSubmitRequest request, String studentEmail) {
        Student student = getStudent(studentEmail);
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (student.getBatch() == null || !student.getBatch().getId().equals(assignment.getBatch().getId())) {
            throw new BadRequestException("This assignment is not assigned to your batch");
        }

        // Validate deadline
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();
        if (today.isAfter(assignment.getDueDate()) || 
           (today.isEqual(assignment.getDueDate()) && nowTime.isAfter(assignment.getDueTime()))) {
            if (!assignment.getLateSubmissionAllowed()) {
                throw new BadRequestException("Late submissions are not allowed for this assignment");
            }
        }

        // File upload
        String fileUrl = null;
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            if (request.getFile().getSize() > assignment.getMaxFileSize()) {
                throw new BadRequestException("File size exceeds maximum allowed size of " + (assignment.getMaxFileSize() / (1024 * 1024)) + " MB");
            }
            fileUrl = cloudinaryService.uploadFile(request.getFile(), "assignment_system/submissions");
        } else {
            throw new BadRequestException("Submission file is required");
        }

        // Check if student already has a submission (allow resubmission / update)
        Optional<Submission> existingSub = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId());
        Submission submission;
        if (existingSub.isPresent()) {
            submission = existingSub.get();
            submission.setSubmissionUrl(fileUrl);
            submission.setComment(request.getComment());
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setStatus(SubmissionStatus.SUBMITTED);
        } else {
            submission = Submission.builder()
                    .assignment(assignment)
                    .student(student)
                    .submissionUrl(fileUrl)
                    .comment(request.getComment())
                    .submittedAt(LocalDateTime.now())
                    .status(SubmissionStatus.SUBMITTED)
                    .build();
        }

        Submission savedSubmission = submissionRepository.save(submission);

        // Update Redis
        rebuildAssignmentStatusCache(assignmentId);

        return submissionMapper.toResponse(savedSubmission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmittedSubmissions(Long assignmentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        // Read from Redis to quickly get student ids
        AssignmentStatusResponse cache = redisService.getAssignmentStatus(assignmentId);
        if (cache == null) {
            rebuildAssignmentStatusCache(assignmentId);
            cache = redisService.getAssignmentStatus(assignmentId);
        }

        List<Long> studentIds = cache.getSubmittedStudentIds();
        // Retrieve submission records for those student IDs
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId).stream()
                .filter(sub -> studentIds.contains(sub.getStudent().getId()))
                .toList();

        return submissionMapper.toResponseList(submissions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getPendingStudents(Long assignmentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        // Read from Redis to quickly get pending student ids
        AssignmentStatusResponse cache = redisService.getAssignmentStatus(assignmentId);
        if (cache == null) {
            rebuildAssignmentStatusCache(assignmentId);
            cache = redisService.getAssignmentStatus(assignmentId);
        }

        List<Long> pendingStudentIds = cache.getPendingStudentIds();
        List<Student> pendingStudents = studentRepository.findAllById(pendingStudentIds);

        return userMapper.toStudentResponseList(pendingStudents);
    }

    @Override
    @Transactional
    public SubmissionResponse reviewSubmission(Long submissionId, SubmissionReviewRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Submission submission = submissionRepository.findByIdAndAssignmentTeacherId(submissionId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found or unauthorized"));

        if (request.getMarks() > submission.getAssignment().getTotalMarks()) {
            throw new BadRequestException("Assigned marks cannot exceed total assignment marks of " + submission.getAssignment().getTotalMarks());
        }

        submission.setMarks(request.getMarks());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.REVIEWED);
        submission.setReviewedAt(LocalDateTime.now());

        Submission reviewedSubmission = submissionRepository.save(submission);
        return submissionMapper.toResponse(reviewedSubmission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getStudentSubmissions(String studentEmail, int page, int size) {
        Student student = getStudent(studentEmail);
        Pageable pageable = PageRequest.of(page, size);
        Page<Submission> submissionPage = submissionRepository.findByStudentId(student.getId(), pageable);
        return submissionMapper.toResponseList(submissionPage.getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionById(Long id, String email, String role) {
        Submission submission;
        if ("TEACHER".equals(role)) {
            Teacher teacher = getTeacher(email);
            submission = submissionRepository.findByIdAndAssignmentTeacherId(id, teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found or unauthorized"));
        } else {
            Student student = getStudent(email);
            submission = submissionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
            if (!submission.getStudent().getId().equals(student.getId())) {
                throw new BadRequestException("Unauthorized to view this submission");
            }
        }
        return submissionMapper.toResponse(submission);
    }
}
