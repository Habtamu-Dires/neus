package com.neus.exam;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.Resource;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ExamSpecification {

    public static Specification<Exam> filterExams(
            String title,ExamType examType, Integer year, SubscriptionLevel requiredSubLevel
    ){
      return (root, query, cb) -> {
          List<Predicate> predicates = new ArrayList<>();
          if(title != null && !title.isEmpty()){
              Join<Exam, Resource> resourceJoin = root.join("resource");
              predicates.add(cb.like(cb.lower(resourceJoin.get("title")), "%" + title.toLowerCase() + "%"));
          }
          if(examType != null){
              predicates.add(cb.equal(root.get("examType"), examType));
          }
          if(year != null){
              predicates.add(cb.equal(root.get("year"), year));
          }
          if(requiredSubLevel != null){
              Join<Exam, Resource> resourceJoin = root.join("resource");
              predicates.add(cb.equal(resourceJoin.get("requiredSubLevel"), requiredSubLevel));
          }

          return cb.and(predicates.toArray(new Predicate[0]));
      };
    }
}
