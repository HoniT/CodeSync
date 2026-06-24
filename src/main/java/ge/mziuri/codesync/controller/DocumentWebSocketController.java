package ge.mziuri.codesync.controller;

import ge.mziuri.codesync.model.dto.documents.UpdateDocumentRequest;
import ge.mziuri.codesync.service.DocumentSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class DocumentWebSocketController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private DocumentSyncService documentSyncService;

    @MessageMapping("document/update")
    public void handleDocumentUpdate(@Payload UpdateDocumentRequest request) {
        documentSyncService.applyPatchToDocument(request.getDocumentId(), request.getPatchText());
        messagingTemplate.convertAndSend("/topic/document/" + request.getDocumentId(), request);
    }
}
