package com.assignment.mapper;

import com.assignment.dto.response.SubjectResponse;
import com.assignment.entity.Subject;
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
public class SubjectMapperImpl implements SubjectMapper {

    @Override
    public SubjectResponse toResponse(Subject subject) {
        if ( subject == null ) {
            return null;
        }

        SubjectResponse.SubjectResponseBuilder subjectResponse = SubjectResponse.builder();

        subjectResponse.id( subject.getId() );
        subjectResponse.subjectCode( subject.getSubjectCode() );
        subjectResponse.subjectName( subject.getSubjectName() );
        subjectResponse.semester( subject.getSemester() );
        subjectResponse.department( subject.getDepartment() );

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
