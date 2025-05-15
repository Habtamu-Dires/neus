package com.neus.question;

import com.neus.exam.Exam;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class QuestionSpecification {

    public static Specification<Question> getQuestionByExamId(
            Long examId,Department department, BlockNumber blockNumber
    ){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if(examId == null){
                return cb.conjunction();
            }
            Join<Question, Exam> examJoin = root.join("exam");
            predicates.add(cb.equal(examJoin.get("id"),examId));

            if(department != null){
                predicates.add(cb.equal(root.get("department"),department));
            }
            if(blockNumber != null){
                predicates.add(cb.equal(root.get("blockNumber"),blockNumber));
            }
            // order by question number
            query.orderBy(cb.asc(root.get("questionNumber")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
