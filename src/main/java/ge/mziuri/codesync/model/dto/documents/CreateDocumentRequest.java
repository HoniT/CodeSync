package ge.mziuri.codesync.model.dto.documents;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CreateDocumentRequest {
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Access code must be alphanumeric")
    @Size(min = 4, max = 20, message = "Access code must be between 4 and 20 characters")
    private String accessCode;
    @NotBlank(message = "Title cannot be blank")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    // If not null when creating the document it will clone this files contents
    private MultipartFile fileToClone;
}
