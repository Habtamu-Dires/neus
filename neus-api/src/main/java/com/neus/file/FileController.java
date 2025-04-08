package com.neus.file;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/files")
@Tag(name = "files")
public class FileController {

    @GetMapping("/get-file")
    public ResponseEntity<Resource> getFile(
        @RequestParam("file-path") String filePath
    ) throws MalformedURLException {
        Path path = Paths.get(filePath);
        Resource resource = new UrlResource(path.toUri());

        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + path.getFileName().toString() + "\"")
                    .body(resource);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


    // video streamer
    @GetMapping("/stream-video")
    public ResponseEntity<Resource> streamVideo(
            @RequestParam("file-path") String filePath,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String httpRangeList

    ) throws IOException {
        Path videoPath = Paths.get(filePath);
        long fileSize = Files.size(videoPath);
        byte[] data;

        long start = 0;
        long end = fileSize - 1;

        if (httpRangeList != null && httpRangeList.startsWith("bytes=")) {
            String[] ranges = httpRangeList.substring(6).split("-");
            start = Long.parseLong(ranges[0]);
            if (ranges.length > 1) {
                end = Long.parseLong(ranges[1]);
            }
        }

        if (end >= fileSize) {
            end = fileSize - 1;
        }

        long contentLength = end - start + 1;
        InputStream inputStream = Files.newInputStream(videoPath);
        inputStream.skip(start);
        data = inputStream.readNBytes((int) contentLength);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, "video/mp4");
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.set(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength));
        headers.set(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize);

        return new ResponseEntity<>(new ByteArrayResource(data), headers, HttpStatus.PARTIAL_CONTENT);
    }
}
