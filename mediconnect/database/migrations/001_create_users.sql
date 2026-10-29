-- =============================================================================
-- Migration 001: Create Users & Auth Tables
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  CHAR(36)     NOT NULL,
    email               VARCHAR(320) NOT NULL,
    phone               VARCHAR(20)  NULL,
    password_hash       VARCHAR(500) NOT NULL COMMENT 'Argon2id hash — never plain text',
    role                ENUM('PATIENT','PROVIDER','ADMIN','SUPPORT') NOT NULL DEFAULT 'PATIENT',
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified_at   DATETIME     NULL,
    last_login_at       DATETIME     NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email  (email),
    UNIQUE KEY uq_users_phone  (phone),
    INDEX      idx_users_role      (role),
    INDEX      idx_users_is_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. refresh_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          CHAR(36)     NOT NULL,
    user_id     CHAR(36)     NOT NULL,
    token_hash  VARCHAR(500) NOT NULL COMMENT 'SHA-256 hash of the opaque token',
    expires_at  DATETIME     NOT NULL,
    revoked_at  DATETIME     NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_rt_user_id    (user_id),
    INDEX idx_rt_expires_at (expires_at),

    CONSTRAINT fk_rt_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
