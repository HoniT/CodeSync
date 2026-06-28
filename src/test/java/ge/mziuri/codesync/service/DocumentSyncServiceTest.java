package ge.mziuri.codesync.service;

import ge.mziuri.codesync.model.entity.Document;
import ge.mziuri.codesync.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentSyncServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @InjectMocks
    private DocumentSyncService documentSyncService;

    @Test
    void autoSave_SavesDirtyDocuments() {
        UUID docId = UUID.randomUUID();
        Document doc = new Document();

        Map<UUID, Boolean> dirtyFlags = new ConcurrentHashMap<>();
        dirtyFlags.put(docId, true);
        ReflectionTestUtils.setField(documentSyncService, "dirtyFlags", dirtyFlags);

        Map<UUID, String> cache = new ConcurrentHashMap<>();
        cache.put(docId, "Updated Content");
        ReflectionTestUtils.setField(documentSyncService, "documentCache", cache);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        documentSyncService.autoSave();

        verify(documentRepository, times(1)).save(any(Document.class));
        assert(doc.getContent().equals("Updated Content"));
    }
}