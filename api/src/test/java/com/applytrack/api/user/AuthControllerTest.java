package com.applytrack.api.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;
import java.util.regex.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;

    private static String creds(String email, String password) {
        return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
    }

    private static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@test.com";
    }

    private static String tokenFrom(String json) {
        Matcher m = Pattern.compile("\"token\"\\s*:\\s*\"([^\"]+)\"").matcher(json);
        assertThat(m.find()).as("token present in response: " + json).isTrue();
        return m.group(1);
    }

    @Test
    void registerThenLoginReturnsToken() throws Exception {
        String email = uniqueEmail();

        String registerBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(creds(email, "password123")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        assertThat(tokenFrom(registerBody)).isNotBlank();

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(creds(email, "password123")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(tokenFrom(loginBody)).isNotBlank();
    }

    @Test
    void wrongPasswordReturns401() throws Exception {
        String email = uniqueEmail();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(creds(email, "password123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(creds(email, "wrong-password")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateRegistrationReturns409() throws Exception {
        String email = uniqueEmail();
        String body = creds(email, "password123");

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void invalidRegistrationReturns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(creds("not-an-email", "x")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedEndpointNeedsAValidToken() throws Exception {
        mockMvc.perform(get("/api/applications")).andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/applications").header("Authorization", "Bearer not.a.real.token"))
                .andExpect(status().isUnauthorized());

        String email = uniqueEmail();
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(creds(email, "password123")))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/applications").header("Authorization", "Bearer " + tokenFrom(body)))
                .andExpect(status().isOk());
    }
}