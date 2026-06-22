package ge.mziuri.codesync.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(HttpErrorException.class)
    public ResponseEntity<ErrorResponse> handleHttpError(HttpErrorException e) {
        ErrorResponse error = new ErrorResponse(
                e.getHttpErrCode(),
                getStatusString(e.getHttpErrCode()),
                e.getMessage(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(e.getHttpErrCode()).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();


        String errorMessage = String.join(", ", errors);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNPROCESSABLE_CONTENT.value(),
                "Validation Error",
                errorMessage,
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(errorResponse);
    }

    private static String getStatusString(int statusCode) {
        HttpStatus status = HttpStatus.resolve(statusCode);

        if (status != null) {
            return status.getReasonPhrase();
        } else {
            return "Unknown Status";
        }
    }
}
