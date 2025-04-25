package com.neus.resource;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource,Long>, JpaSpecificationExecutor<Resource> {

    @Query("SELECT r FROM Resource r WHERE r.parentResource IS NULL")
    List<Resource> findParentResources();

    @Query("""
            SELECT r FROM Resource r Where r.externalId = :resourceId
            """)
    Optional<Resource> findByExternalId(UUID resourceId);

    @Query("""
            SELECT r FROM Resource r WHERE r.parentResource.id = :parentId
            """)
    List<Resource> findByParentResource(Long parentId);

    @Query("SELECT r FROM Resource r WHERE r.type <> EXAM")
    Page<Resource> findNonExam(Pageable pageable);


    @Query("""
            SELECT r FROM Resource r 
            WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
            """)
    List<Resource> searchParentResourcesByTitle(@Param("title") String title);

}
