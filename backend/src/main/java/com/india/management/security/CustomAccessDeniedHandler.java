package com.india.management.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.india.management.vo.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {
        log.error("Access denied error: {}", accessDeniedException.getMessage());
        
        // 记录请求信息，帮助调试
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Request Method: {}", request.getMethod());
        log.info("Request Headers: ");
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> 
            log.info("{}: {}", headerName, request.getHeader(headerName))
        );
        
        // 设置响应
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        
        // 创建错误响应
        ApiResponse<?> apiResponse = ApiResponse.error("拒绝访问：" + accessDeniedException.getMessage());
        
        // 写入响应
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
