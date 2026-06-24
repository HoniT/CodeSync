package ge.mziuri.codesync.controller;

import ge.mziuri.codesync.model.dto.documents.CreateDocumentRequest;
import ge.mziuri.codesync.model.dto.documents.DocumentDetailDto;
import ge.mziuri.codesync.service.DocumentService;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    @Autowired
    private DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDetailDto> createDocument(@Valid @ModelAttribute CreateDocumentRequest request) {
        DocumentDetailDto d = documentService.createDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }

    @GetMapping
    public ResponseEntity<List<DocumentDetailDto>> getDocuments(int pageNumber, int pageSize, String sortParam) {
        return ResponseEntity.ok(documentService.getDocuments(pageNumber, pageSize, sortParam));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDetailDto> getDocument(@PathVariable("id") UUID id, @PathParam("accessCode") String accessCode) {
        return ResponseEntity.ok(documentService.getDocument(id, accessCode));
    }

    @GetMapping("/me")
    public ResponseEntity<List<DocumentDetailDto>> getDocumentsByUser(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "50") int pageSize,
            @RequestParam(required = false) String sortParam
    ) {
        return ResponseEntity.ok(documentService.getDocumentsByUser(pageNumber, pageSize, sortParam));
    }
}
