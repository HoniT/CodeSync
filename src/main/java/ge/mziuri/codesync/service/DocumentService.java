package ge.mziuri.codesync.service;

import ge.mziuri.codesync.exception.HttpErrorException;
import ge.mziuri.codesync.mapper.DocumentMapper;
import ge.mziuri.codesync.model.dto.documents.CreateDocumentRequest;
import ge.mziuri.codesync.model.dto.documents.DocumentDto;
import ge.mziuri.codesync.model.entity.User;
import ge.mziuri.codesync.model.entity.Document;
import ge.mziuri.codesync.repository.DocumentRepository;
import ge.mziuri.codesync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DocumentMapper documentMapper;

    public void createDocument(CreateDocumentRequest request) {
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

        documentRepository.save(document);
    }

    public List<DocumentDto> getPublicDocuments(int pageNumber, int pageSize, String sortParam) {
        if (sortParam == null) sortParam = "createdDesc";

        Sort sort = switch (sortParam) {
            case "createdAsc" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "savedAsc" -> Sort.by(Sort.Direction.ASC, "");
            case "savedDesc" -> Sort.by(Sort.Direction.DESC, "");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        PageRequest page = PageRequest.of(pageNumber, pageSize, sort);
        return documentRepository.findAll(page).getContent().stream().map(documentMapper::entityToDto).toList();
    }
}
