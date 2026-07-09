package com.assignment.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long assignmentId;
    private String assignmentTitle;
    private Long quizId;
    private String quizTitle;
    private String certificateUrl;
    private String cloudinaryPublicId;
    private Double marks;
    private LocalDateTime generatedAt;
    private String certificateType;
}
