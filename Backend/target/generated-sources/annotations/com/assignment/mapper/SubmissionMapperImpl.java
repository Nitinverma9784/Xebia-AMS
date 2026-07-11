package com.assignment.mapper;

import com.assignment.dto.response.SubmissionResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Batch;
import com.assignment.entity.Student;
import com.assignment.entity.Submission;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-11T09:49:49+0530",
    comments = "version: 1.6.0, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
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
        submissionResponse.studentEmail( submissionStudentEmail( submission ) );
        submissionResponse.studentBatchName( submissionStudentBatchBatchName( submission ) );
        submissionResponse.id( submission.getId() );
        submissionResponse.submissionUrl( submission.getSubmissionUrl() );
        submissionResponse.comment( submission.getComment() );
        submissionResponse.submittedAt( submission.getSubmittedAt() );
        submissionResponse.marks( submission.getMarks() );
        submissionResponse.feedback( submission.getFeedback() );
        submissionResponse.status( submission.getStatus() );
        submissionResponse.reviewedAt( submission.getReviewedAt() );
        submissionResponse.createdAt( submission.getCreatedAt() );
        submissionResponse.updatedAt( submission.getUpdatedAt() );
        submissionResponse.quizAnswers( submission.getQuizAnswers() );

        submissionResponse.studentEnrollment( "ENR-" + submission.getStudent().getId() );

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
        Assignment assignment = submission.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        return assignment.getId();
    }

    private String submissionAssignmentTitle(Submission submission) {
        Assignment assignment = submission.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        return assignment.getTitle();
    }

    private Long submissionStudentId(Submission submission) {
        Student student = submission.getStudent();
        if ( student == null ) {
            return null;
        }
        return student.getId();
    }

    private String submissionStudentFullName(Submission submission) {
        Student student = submission.getStudent();
        if ( student == null ) {
            return null;
        }
        return student.getFullName();
    }

    private String submissionStudentEmail(Submission submission) {
        Student student = submission.getStudent();
        if ( student == null ) {
            return null;
        }
        return student.getEmail();
    }

    private String submissionStudentBatchBatchName(Submission submission) {
        Student student = submission.getStudent();
        if ( student == null ) {
            return null;
        }
        Batch batch = student.getBatch();
        if ( batch == null ) {
            return null;
        }
        return batch.getBatchName();
    }
}
