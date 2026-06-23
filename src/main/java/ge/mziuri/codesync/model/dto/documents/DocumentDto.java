package ge.mziuri.codesync.model.dto.documents;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class DocumentDto {
    private UUID id;
    private String title;
    private String creatorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime lastSavedAt;
}
