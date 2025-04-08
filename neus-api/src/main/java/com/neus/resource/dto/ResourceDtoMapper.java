package com.neus.resource.dto;

import com.neus.resource.Resource;
import org.springframework.stereotype.Service;

import java.util.List;


public class ResourceDtoMapper {

    // map to ResourceDto
    public static ResourceDto mapToResourceDto(Resource resource){
        return ResourceDto.builder()
                .id(resource.getExternalId().toString())
                .title(resource.getTitle())
                .type(resource.getType())
                .department(resource.getDepartment())
                .description(resource.getDescription())
                .requiredSubLevel(resource.getRequiredSubLevel())
                .parentResourceId(resource.getParentResource()!=null
                        ? resource.getParentResource().getExternalId().toString() : null)
                .parentResource(resource.getParentResource()!=null
                        ? resource.getParentResource().getTitle() : null)
                .contentPath(resource.getContentPath())
                .build();
    }

    // map to ListOfResourceDto
    public static ListOfResourcesDto mapToListOfResourceDto(Resource r){
        return ListOfResourcesDto.builder()
                .resourceId(r.getExternalId())
                .type(r.getType())
                .department(r.getDepartment())
                .title(r.getTitle())
                .description(r.getDescription())
                .requiredSubLevel(r.getRequiredSubLevel())
                .previewId(r.getPreviewResource() != null
                        ? r.getPreviewResource().getExternalId() : null)
                .build();
    }

    // map to resource collection dto
    public static ResourceCollectionDto mapToResourceCollectionDto(
            Resource resource,
            List<ResourceDto> resourceDtos
    ){
        return ResourceCollectionDto.builder()
                .title(resource.getTitle())
                .type(resource.getType())
                .department(resource.getDepartment())
                .description(resource.getDescription())
                .requiredSubLevel(resource.getRequiredSubLevel())
                .resources(resourceDtos)
                .build();
    }
}
