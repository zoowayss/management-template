package com.india.management.config;

import com.india.management.security.CustomAccessDeniedHandler;
import com.india.management.security.CustomAuthenticationEntryPoint;
import com.india.management.security.CustomUserDetailsService;
import com.india.management.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring SecurityFilterChain");

        // 禁用 CSRF 保护
        http.csrf(AbstractHttpConfigurer::disable);

        // 禁用 CORS（前端使用代理）
        http.cors(AbstractHttpConfigurer::disable);

        // 配置会话管理
        http.sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        // 配置异常处理
        http.exceptionHandling(exceptions -> {
            exceptions.authenticationEntryPoint(authenticationEntryPoint);
            exceptions.accessDeniedHandler(accessDeniedHandler);
        });

        // 配置请求授权
        http.authorizeHttpRequests(auth -> {
            log.info("Configuring authorization rules");

            // 公开的端点 - 只有登录
            auth.requestMatchers("/**", "/api/auth/login").permitAll();

            // 其他公开的端点
            auth.requestMatchers("/api/public/**").permitAll();
            auth.requestMatchers("/error").permitAll();

            // 所有其他请求需要认证
            auth.anyRequest().authenticated();

            log.info("Authorization rules configured");
        });

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }


}
