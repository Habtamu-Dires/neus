package com.neus.resource;

import com.neus.common.PageResponse;
import com.neus.common.SubscriptionLevel;
import com.neus.exceptions.ResourceNotFoundException;
import com.neus.file.FileStorageService;
import com.neus.resource.dto.*;
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

import static com.neus.common.ExtractRoleFromJwt.getUserRoleFromJwt;
import static com.neus.common.ExtractRoleFromJwt.mapRoleToSubscriptionLevel;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final FileStorageService fileStorageService;

    //create resource
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void createResource(
            @Valid CreateResourceDto dto,
            MultipartFile file,
            MultipartFile previewFile
    ) {

        // check for parent resource
        Resource parentResource = null;
        if(dto.parentResourceId() != null && !dto.parentResourceId().isBlank()){
            parentResource = this.findResourceByExternalId(dto.parentResourceId());
        }

        Resource resource = Resource.builder()
                .externalId(UUID.randomUUID())
                .type(dto.type())
                .title(dto.title())
                .description(dto.description())
                .requiredSubLevel(parentResource != null
                        ? parentResource.getRequiredSubLevel()
                        : dto.requiredSubLevel()
                )
                .parentResource(parentResource)
                .build();

        Resource savedResource = resourceRepository.save(resource);

        // save file
        if(file != null){
            saveFile(file,savedResource);
        }
        // save preview file
        if(previewFile != null){
            savePreviewFile(previewFile,savedResource);
        }
    }

    // update resource
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateResource(CreateResourceDto dto, String externalId) {
        Resource resource = this.findResourceByExternalId(externalId);
        SubscriptionLevel oldRequiredSubLevel = resource.getRequiredSubLevel();

        // check for parent resource
        Resource parentResource = null;
        if(dto.parentResourceId() != null && !dto.parentResourceId().isBlank()){
            parentResource = this.findResourceByExternalId(dto.parentResourceId());
        }

        resource.setTitle(dto.title());
        resource.setType(dto.type());
        resource.setDescription(dto.description());
        resource.setRequiredSubLevel(dto.requiredSubLevel());
        resource.setParentResource(parentResource);

        resourceRepository.save(resource);

        //  is parent resource ? && required sub level changed ?
        if(oldRequiredSubLevel != dto.requiredSubLevel()
                && resource.getChildResources() !=null
                && !resource.getChildResources().isEmpty())
        {
            resource.getChildResources().forEach(childResource -> {
                childResource.setRequiredSubLevel(dto.requiredSubLevel());
                resourceRepository.save(childResource);
            });
        }

    }

    // get resources
    public List<ResourceInfoDto> getListOfResources() {
        return resourceRepository.findParentResources();
    }

    // get resource detail
    public ResourceDetailDto getResourceDetail(String resourceId, Authentication authentication) {
        // Fetch the resource
        Resource resource = resourceRepository.findByExternalId(UUID.fromString(resourceId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        // Get the required subscription level
        SubscriptionLevel requiredLevel = resource.getRequiredSubLevel();

        // Check user’s subscription level (from JWT roles)
        String userRole = getUserRoleFromJwt(authentication);
        SubscriptionLevel userLevel = mapRoleToSubscriptionLevel(userRole);

        //  Determine access
        boolean hasFullAccess = false;
        if(requiredLevel == SubscriptionLevel.NONE){
            hasFullAccess = true;
        } else {
            hasFullAccess = userLevel != null && userLevel.compareTo(requiredLevel) >= 0;
        }

        if(hasFullAccess){
            return ResourceDtoMapper.mapToResourceDetailDto(resource, resource.getContentPath());
        } else {
            return ResourceDtoMapper.mapToResourceDetailDto(resource, resource.getPreviewContentPath());
        }
    }

    // get resource collection
    public ResourceCollectionDto getResourceCollection(String resourceId) {
        // Fetch the resource
        Resource resource = resourceRepository.findByExternalId(UUID.fromString(resourceId))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        List<ResourceInfoDto> resourceListDto = resourceRepository
                .findByParentResource(resource.getId());
        return ResourceDtoMapper.mapToResourceCollectionDto(resource,resourceListDto);
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

    // save preview file
    private void savePreviewFile(MultipartFile file, Resource resource){
        if(resource.getPreviewContentPath() != null){
            fileStorageService.deleteFile(resource.getPreviewContentPath());
        }
        String url = fileStorageService.saveFile(file, resource.getType().toString());
        resource.setPreviewContentPath(url);
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
        String previewContentPath = resource.getPreviewContentPath();
        resourceRepository.delete(resource);
        fileStorageService.deleteFile(contentPath);
        fileStorageService.deleteFile(previewContentPath);
    }

    // update resource content
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateResourceContent(MultipartFile file, String resourceId, boolean isPreview) {
        Resource resource = this.findResourceByExternalId(resourceId);
        if(isPreview){
            this.savePreviewFile(file,resource);
        } else { // main file
            this.saveFile(file, resource);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteResourceContent(String url, String resourceId, boolean isPreview) {
        Resource resource = this.findResourceByExternalId(resourceId);
        if(isPreview){
            fileStorageService.deleteFile(url);
            resource.setPreviewContentPath(null);
        } else { // main file
            fileStorageService.deleteFile(url);
            resource.setContentPath(null);
        }
        resourceRepository.save(resource);
    }

    // get resource by id
    public ResourceDto getResourceById(String resourceId) {
        return ResourceDtoMapper.mapToResourceDto(this.findResourceByExternalId(resourceId));
    }


    // search parent resource by title
    @PreAuthorize("hasRole('ADMIN')")
    public List<ResourceDto> searchParentResourcesByTitle(String title){
        return resourceRepository.searchParentResourcesByTitle(title)
                .stream()
                .map(ResourceDtoMapper::mapToResourceDto)
                .toList();
    }

    // list of collections
    public List<ResourceInfoDto> getListOfCollections(String lectureId) {
        return resourceRepository.findByParentResourceExternalId(UUID.fromString(lectureId));
    }
}
