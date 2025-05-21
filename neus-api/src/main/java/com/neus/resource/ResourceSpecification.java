package com.neus.resource;

import com.neus.common.SubscriptionLevel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ResourceSpecification {

    public static Specification<Resource> filterResources(
            String title,
            ResourceType type,
            SubscriptionLevel requiredSubLevel,
            String parentId,
            boolean hasChildResources
    ){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if(title != null && !title.isEmpty()){
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            if(type != null){
                predicates.add(cb.equal(root.get("type"), type));
            }
            if(requiredSubLevel != null){
                predicates.add(cb.equal(root.get("requiredSubLevel"), requiredSubLevel));
            }

            if(parentId != null && !parentId.isEmpty()){
                predicates.add(cb.equal(root.get("parentResource").get("externalId"), parentId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
