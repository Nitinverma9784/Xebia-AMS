package com.assignment.mapper;

import com.assignment.dto.response.CertificateResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Certificate;
import com.assignment.entity.Student;
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
public class CertificateMapperImpl implements CertificateMapper {

    @Override
    public CertificateResponse toResponse(Certificate certificate) {
        if ( certificate == null ) {
            return null;
        }

        CertificateResponse.CertificateResponseBuilder certificateResponse = CertificateResponse.builder();

        certificateResponse.studentId( certificateStudentId( certificate ) );
        certificateResponse.studentName( certificateStudentFullName( certificate ) );
        certificateResponse.assignmentId( certificateAssignmentId( certificate ) );
        certificateResponse.assignmentTitle( certificateAssignmentTitle( certificate ) );
        certificateResponse.quizId( certificateQuizId( certificate ) );
        certificateResponse.quizTitle( certificateQuizTitle( certificate ) );
        certificateResponse.id( certificate.getId() );
        certificateResponse.certificateUrl( certificate.getCertificateUrl() );
        certificateResponse.cloudinaryPublicId( certificate.getCloudinaryPublicId() );
        certificateResponse.marks( certificate.getMarks() );
        certificateResponse.generatedAt( certificate.getGeneratedAt() );
        certificateResponse.certificateType( certificate.getCertificateType() );
        certificateResponse.certificateId( certificate.getCertificateId() );
        certificateResponse.teacherId( certificate.getTeacherId() );
        certificateResponse.teacherName( certificate.getTeacherName() );
        certificateResponse.completionDate( certificate.getCompletionDate() );
        certificateResponse.generatedDate( certificate.getGeneratedDate() );
        certificateResponse.pdfFileUrl( certificate.getPdfFileUrl() );
        certificateResponse.verificationToken( certificate.getVerificationToken() );
        certificateResponse.qrCodeUrl( certificate.getQrCodeUrl() );

        return certificateResponse.build();
    }

    @Override
    public List<CertificateResponse> toResponseList(List<Certificate> certificates) {
        if ( certificates == null ) {
            return null;
        }

        List<CertificateResponse> list = new ArrayList<CertificateResponse>( certificates.size() );
        for ( Certificate certificate : certificates ) {
            list.add( toResponse( certificate ) );
        }

        return list;
    }

    private Long certificateStudentId(Certificate certificate) {
        Student student = certificate.getStudent();
        if ( student == null ) {
            return null;
        }
        return student.getId();
    }

    private String certificateStudentFullName(Certificate certificate) {
        Student student = certificate.getStudent();
        if ( student == null ) {
            return null;
        }
        return student.getFullName();
    }

    private Long certificateAssignmentId(Certificate certificate) {
        Assignment assignment = certificate.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        return assignment.getId();
    }

    private String certificateAssignmentTitle(Certificate certificate) {
        Assignment assignment = certificate.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        return assignment.getTitle();
    }

    private Long certificateQuizId(Certificate certificate) {
        Assignment quiz = certificate.getQuiz();
        if ( quiz == null ) {
            return null;
        }
        return quiz.getId();
    }

    private String certificateQuizTitle(Certificate certificate) {
        Assignment quiz = certificate.getQuiz();
        if ( quiz == null ) {
            return null;
        }
        return quiz.getTitle();
    }
}
