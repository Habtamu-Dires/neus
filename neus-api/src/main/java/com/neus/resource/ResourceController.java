package com.neus.resource;

import com.neus.common.PageResponse;
import com.neus.resource.dto.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
@Tag(name = "resources")
public class ResourceController {

    private final ResourceService resourceService;

    // create resource
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createResource(
            @RequestPart @Valid CreateResourceDto dto,
            @RequestPart(required = false) MultipartFile file,
            @RequestPart(required = false) MultipartFile previewFile
    ){
        resourceService.createResource(dto, file, previewFile);
        return ResponseEntity.accepted().build();
    }

    // get list of resources
    @GetMapping("/list")
    public ResponseEntity<List<ListOfResourcesDto>> getListOfResources(){
        var  res = resourceService.getListOfResources();
        return ResponseEntity.ok(res);
    }

    // get resource detail
    @GetMapping("/detail/{resource-id}")
    public ResponseEntity<ResourceDetailDto> getResourceDetail(
            @PathVariable("resource-id") String resourceId,
            Authentication authentication
    ){
        var res = resourceService.getResourceDetail(resourceId, authentication);
        return ResponseEntity.ok(res);
    }

    // get page of resources
    @GetMapping("/page")
    public ResponseEntity<PageResponse<ResourceDto>> getPageOfResources(
            @RequestParam(value = "page",defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size
    ){
        return ResponseEntity.ok(resourceService.getPageOfResources(page,size));
    }

    // get resource by id
    @GetMapping("/{resource-id}")
    public ResponseEntity<ResourceDto> getResourceById(
            @PathVariable("resource-id") String resourceId
    ){
        return ResponseEntity.ok(resourceService.getResourceById(resourceId));
    }


    // get resource collection
    @GetMapping("/collection/{resource-id}")
    public ResponseEntity<ResourceCollectionDto> getResourceCollection(
            @PathVariable("resource-id") String resourceId,
            Authentication authentication
    ){
        ResourceCollectionDto res = resourceService.getResourceCollection(resourceId, authentication);
        return ResponseEntity.ok(res);
    }

    // update resource
    @PutMapping("/{resource-id}")
    public ResponseEntity<?> updateResource(
            @RequestBody @Valid CreateResourceDto dto,
            @PathVariable("resource-id") String resourceId
    ){
        resourceService.updateResource(dto,resourceId);
        return ResponseEntity.accepted().build();
    }

    // update resource content
    @PutMapping(value = "/content/{resource-id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateResourceContent(
            @RequestPart MultipartFile file,
            @PathVariable("resource-id") String resourceId,
            @RequestParam("isPreview") Boolean isPreview
    ){
        resourceService.updateResourceContent(file,resourceId, isPreview);
        return ResponseEntity.accepted().build();
    }

    // delete resource content
    @DeleteMapping(value = "/content/{resource-id}")
    public ResponseEntity<?> deleteResourceContent(
            @PathVariable("resource-id") String resourceId,
            @RequestParam("url") String url,
            @RequestParam("isPreview") Boolean isPreview
    ){
        resourceService.deleteResourceContent(url,resourceId, isPreview);
        return ResponseEntity.accepted().build();
    }

    // delete resource
    @DeleteMapping("/{resource-id}")
    public ResponseEntity<?> deleteResource(
            @PathVariable("resource-id") String resourceId
    ){
        resourceService.deleteResource(resourceId);
        return ResponseEntity.accepted().build();
    }


}
