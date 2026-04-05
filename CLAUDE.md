# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TutorIQ is an AI-powered tutoring platform. Monorepo with a Spring Boot/Kotlin backend (`tutoriq-be/`) and a planned React Native/Expo frontend (`tutoriq-fe/`, not yet created).

## Build & Run Commands

All backend commands run from `tutoriq-be/`:

```bash
cd tutoriq-be
./gradlew build          # Build + run all tests
./gradlew test           # Run all tests
./gradlew bootRun        # Start the app (requires DB + env vars)
```

Run a single test class:
```bash
./gradlew test --tests "com.tutoriq.HealthControllerTest"
```

Use the `local` Spring profile for development (`--spring.profiles.active=local` or `SPRING_PROFILES_ACTIVE=local`), which connects to `localhost:5432/tutoriq` with credentials `tutoriq/tutoriq`.

## Tech Stack

- **Language**: Kotlin 2.1.20, Java 21
- **Framework**: Spring Boot 3.4.4 with Spring Security, Spring Data JPA, Spring Validation
- **Database**: PostgreSQL 16, Flyway migrations (`src/main/resources/db/migration/`)
- **Auth**: JWT via JJWT 0.12.6
- **AI**: Anthropic Claude API — tutor model (Sonnet) and summary model (Haiku)
- **Testing**: JUnit 5, MockMvc (`@WebMvcTest`), Mockito-Kotlin

## Architecture

Backend follows standard Spring layered architecture under `com.tutoriq`:

- `controller/` — REST endpoints
- `service/` — Business logic
- `repository/` — Spring Data JPA repositories
- `model/entity/` — JPA entities (UUID primary keys throughout)
- `model/dto/` — Request/response DTOs
- `security/` — JWT auth, Spring Security config
- `config/` — Spring beans and configuration
- `exception/` — Custom exceptions and handlers

Hibernate is set to `validate` mode — all schema changes must go through Flyway migrations, never auto-DDL.

## Database Schema

Flyway V1 migration defines: `users` (roles: STUDENT/TUTOR/PARENT), `subscriptions`, `trial_usage`, `tutor_sessions`, `tutor_messages`, `chat_summaries`, `chat_tags`, `chat_tag_links`, `flashcard_decks`, `flashcard_cards`, `grade_subject_configs`. All tables use UUID PKs.

## Environment Variables

Required for non-local profiles: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ANTHROPIC_API_KEY`.
