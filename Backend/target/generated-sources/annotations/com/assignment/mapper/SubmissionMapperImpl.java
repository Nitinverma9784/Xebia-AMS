package com.assignment.mapper;

import com.assignment.dto.response.SubmissionResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Student;
import com.assignment.entity.Submission;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-06T21:30:59+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.40.0.v20241112-0530, environment: Java 21.0.5 (Eclipse Adoptium)"
)
@Component
public class SubmissionMapperImpl implements SubmissionMapper {

    @Override
    public SubmissionResponse toResponse(Submission submission) {
        if ( submission == null ) {
            return null;
        }

        SubmissionResponse.SubmissionResponseBuilder submissionResponse = SubmissionResponse.builder();

        submissionResponse.assignmentId( submissionAssignmentId( submission ) );
        submissionResponse.assignmentTitle( submissionAssignmentTitle( submission ) );
        submissionResponse.studentId( submissionStudentId( submission ) );
        submissionResponse.studentName( submissionStudentFullName( submission ) );
        submissionResponse.comment( submission.getComment() );
        submissionResponse.createdAt( submission.getCreatedAt() );
        submissionResponse.feedback( submission.getFeedback() );
        submissionResponse.id( submission.getId() );
        submissionResponse.marks( submission.getMarks() );
        submissionResponse.reviewedAt( submission.getReviewedAt() );
        submissionResponse.status( submission.getStatus() );
        submissionResponse.submissionUrl( submission.getSubmissionUrl() );
        submissionResponse.submittedAt( submission.getSubmittedAt() );
        submissionResponse.updatedAt( submission.getUpdatedAt() );

        return submissionResponse.build();
    }

    @Override
    public List<SubmissionResponse> toResponseList(List<Submission> submissions) {
        if ( submissions == null ) {
            return null;
        }

        List<SubmissionResponse> list = new ArrayList<SubmissionResponse>( submissions.size() );
        for ( Submission submission : submissions ) {
            list.add( toResponse( submission ) );
        }

        return list;
    }

    private Long submissionAssignmentId(Submission submission) {
        if ( submission == null ) {
            return null;
        }
        Assignment assignment = submission.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        Long id = assignment.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String submissionAssignmentTitle(Submission submission) {
        if ( submission == null ) {
            return null;
        }
        Assignment assignment = submission.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        String title = assignment.getTitle();
        if ( title == null ) {
            return null;
        }
        return title;
    }

    private Long submissionStudentId(Submission submission) {
        if ( submission == null ) {
            return null;
        }
        Student student = submission.getStudent();
        if ( student == null ) {
            return null;
        }
        Long id = student.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String submissionStudentFullName(Submission submission) {
        if ( submission == null ) {
            return null;
        }
        Student student = submission.getStudent();
        if ( student == null ) {
            return null;
        }
        String fullName = student.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
