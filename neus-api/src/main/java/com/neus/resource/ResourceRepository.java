package com.neus.resource;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource,Long> {

    @Query("""
            SELECT r FROM Resource r WHERE r.previewResource IS NULL
            """)
    List<Resource> getListOfResources();

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


}
