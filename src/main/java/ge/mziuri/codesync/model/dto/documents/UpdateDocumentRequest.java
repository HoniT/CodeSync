package ge.mziuri.codesync.model.dto.documents;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDocumentRequest {
    private UUID documentId;
    private String patchText;
    // Not the users id, just a unique identifier sent form the frontend
    private String senderId;
}
