package com.india.management.exception;

/**
 * 业务异常基类
 */
public class BusinessException extends RuntimeException {
    
    private Integer code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
    }
    
    public BusinessException(String message, Integer code) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(String message, Integer code, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    
    public Integer getCode() {
        return this.code;
    }
}
