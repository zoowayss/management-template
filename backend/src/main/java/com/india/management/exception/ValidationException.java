package com.india.management.exception;

/**
 * 参数验证异常
 */
public class ValidationException extends BusinessException {
    
    public ValidationException(String message) {
        super(message, 400);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, 400, cause);
    }
}
