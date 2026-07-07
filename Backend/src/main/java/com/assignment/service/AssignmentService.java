package com.assignment.service;

import com.assignment.dto.request.AssignmentRequest;
import com.assignment.dto.response.AssignmentResponse;

import java.util.List;

public interface AssignmentService {
    AssignmentResponse createAssignment(AssignmentRequest request, String teacherEmail);
    List<AssignmentResponse> getAllAssignments(String teacherEmail, int page, int size);
    List<AssignmentResponse> getStudentAssignments(String studentEmail, int page, int size);
    AssignmentResponse getAssignmentById(Long id, String email, String role);
    AssignmentResponse updateAssignment(Long id, AssignmentRequest request, String teacherEmail);
    void deleteAssignment(Long id, String teacherEmail);
}
