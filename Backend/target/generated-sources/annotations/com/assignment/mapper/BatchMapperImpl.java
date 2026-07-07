package com.assignment.mapper;

import com.assignment.dto.response.BatchResponse;
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
public class BatchMapperImpl implements BatchMapper {

    @Override
    public BatchResponse toResponse(Batch batch) {
        if ( batch == null ) {
            return null;
        }

        BatchResponse.BatchResponseBuilder batchResponse = BatchResponse.builder();

        batchResponse.teacherId( batchTeacherId( batch ) );
        batchResponse.teacherName( batchTeacherFullName( batch ) );
        batchResponse.batchName( batch.getBatchName() );
        batchResponse.createdAt( batch.getCreatedAt() );
        batchResponse.description( batch.getDescription() );
        batchResponse.id( batch.getId() );
        batchResponse.updatedAt( batch.getUpdatedAt() );

        batchResponse.studentsCount( batch.getStudents() != null ? batch.getStudents().size() : 0 );

        return batchResponse.build();
    }

    @Override
    public List<BatchResponse> toResponseList(List<Batch> batches) {
        if ( batches == null ) {
            return null;
        }

        List<BatchResponse> list = new ArrayList<BatchResponse>( batches.size() );
        for ( Batch batch : batches ) {
            list.add( toResponse( batch ) );
        }

        return list;
    }

    private Long batchTeacherId(Batch batch) {
        if ( batch == null ) {
            return null;
        }
        Teacher teacher = batch.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        Long id = teacher.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String batchTeacherFullName(Batch batch) {
        if ( batch == null ) {
            return null;
        }
        Teacher teacher = batch.getTeacher();
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
