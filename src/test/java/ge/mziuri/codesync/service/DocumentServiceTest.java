package ge.mziuri.codesync.service;

import ge.mziuri.codesync.exception.HttpErrorException;
import ge.mziuri.codesync.mapper.DocumentMapper;
import ge.mziuri.codesync.model.dto.documents.CreateDocumentRequest;
import ge.mziuri.codesync.model.dto.documents.DocumentDetailDto;
import ge.mziuri.codesync.model.entity.Document;
import ge.mziuri.codesync.model.entity.User;
import ge.mziuri.codesync.repository.DocumentRepository;
import ge.mziuri.codesync.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DocumentMapper documentMapper;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        // Mock Security Context
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testUser");
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createDocument_Success() {
        CreateDocumentRequest request = new CreateDocumentRequest();
        request.setTitle("Test Doc");

        User user = new User();
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));
        when(documentRepository.save(any(Document.class))).thenAnswer(i -> i.getArguments()[0]);
        when(documentMapper.entityToDetailsDto(any(Document.class), eq(true))).thenReturn(new DocumentDetailDto());

        DocumentDetailDto result = documentService.createDocument(request);

        assertNotNull(result);
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    void getDocument_InvalidAccessCode_ThrowsException() {
        UUID id = UUID.randomUUID();
        Document doc = new Document();
        doc.setAccessCode("secret");

        when(documentRepository.findById(id)).thenReturn(Optional.of(doc));

        assertThrows(HttpErrorException.class, () -> documentService.getDocument(id, "wrong"));
    }
}