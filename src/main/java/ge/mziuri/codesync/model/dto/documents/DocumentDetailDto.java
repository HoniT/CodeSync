package ge.mziuri.codesync.model.dto.documents;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentDetailDto {
    private UUID id;
    private String title;
    private String content;
    private boolean isPublic;
    private String creatorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime lastSavedAt;
}
