package com.neus.resource;

import org.springframework.data.jpa.domain.Specification;

public class ResourceSpecification {

    public  static Specification<Resource> searchByTitle(String title){
        return (root, query, cb) ->{
            if(title == null || title.isEmpty()){
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("title")), "%"+title.toLowerCase()+"%");
        };
    }
}
