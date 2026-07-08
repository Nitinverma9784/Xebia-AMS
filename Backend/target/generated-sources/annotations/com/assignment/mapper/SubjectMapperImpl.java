package com.assignment.mapper;

import com.assignment.dto.response.SubjectResponse;
import com.assignment.entity.Subject;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-08T12:35:58+0530",
    comments = "version: 1.6.0, compiler: Eclipse JDT (IDE) 3.40.0.v20241112-0530, environment: Java 21.0.5 (Eclipse Adoptium)"
)
@Component
public class SubjectMapperImpl implements SubjectMapper {

    @Override
    public SubjectResponse toResponse(Subject subject) {
        if ( subject == null ) {
            return null;
        }

        SubjectResponse.SubjectResponseBuilder subjectResponse = SubjectResponse.builder();

        subjectResponse.department( subject.getDepartment() );
        subjectResponse.id( subject.getId() );
        subjectResponse.semester( subject.getSemester() );
        subjectResponse.subjectCode( subject.getSubjectCode() );
        subjectResponse.subjectName( subject.getSubjectName() );

        return subjectResponse.build();
    }

    @Override
    public List<SubjectResponse> toResponseList(List<Subject> subjects) {
        if ( subjects == null ) {
            return null;
        }

        List<SubjectResponse> list = new ArrayList<SubjectResponse>( subjects.size() );
        for ( Subject subject : subjects ) {
            list.add( toResponse( subject ) );
        }

        return list;
    }
}
