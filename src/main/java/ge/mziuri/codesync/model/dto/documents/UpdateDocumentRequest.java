package ge.mziuri.codesync.model.dto.documents;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class UpdateDocumentRequest {
    private UUID documentId;
    private String patchText;
}
