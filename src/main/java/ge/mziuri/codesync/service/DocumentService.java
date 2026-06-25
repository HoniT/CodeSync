package ge.mziuri.codesync.service;

import ge.mziuri.codesync.exception.HttpErrorException;
import ge.mziuri.codesync.mapper.DocumentMapper;
import ge.mziuri.codesync.model.dto.documents.CreateDocumentRequest;
import ge.mziuri.codesync.model.dto.documents.DocumentDetailDto;
import ge.mziuri.codesync.model.entity.User;
import ge.mziuri.codesync.model.entity.Document;
import ge.mziuri.codesync.repository.DocumentRepository;
import ge.mziuri.codesync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DocumentMapper documentMapper;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public DocumentDetailDto createDocument(CreateDocumentRequest request) {
        String initialContent = "";

        // Check if the user uploaded a file
        if (request.getFileToClone() != null && !request.getFileToClone().isEmpty()) {
            try {
                initialContent = new String(request.getFileToClone().getBytes());
            } catch (Exception e) {
                throw new HttpErrorException(HttpStatus.BAD_REQUEST.value(), "Failed to read file contents");
            }
        }

        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new HttpErrorException(HttpStatus.NOT_FOUND.value(), "User not found"));

        Document document = new Document();
        document.setTitle(request.getTitle());
        document.setCreator(creator);
        document.setContent(initialContent);
        document.setAccessCode(request.getAccessCode());

        Document created = documentRepository.save(document);
        return documentMapper.entityToDetailsDto(created, true);
    }

    public List<DocumentDetailDto> getDocuments(int pageNumber, int pageSize, String sortParam) {
        if (sortParam == null) sortParam = "createdDesc";

        Sort sort = switch (sortParam) {
            case "createdAsc" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "savedAsc" -> Sort.by(Sort.Direction.ASC, "lastSavedAt");
            case "savedDesc" -> Sort.by(Sort.Direction.DESC, "lastSavedAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        PageRequest page = PageRequest.of(pageNumber, pageSize, sort);
        return documentRepository.findAll(page).getContent().stream().map(d -> documentMapper.entityToDetailsDto(d, false)).toList();
    }

    public DocumentDetailDto getDocument(UUID id, String accessCode) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new HttpErrorException(HttpStatus.NOT_FOUND.value(), "Document not found for ID: " + id));
        if(document.getAccessCode() != null && !document.getAccessCode().equals(accessCode))
            throw new HttpErrorException(HttpStatus.BAD_REQUEST.value(), "Invalid access code for the document");

        return documentMapper.entityToDetailsDto(document, true);
    }

    public List<DocumentDetailDto> getDocumentsByUser(int pageNumber, int pageSize, String sortParam) {
        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();

        if (sortParam == null) sortParam = "createdDesc";

        Sort sort = switch (sortParam) {
            case "createdAsc" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "savedAsc" -> Sort.by(Sort.Direction.ASC, "lastSavedAt");
            case "savedDesc" -> Sort.by(Sort.Direction.DESC, "lastSavedAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        PageRequest page = PageRequest.of(pageNumber, pageSize, sort);

        return documentRepository.findAllByCreator_Username(username, page)
                .getContent()
                .stream()
                .map(d -> documentMapper.entityToDetailsDto(d, false))
                .toList();
    }

    public void deleteDocument(UUID id) {
        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        Document document = documentRepository.findByIdAndCreator_Username(id, username);
        if(document == null) throw new HttpErrorException(HttpStatus.NOT_FOUND.value(), "The following document wasn't found for this user");

        // Kicking the connected users
        messagingTemplate.convertAndSend("/topic/document/" + id, Optional.of(Map.of("type", "DOCUMENT_DELETED")));

        documentRepository.delete(document);
    }
}
