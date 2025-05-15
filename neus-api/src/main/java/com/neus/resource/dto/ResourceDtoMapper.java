package com.neus.resource.dto;

import com.neus.resource.Resource;

import java.util.List;


public class ResourceDtoMapper {

    // map to ResourceDto
    public static ResourceDto mapToResourceDto(Resource resource){
        return ResourceDto.builder()
                .id(resource.getExternalId().toString())
                .title(resource.getTitle())
                .type(resource.getType())
                .description(resource.getDescription())
                .requiredSubLevel(resource.getRequiredSubLevel())
                .parentResourceId(resource.getParentResource()!=null
                        ? resource.getParentResource().getExternalId().toString() : null)
                .parentResourceTitle(resource.getParentResource()!=null
                        ? resource.getParentResource().getTitle() : null)
                .contentPath(resource.getContentPath())
                .previewContentPath(resource.getPreviewContentPath())
                .build();
    }

    // map to ListOfResourceDto
    public static ResourceInfoDto mapToListOfResourceDto(Resource r){
        return ResourceInfoDto.builder()
                .resourceId(r.getExternalId())
                .type(r.getType())
                .title(r.getTitle())
                .description(r.getDescription())
                .requiredSubLevel(r.getRequiredSubLevel())
                .build();
    }

    // map to resource collection dto
    public static ResourceCollectionDto mapToResourceCollectionDto(
            Resource resource,
            List<ResourceInfoDto> resourceListDto
    ){
        return ResourceCollectionDto.builder()
                .title(resource.getTitle())
                .type(resource.getType())
                .description(resource.getDescription())
                .requiredSubLevel(resource.getRequiredSubLevel())
                .resourceList(resourceListDto)
                .build();
    }

    public static ResourceDetailDto mapToResourceDetailDto(Resource resource, String contentPath){
        return ResourceDetailDto.builder()
                .id(resource.getExternalId().toString())
                .title(resource.getTitle())
                .type(resource.getType())
                .description(resource.getDescription())
                .requiredSubLevel(resource.getRequiredSubLevel())
                .parentResourceId(resource.getParentResource()!=null
                        ? resource.getParentResource().getExternalId().toString() : null)
                .parentResource(resource.getParentResource()!=null
                        ? resource.getParentResource().getTitle() : null)
                .contentPath(contentPath)
                .build();
    }


}
