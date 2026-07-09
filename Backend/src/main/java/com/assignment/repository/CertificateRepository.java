package com.assignment.repository;

import com.assignment.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudentId(Long studentId);
    Optional<Certificate> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
    Optional<Certificate> findByStudentIdAndQuizId(Long studentId, Long quizId);
}
