package ge.mziuri.codesync.controller;

import ge.mziuri.codesync.model.dto.documents.CreateDocumentRequest;
import ge.mziuri.codesync.model.dto.documents.DocumentDto;
import ge.mziuri.codesync.model.entity.Document;
import ge.mziuri.codesync.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    @Autowired
    private DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createDocument(@Valid @ModelAttribute CreateDocumentRequest request) {
        documentService.createDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getPublicDocuments(int pageNumber, int pageSize, String sortParam) {
        return ResponseEntity.ok(documentService.getPublicDocuments(pageNumber, pageSize, sortParam));
    }
}
