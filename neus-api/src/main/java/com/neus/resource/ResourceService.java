package com.neus.resource;

import com.neus.common.PageResponse;
import com.neus.common.SubscriptionLevel;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.file.FileStorageService;
import com.neus.resource.dto.*;
import com.neus.user.User;
import com.neus.user.dto.UserDto;
import com.neus.user.dto.UserDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

import static com.neus.common.ExtractUserRole.getUserRoleFromJwt;
import static com.neus.common.ExtractUserRole.mapRoleToSubscriptionLevel;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final FileStorageService fileStorageService;

    //create resource
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void createResource(@Valid CreateResourceDto dto, MultipartFile file) {

        // check preview resource
        Resource previewResource = null;
        if(dto.previewResourceId() != null && !dto.previewResourceId().isBlank()){
            previewResource = this.findResourceByExternalId(dto.previewResourceId());
        }
        // check for parent resource
        Resource parentResource = null;
        if(dto.parentResourceId() != null && !dto.parentResourceId().isBlank()){
            parentResource = this.findResourceByExternalId(dto.parentResourceId());
        }

        System.out.println("requred sub level " + dto.requiredSubLevel());
        Resource resource = Resource.builder()
                .externalId(UUID.randomUUID())
                .type(dto.type())
                .title(dto.title())
                .department(dto.department())
                .description(dto.description())
                .requiredSubLevel(dto.requiredSubLevel())
                .parentResource(parentResource)
                .previewResource(previewResource)
                .build();

        Resource savedResource = resourceRepository.save(resource);

        // save file
        saveFile(file,savedResource);
    }

    // update resource
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateResource(CreateResourceDto dto, String externalId){
        Resource resource = this.findResourceByExternalId(externalId);

        // check preview resource
        Resource previewResource = null;
        if(dto.previewResourceId() != null && !dto.previewResourceId().isBlank()){
            previewResource = this.findResourceByExternalId(dto.previewResourceId());
        }
        // check for parent resource
        Resource parentResource = null;
        if(dto.parentResourceId() != null && !dto.parentResourceId().isBlank()){
            parentResource = this.findResourceByExternalId(dto.parentResourceId());
        }

        resource.setTitle(dto.title());
        resource.setType(dto.type());
        resource.setDepartment(dto.department());
        resource.setDescription(dto.description());
        resource.setRequiredSubLevel(dto.requiredSubLevel());
        resource.setParentResource(parentResource);
        resource.setPreviewResource(previewResource);

        resourceRepository.save(resource);

    }

    // get resource list
    public List<ListOfResourcesDto> getListOfResources() {
        return resourceRepository.getListOfResources().stream()
                .map(ResourceDtoMapper::mapToListOfResourceDto)
                .toList();
    }

    // get resource detail
    public ResourceDto getResourceDetail(String resourceId, Authentication authentication) {
        // Fetch the resource
        Resource resource = resourceRepository.findByExternalId(UUID.fromString(resourceId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        // Get the required subscription level
        SubscriptionLevel requiredLevel = resource.getRequiredSubLevel();

        // Check user’s subscription level (from JWT roles)
        String userRole = getUserRoleFromJwt(authentication);
        SubscriptionLevel userLevel = mapRoleToSubscriptionLevel(userRole);

        //  Determine access
        boolean hasFullAccess = userLevel != null && userLevel.compareTo(requiredLevel) >= 0;

        if(hasFullAccess){
            return ResourceDtoMapper.mapToResourceDto(resource);
        } else if(resource.getPreviewResource() != null){
            return resourceRepository
                    .findByExternalId(resource.getPreviewResource().getExternalId())
                    .map(ResourceDtoMapper::mapToResourceDto)
                    .orElseThrow(() -> new ResourceNotFoundException("Preview Resource not found"));

        }
        return null;
    }

    // get resource collection
    public ResourceCollectionDto getResourceCollection(String resourceId, Authentication authentication) {
        // Fetch the resource
        Resource resource = resourceRepository.findByExternalId(UUID.fromString(resourceId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        // Get the required subscription level
        SubscriptionLevel requiredLevel = resource.getRequiredSubLevel();

        // Check user’s subscription level (from JWT roles)
        String userRole = getUserRoleFromJwt(authentication);
        SubscriptionLevel userLevel = mapRoleToSubscriptionLevel(userRole);

        //  Determine access
        boolean hasFullAccess = userLevel != null && userLevel.compareTo(requiredLevel) >= 0;

        if(hasFullAccess){
            List<ResourceDto> resourceDtoList = resourceRepository
                    .findByParentResource(resource.getId())
                    .stream()
                    .map(ResourceDtoMapper::mapToResourceDto)
                    .toList();
            return ResourceDtoMapper.mapToResourceCollectionDto(resource,resourceDtoList);
        } else if(resource.getPreviewResource() != null) {
            ResourceDto resourceDto = resourceRepository
                    .findByExternalId(resource.getPreviewResource().getExternalId())
                    .map(ResourceDtoMapper::mapToResourceDto)
                    .orElseThrow(() -> new ResourceNotFoundException("Preview Resource not found"));

            return ResourceDtoMapper.mapToResourceCollectionDto(resource,List.of(resourceDto));
        }

        return null;
    }

    // save file
    private void saveFile(MultipartFile file, Resource resource){
        if(resource.getContentPath() != null){
            fileStorageService.deleteFile(resource.getContentPath());
        }
        String url = fileStorageService.saveFile(file, resource.getType().toString());
        resource.setContentPath(url);
        resourceRepository.save(resource);
    }

   // get page of resources
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<ResourceDto> getPageOfResources(int page, int size) {
        Pageable pageable = PageRequest.of(page,size);
        Page<Resource> res = resourceRepository.findNonExam(pageable);

        List<ResourceDto> resourceDtoList = res.map(ResourceDtoMapper::mapToResourceDto).toList();

        return PageResponse.<ResourceDto>builder()
                .content(resourceDtoList)
                .totalElements(res.getTotalElements())
                .numberOfElements(res.getNumberOfElements())
                .totalPages(res.getTotalPages())
                .size(res.getSize())
                .number(res.getNumber())
                .first(res.isFirst())
                .last(res.isLast())
                .empty(res.isEmpty())
                .build();
    }

    //find resource by external id
    public Resource findResourceByExternalId(String externalId){
        return this.resourceRepository.findByExternalId(UUID.fromString(externalId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    // delete resource
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteResource(String resourceId) {
        Resource resource = this.findResourceByExternalId(resourceId);
        String contentPath = resource.getContentPath();
        resourceRepository.delete(resource);
        fileStorageService.deleteFile(contentPath);
    }

    // update resource content
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateResourceContent(MultipartFile file, String resourceId) {
        Resource resource = this.findResourceByExternalId(resourceId);
        this.saveFile(file,resource);
    }

    // get resource by id
    public ResourceDto getResourceById(String resourceId) {
        return ResourceDtoMapper.mapToResourceDto(this.findResourceByExternalId(resourceId));
    }
}
