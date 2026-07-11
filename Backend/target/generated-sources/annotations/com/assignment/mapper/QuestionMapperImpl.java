package com.assignment.mapper;

import com.assignment.dto.request.QuestionRequest;
import com.assignment.dto.response.QuestionResponse;
import com.assignment.entity.Assignment;
import com.assignment.entity.Question;
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
public class QuestionMapperImpl implements QuestionMapper {

    @Override
    public QuestionResponse toResponse(Question question) {
        if ( question == null ) {
            return null;
        }

        QuestionResponse.QuestionResponseBuilder questionResponse = QuestionResponse.builder();

        questionResponse.assignmentId( questionAssignmentId( question ) );
        questionResponse.id( question.getId() );
        questionResponse.questionText( question.getQuestionText() );
        questionResponse.optionA( question.getOptionA() );
        questionResponse.optionB( question.getOptionB() );
        questionResponse.optionC( question.getOptionC() );
        questionResponse.optionD( question.getOptionD() );
        questionResponse.correctAnswer( question.getCorrectAnswer() );
        questionResponse.marks( question.getMarks() );
        questionResponse.difficulty( question.getDifficulty() );
        questionResponse.questionType( question.getQuestionType() );

        return questionResponse.build();
    }

    @Override
    public List<QuestionResponse> toResponseList(List<Question> questions) {
        if ( questions == null ) {
            return null;
        }

        List<QuestionResponse> list = new ArrayList<QuestionResponse>( questions.size() );
        for ( Question question : questions ) {
            list.add( toResponse( question ) );
        }

        return list;
    }

    @Override
    public Question toEntity(QuestionRequest request) {
        if ( request == null ) {
            return null;
        }

        Question.QuestionBuilder question = Question.builder();

        question.questionText( request.getQuestionText() );
        question.optionA( request.getOptionA() );
        question.optionB( request.getOptionB() );
        question.optionC( request.getOptionC() );
        question.optionD( request.getOptionD() );
        question.correctAnswer( request.getCorrectAnswer() );
        question.marks( request.getMarks() );
        question.difficulty( request.getDifficulty() );
        question.questionType( request.getQuestionType() );

        return question.build();
    }

    private Long questionAssignmentId(Question question) {
        Assignment assignment = question.getAssignment();
        if ( assignment == null ) {
            return null;
        }
        return assignment.getId();
    }
}
