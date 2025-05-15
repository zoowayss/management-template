package com.india.management.exception;

/**
 * 资源未找到异常
 */
public class ResourceNotFoundException extends BusinessException {
    
    public ResourceNotFoundException(String message) {
        super(message, 404);
    }
    
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s 未找到，%s: %s", resourceName, fieldName, fieldValue), 404);
    }
}
