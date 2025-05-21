package com.neus.resource;

import com.neus.resource.dto.ResourceInfoDto;
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

    @Query("""
            SELECT new com.neus.resource.dto.ResourceInfoDto (
              r.externalId,
              r.type,
              r.title,
              r.description,
              r.requiredSubLevel
            )
            FROM Resource r 
            WHERE r.parentResource IS NULL
            """)
    List<ResourceInfoDto> findParentResources();

    @Query("""
            SELECT r FROM Resource r Where r.externalId = :resourceId
            """)
    Optional<Resource> findByExternalId(UUID resourceId);


    @Query("""
            SELECT new com.neus.resource.dto.ResourceInfoDto (
              r.externalId,
              r.type,
              r.title,
              r.description,
              r.requiredSubLevel
            )
            FROM Resource r 
            WHERE r.parentResource.id = :parentId
            """)
    List<ResourceInfoDto> findByParentResource(Long parentId);

    @Query("SELECT r FROM Resource r WHERE r.type <> EXAM")
    Page<Resource> findNonExam(Pageable pageable);


    @Query("""
            SELECT r FROM Resource r
            WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
            AND ( r.parentResource IS NULL 
                OR r.type IN ('LECTURE_VIDEOS','READING_MATERIALS','LECTURE_NOTES'))
            """)
    List<Resource> searchParentResourcesByTitle(@Param("title") String title);

    @Query("""
            SELECT r FROM Resource r WHERE r.type = :resourceType
            """
            )
    Optional<Resource> findParentExamResource(ResourceType resourceType);

    @Query("""
            SELECT new com.neus.resource.dto.ResourceInfoDto (
              r.externalId,
              r.type,
              r.title,
              r.description,
              r.requiredSubLevel
            ) 
            FROM Resource r 
            WHERE r.parentResource.externalId = :externalId
    """)
    List<ResourceInfoDto> findByParentResourceExternalId(UUID externalId);
}
