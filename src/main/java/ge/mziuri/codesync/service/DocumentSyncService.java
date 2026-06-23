package ge.mziuri.codesync.service;

import ge.mziuri.codesync.model.entity.Document;
import ge.mziuri.codesync.repository.DocumentRepository;
import org.bitbucket.cowwoc.diffmatchpatch.DiffMatchPatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;


/**
 * Services that caches saved documents and updates them to the DB every 5 seconds
 * */
@Service
public class DocumentSyncService {
    @Autowired
    private DocumentRepository documentRepository;

    private final Map<UUID, String> documentCache = new ConcurrentHashMap<>();
    private final Map<UUID, Boolean> dirtyFlags = new ConcurrentHashMap<>();

    private final DiffMatchPatch dmp = new DiffMatchPatch();

    public void applyPatchToDocument(UUID documentId, String patchText) {
        String currentContent = documentCache.computeIfAbsent(documentId, id -> {
            return documentRepository.findById(id)
                    .map(Document::getContent)
                    .orElse("");
        });

        LinkedList<DiffMatchPatch.Patch> patches = (LinkedList<DiffMatchPatch.Patch>) dmp.patchFromText(patchText);

        Object[] result = dmp.patchApply(patches, currentContent);
        String updatedContent = (String) result[0]; // The merged text

        documentCache.put(documentId, updatedContent);
        dirtyFlags.put(documentId, true);
    }

    @Scheduled(fixedRate = 5000)
    public void autoSave() {
        for (Map.Entry<UUID, Boolean> entry : dirtyFlags.entrySet()) {
            if (entry.getValue()) {
                UUID docId = entry.getKey();
                String content = documentCache.get(docId);

                documentRepository.findById(docId).ifPresent(doc -> {
                    doc.setContent(content);
                    documentRepository.save(doc);
                });

                dirtyFlags.put(docId, false);
            }
        }
    }
}
