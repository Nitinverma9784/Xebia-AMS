package com.assignment.controller;

import com.assignment.dto.request.AssignmentRequest;
import com.assignment.dto.response.ApiResponse;
import com.assignment.dto.response.AssignmentResponse;
import com.assignment.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    // --- Teacher Assignment Endpoints ---

    @PostMapping(value = "/api/teacher/assignments", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @Valid @ModelAttribute AssignmentRequest request,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.createAssignment(request, principal.getName());
        return ResponseEntity.status(201).body(ApiResponse.success("Assignment created successfully", response, 201));
    }

    @GetMapping("/api/teacher/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAllAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        List<AssignmentResponse> response = assignmentService.getAllAssignments(principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Assignments retrieved successfully", response));
    }

    @GetMapping("/api/teacher/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentDetailsTeacher(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.getAssignmentById(assignmentId, principal.getName(), "TEACHER");
        return ResponseEntity.ok(ApiResponse.success("Assignment details retrieved successfully", response));
    }

    @PutMapping(value = "/api/teacher/assignments/{assignmentId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable Long assignmentId,
            @Valid @ModelAttribute AssignmentRequest request,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.updateAssignment(assignmentId, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", response));
    }

    @DeleteMapping("/api/teacher/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        assignmentService.deleteAssignment(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully", null));
    }

    // --- Student Assignment Endpoints ---

    @GetMapping("/api/student/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getStudentAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        List<AssignmentResponse> response = assignmentService.getStudentAssignments(principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Assigned assignments retrieved successfully", response));
    }

    @GetMapping("/api/student/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentDetailsStudent(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.getAssignmentById(assignmentId, principal.getName(), "STUDENT");
        return ResponseEntity.ok(ApiResponse.success("Assignment details retrieved successfully", response));
    }
}
