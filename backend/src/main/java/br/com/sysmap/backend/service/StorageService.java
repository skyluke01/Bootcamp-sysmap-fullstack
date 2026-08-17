package br.com.sysmap.backend.service;


import br.com.sysmap.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    public String uploadProfileImage(MultipartFile file) {
        validateImage(file);

        String fileName = "profiles/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(fileName)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );

            return endpoint + "/" + bucket + "/" + fileName;

        } catch (IOException e) {
            throw new BusinessException("Erro ao fazer upload da imagem.");
        }
    }

    private void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BusinessException("E2: A imagem deve ser um arquivo PNG ou JPG.");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                (!contentType.equals("image/png")
                        && !contentType.equals("image/jpeg")
                        && !contentType.equals("image/jpg"))) {
            throw new BusinessException("E2: A imagem deve ser um arquivo PNG ou JPG.");
        }
    }
    public void deleteFileByUrl(String fileUrl) {

        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        if (fileUrl.contains("default-profile-image")) {
            return;
        }

        try {
            String key = fileUrl.substring(fileUrl.indexOf(bucket + "/") + bucket.length() + 1);

            s3Client.deleteObject(builder -> builder
                    .bucket(bucket)
                    .key(key)
                    .build()
            );

        } catch (Exception ignored) {
        }
    }
}
