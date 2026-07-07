package com.assignment.mapper;

import com.assignment.dto.response.AssignmentResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Batch;
import com.assignment.entity.Teacher;
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
public class AssignmentMapperImpl implements AssignmentMapper {

    @Override
    public AssignmentResponse toResponse(Assignment assignment) {
        if ( assignment == null ) {
            return null;
        }

        AssignmentResponse.AssignmentResponseBuilder assignmentResponse = AssignmentResponse.builder();

        assignmentResponse.batchId( assignmentBatchId( assignment ) );
        assignmentResponse.batchName( assignmentBatchBatchName( assignment ) );
        assignmentResponse.teacherId( assignmentTeacherId( assignment ) );
        assignmentResponse.teacherName( assignmentTeacherFullName( assignment ) );
        assignmentResponse.assignmentType( assignment.getAssignmentType() );
        assignmentResponse.createdAt( assignment.getCreatedAt() );
        assignmentResponse.description( assignment.getDescription() );
        assignmentResponse.dueDate( assignment.getDueDate() );
        assignmentResponse.dueTime( assignment.getDueTime() );
        assignmentResponse.externalLink( assignment.getExternalLink() );
        assignmentResponse.id( assignment.getId() );
        assignmentResponse.instructions( assignment.getInstructions() );
        assignmentResponse.lateSubmissionAllowed( assignment.getLateSubmissionAllowed() );
        assignmentResponse.maxFileSize( assignment.getMaxFileSize() );
        assignmentResponse.passingMarks( assignment.getPassingMarks() );
        assignmentResponse.resourceUrl( assignment.getResourceUrl() );
        assignmentResponse.status( assignment.getStatus() );
        assignmentResponse.subject( assignment.getSubject() );
        assignmentResponse.submissionType( assignment.getSubmissionType() );
        assignmentResponse.title( assignment.getTitle() );
        assignmentResponse.topic( assignment.getTopic() );
        assignmentResponse.totalMarks( assignment.getTotalMarks() );
        assignmentResponse.updatedAt( assignment.getUpdatedAt() );

        return assignmentResponse.build();
    }

    @Override
    public List<AssignmentResponse> toResponseList(List<Assignment> assignments) {
        if ( assignments == null ) {
            return null;
        }

        List<AssignmentResponse> list = new ArrayList<AssignmentResponse>( assignments.size() );
        for ( Assignment assignment : assignments ) {
            list.add( toResponse( assignment ) );
        }

        return list;
    }

    private Long assignmentBatchId(Assignment assignment) {
        if ( assignment == null ) {
            return null;
        }
        Batch batch = assignment.getBatch();
        if ( batch == null ) {
            return null;
        }
        Long id = batch.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String assignmentBatchBatchName(Assignment assignment) {
        if ( assignment == null ) {
            return null;
        }
        Batch batch = assignment.getBatch();
        if ( batch == null ) {
            return null;
        }
        String batchName = batch.getBatchName();
        if ( batchName == null ) {
            return null;
        }
        return batchName;
    }

    private Long assignmentTeacherId(Assignment assignment) {
        if ( assignment == null ) {
            return null;
        }
        Teacher teacher = assignment.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        Long id = teacher.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String assignmentTeacherFullName(Assignment assignment) {
        if ( assignment == null ) {
            return null;
        }
        Teacher teacher = assignment.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        String fullName = teacher.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
