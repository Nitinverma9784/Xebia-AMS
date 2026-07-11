package com.assignment.mapper;

import com.assignment.dto.response.AssignmentResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Batch;
import com.assignment.entity.Teacher;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-11T09:49:48+0530",
    comments = "version: 1.6.0, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class AssignmentMapperImpl implements AssignmentMapper {

    @Autowired
    private QuestionMapper questionMapper;

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
        assignmentResponse.id( assignment.getId() );
        assignmentResponse.title( assignment.getTitle() );
        assignmentResponse.description( assignment.getDescription() );
        assignmentResponse.instructions( assignment.getInstructions() );
        assignmentResponse.assignmentType( assignment.getAssignmentType() );
        assignmentResponse.subject( assignment.getSubject() );
        assignmentResponse.topic( assignment.getTopic() );
        assignmentResponse.resourceUrl( assignment.getResourceUrl() );
        assignmentResponse.externalLink( assignment.getExternalLink() );
        assignmentResponse.submissionType( assignment.getSubmissionType() );
        assignmentResponse.totalMarks( assignment.getTotalMarks() );
        assignmentResponse.passingMarks( assignment.getPassingMarks() );
        assignmentResponse.dueDate( assignment.getDueDate() );
        assignmentResponse.dueTime( assignment.getDueTime() );
        assignmentResponse.lateSubmissionAllowed( assignment.getLateSubmissionAllowed() );
        assignmentResponse.maxFileSize( assignment.getMaxFileSize() );
        assignmentResponse.status( assignment.getStatus() );
        assignmentResponse.createdAt( assignment.getCreatedAt() );
        assignmentResponse.updatedAt( assignment.getUpdatedAt() );
        assignmentResponse.questions( questionMapper.toResponseList( assignment.getQuestions() ) );

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
        Batch batch = assignment.getBatch();
        if ( batch == null ) {
            return null;
        }
        return batch.getId();
    }

    private String assignmentBatchBatchName(Assignment assignment) {
        Batch batch = assignment.getBatch();
        if ( batch == null ) {
            return null;
        }
        return batch.getBatchName();
    }

    private Long assignmentTeacherId(Assignment assignment) {
        Teacher teacher = assignment.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        return teacher.getId();
    }

    private String assignmentTeacherFullName(Assignment assignment) {
        Teacher teacher = assignment.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        return teacher.getFullName();
    }
}
