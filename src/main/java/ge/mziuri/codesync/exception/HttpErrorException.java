package ge.mziuri.codesync.exception;

import lombok.Getter;

@Getter
public class HttpErrorException extends RuntimeException {
    private final int httpErrCode;

    public HttpErrorException(int httpErrCode, String message) {
        super(message);
        this.httpErrCode = httpErrCode;
    }
}
