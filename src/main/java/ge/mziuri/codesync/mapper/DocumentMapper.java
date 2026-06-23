package ge.mziuri.codesync.mapper;

import ge.mziuri.codesync.model.dto.documents.DocumentDetailDto;
import ge.mziuri.codesync.model.entity.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {
    public DocumentDetailDto entityToDetailsDto(Document document, boolean copyContent) {
        return new DocumentDetailDto(document.getId(), document.getTitle(),
                copyContent ? document.getContent() : null, document.getCreator().getUsername(),
                document.getCreatedAt(), document.getLastSavedAt());
    }
}
