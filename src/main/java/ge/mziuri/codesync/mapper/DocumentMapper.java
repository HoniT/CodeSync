package ge.mziuri.codesync.mapper;

import ge.mziuri.codesync.model.dto.documents.DocumentDto;
import ge.mziuri.codesync.model.entity.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {
    public DocumentDto entityToDto(Document document) {
        return new DocumentDto(document.getId(), document.getTitle(),
                document.getCreator().getUsername(), document.getCreatedAt(),
                document.getLastSavedAt());
    }
}
