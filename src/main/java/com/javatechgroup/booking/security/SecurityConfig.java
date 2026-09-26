package com.javatechgroup.booking.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(List.of("*"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable).cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(
						exceptions -> exceptions.authenticationEntryPoint((request, response, authException) -> {
							response.setContentType("application/json;charset=UTF-8");
							response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
							response.getWriter().write(
									"{\"success\":false,\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required or session expired. Please sign in again.\"}");
						}).accessDeniedHandler((request, response, accessDeniedException) -> {
							response.setContentType("application/json;charset=UTF-8");
							response.setStatus(HttpServletResponse.SC_FORBIDDEN);
							response.getWriter().write(
									"{\"success\":false,\"code\":\"FORBIDDEN\",\"message\":\"Access denied. You do not have permission to access this resource.\"}");
						}))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico", "/*.js", "/*.css", "/*.png",
								"/*.svg", "/*.ico")
						.permitAll().requestMatchers("/api/auth/**").permitAll().requestMatchers("/h2-console/**")
						.permitAll().requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")
						.requestMatchers("/api/facility/**").hasAnyRole("SUPER_ADMIN", "COMPANY_ADMIN", "EMPLOYEE")
						.requestMatchers("/api/company/**").hasAnyRole("SUPER_ADMIN", "COMPANY_ADMIN")
						.requestMatchers("/api/**").authenticated().anyRequest().permitAll());

		http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
