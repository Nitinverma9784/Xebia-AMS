package com.assignment.service.impl;

import com.assignment.dto.request.AssignmentRequest;
import com.assignment.dto.response.AssignmentResponse;
import com.assignment.dto.response.AssignmentStatusResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Batch;
import com.assignment.entity.Student;
import com.assignment.entity.Submission;
import com.assignment.entity.Teacher;
import com.assignment.enums.AssignmentStatus;
import com.assignment.enums.SubmissionStatus;
import com.assignment.exception.BadRequestException;
import com.assignment.exception.ResourceNotFoundException;
import com.assignment.mapper.AssignmentMapper;
import com.assignment.repository.AssignmentRepository;
import com.assignment.repository.BatchRepository;
import com.assignment.repository.StudentRepository;
import com.assignment.repository.SubmissionRepository;
import com.assignment.repository.TeacherRepository;
import com.assignment.service.AssignmentService;
import com.assignment.service.CloudinaryService;
import com.assignment.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final SubmissionRepository submissionRepository;
    private final CloudinaryService cloudinaryService;
    private final RedisService redisService;
    private final AssignmentMapper assignmentMapper;

    private Teacher getTeacher(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        if (teacher.getRole() != com.assignment.enums.Role.TEACHER) {
            throw new com.assignment.exception.UnauthorizedException("Access Denied: Only teachers can perform this action");
        }
        return teacher;
    }

    private Student getStudent(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
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
    public AssignmentResponse createAssignment(AssignmentRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(request.getBatchId(), teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }

        String resourceUrl = null;
        if (request.getResourceFile() != null && !request.getResourceFile().isEmpty()) {
            // Validate size
            if (request.getResourceFile().getSize() > request.getMaxFileSize()) {
                throw new BadRequestException("Uploaded resource file exceeds max allowed size of " + (request.getMaxFileSize() / (1024 * 1024)) + " MB");
            }
            resourceUrl = cloudinaryService.uploadFile(request.getResourceFile(), "assignment_system/resources");
        }

        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .instructions(request.getInstructions())
                .assignmentType(request.getAssignmentType())
                .subject(request.getSubject())
                .topic(request.getTopic())
                .batch(batch)
                .teacher(teacher)
                .resourceUrl(resourceUrl)
                .externalLink(request.getExternalLink())
                .submissionType(request.getSubmissionType())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .dueDate(request.getDueDate())
                .dueTime(request.getDueTime())
                .lateSubmissionAllowed(request.getLateSubmissionAllowed() != null ? request.getLateSubmissionAllowed() : false)
                .maxFileSize(request.getMaxFileSize() != null ? request.getMaxFileSize() : 10485760L)
                .status(AssignmentStatus.ACTIVE)
                .build();

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // Initialize Redis cache
        rebuildAssignmentStatusCache(savedAssignment.getId());

        return assignmentMapper.toResponse(savedAssignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAllAssignments(String teacherEmail, int page, int size) {
        Teacher teacher = getTeacher(teacherEmail);
        Pageable pageable = PageRequest.of(page, size);
        Page<Assignment> assignmentPage = assignmentRepository.findByTeacherId(teacher.getId(), pageable);
        return assignmentMapper.toResponseList(assignmentPage.getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getStudentAssignments(String studentEmail, int page, int size) {
        Student student = getStudent(studentEmail);
        if (student.getBatch() == null) {
            return List.of();
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Assignment> assignmentPage = assignmentRepository.findByBatchId(student.getBatch().getId(), pageable);
        return assignmentMapper.toResponseList(assignmentPage.getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id, String email, String role) {
        Assignment assignment;
        if ("TEACHER".equals(role)) {
            Teacher teacher = getTeacher(email);
            assignment = assignmentRepository.findByIdAndTeacherId(id, teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));
        } else {
            Student student = getStudent(email);
            if (student.getBatch() == null) {
                throw new BadRequestException("Student has not been assigned to a batch yet");
            }
            assignment = assignmentRepository.findByIdAndBatchId(id, student.getBatch().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));
        }
        return assignmentMapper.toResponse(assignment);
    }

    @Override
    @Transactional
    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        Batch batch = batchRepository.findByIdAndTeacherId(request.getBatchId(), teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }

        // Check if batch changed (if so, we will need to update Redis status cache later)
        boolean batchChanged = !assignment.getBatch().getId().equals(batch.getId());

        if (request.getResourceFile() != null && !request.getResourceFile().isEmpty()) {
            if (request.getResourceFile().getSize() > request.getMaxFileSize()) {
                throw new BadRequestException("Uploaded resource file exceeds max allowed size of " + (request.getMaxFileSize() / (1024 * 1024)) + " MB");
            }
            String resourceUrl = cloudinaryService.uploadFile(request.getResourceFile(), "assignment_system/resources");
            assignment.setResourceUrl(resourceUrl);
        }

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setInstructions(request.getInstructions());
        assignment.setAssignmentType(request.getAssignmentType());
        assignment.setSubject(request.getSubject());
        assignment.setTopic(request.getTopic());
        assignment.setBatch(batch);
        assignment.setExternalLink(request.getExternalLink());
        assignment.setSubmissionType(request.getSubmissionType());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setPassingMarks(request.getPassingMarks());
        assignment.setDueDate(request.getDueDate());
        assignment.setDueTime(request.getDueTime());
        assignment.setLateSubmissionAllowed(request.getLateSubmissionAllowed() != null ? request.getLateSubmissionAllowed() : false);
        assignment.setMaxFileSize(request.getMaxFileSize() != null ? request.getMaxFileSize() : 10485760L);

        Assignment updatedAssignment = assignmentRepository.save(assignment);

        // Sync Redis cache
        rebuildAssignmentStatusCache(updatedAssignment.getId());

        return assignmentMapper.toResponse(updatedAssignment);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long id, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        assignmentRepository.delete(assignment);

        // Delete Redis cache key
        redisService.deleteAssignmentStatus(id);
    }
}
