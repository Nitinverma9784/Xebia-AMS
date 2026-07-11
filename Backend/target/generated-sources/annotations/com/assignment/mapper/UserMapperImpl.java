package com.assignment.mapper;

import com.assignment.dto.response.StudentResponse;
import com.assignment.dto.response.TeacherResponse;
import com.assignment.entity.Batch;
import com.assignment.entity.Student;
import com.assignment.entity.Teacher;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-11T09:49:48+0530",
    comments = "version: 1.6.0, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public TeacherResponse toTeacherResponse(Teacher teacher) {
        if ( teacher == null ) {
            return null;
        }

        TeacherResponse.TeacherResponseBuilder teacherResponse = TeacherResponse.builder();

        teacherResponse.id( teacher.getId() );
        teacherResponse.fullName( teacher.getFullName() );
        teacherResponse.email( teacher.getEmail() );
        teacherResponse.phone( teacher.getPhone() );
        teacherResponse.role( teacher.getRole() );
        teacherResponse.createdAt( teacher.getCreatedAt() );
        teacherResponse.updatedAt( teacher.getUpdatedAt() );

        return teacherResponse.build();
    }

    @Override
    public StudentResponse toStudentResponse(Student student) {
        if ( student == null ) {
            return null;
        }

        StudentResponse.StudentResponseBuilder studentResponse = StudentResponse.builder();

        studentResponse.batchId( studentBatchId( student ) );
        studentResponse.batchName( studentBatchBatchName( student ) );
        studentResponse.id( student.getId() );
        studentResponse.fullName( student.getFullName() );
        studentResponse.email( student.getEmail() );
        studentResponse.phone( student.getPhone() );
        studentResponse.role( student.getRole() );
        studentResponse.createdAt( student.getCreatedAt() );
        studentResponse.updatedAt( student.getUpdatedAt() );

        return studentResponse.build();
    }

    @Override
    public List<StudentResponse> toStudentResponseList(List<Student> students) {
        if ( students == null ) {
            return null;
        }

        List<StudentResponse> list = new ArrayList<StudentResponse>( students.size() );
        for ( Student student : students ) {
            list.add( toStudentResponse( student ) );
        }

        return list;
    }

    private Long studentBatchId(Student student) {
        Batch batch = student.getBatch();
        if ( batch == null ) {
            return null;
        }
        return batch.getId();
    }

    private String studentBatchBatchName(Student student) {
        Batch batch = student.getBatch();
        if ( batch == null ) {
            return null;
        }
        return batch.getBatchName();
    }
}
