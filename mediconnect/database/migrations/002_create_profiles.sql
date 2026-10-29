-- =============================================================================
-- Migration 002: Create Patient & Provider Profiles + Credentials
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 3. patient_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_profiles (
    id                      CHAR(36)     NOT NULL,
    user_id                 CHAR(36)     NOT NULL,
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    date_of_birth           DATE         NULL,
    gender                  ENUM('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY') NULL,
    profile_photo_url       TEXT         NULL,
    emergency_contact_name  VARCHAR(200) NULL,
    emergency_contact_phone VARCHAR(20)  NULL,
    created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_pp_user_id (user_id),

    CONSTRAINT fk_pp_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. provider_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_profiles (
    id                   CHAR(36)      NOT NULL,
    user_id              CHAR(36)      NOT NULL,
    provider_type        ENUM('DOCTOR','NURSE','LABORATORY','PHARMACY',
                              'AMBULANCE','PHYSIOTHERAPIST','HOME_CARE','OTHER') NOT NULL,
    first_name           VARCHAR(100)  NOT NULL,
    last_name            VARCHAR(100)  NOT NULL,
    business_name        VARCHAR(300)  NULL,
    profile_photo_url    TEXT          NULL,
    bio                  TEXT          NULL,
    verification_status  ENUM('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','SUSPENDED')
                                       NOT NULL DEFAULT 'PENDING',
    verification_notes   TEXT          NULL,
    average_rating       DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    total_reviews        INT           NOT NULL DEFAULT 0,
    is_available         BOOLEAN       NOT NULL DEFAULT FALSE,
    current_latitude     DECIMAL(10,8) NULL,
    current_longitude    DECIMAL(11,8) NULL,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_provp_user_id        (user_id),
    INDEX      idx_provp_verification  (verification_status),
    INDEX      idx_provp_type          (provider_type),
    INDEX      idx_provp_is_available  (is_available),
    INDEX      idx_provp_location      (current_latitude, current_longitude),

    CONSTRAINT fk_provp_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. provider_credentials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_credentials (
    id                  CHAR(36)     NOT NULL,
    provider_id         CHAR(36)     NOT NULL,
    credential_type     VARCHAR(100) NOT NULL,
    credential_number   VARCHAR(200) NOT NULL,
    issuing_authority   VARCHAR(300) NOT NULL,
    issue_date          DATE         NOT NULL,
    expiry_date         DATE         NULL,
    document_url        TEXT         NOT NULL COMMENT 'Secure signed URL — never publicly exposed',
    verified_at         DATETIME     NULL,
    verified_by_user_id CHAR(36)     NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_pc_provider_id (provider_id),
    INDEX idx_pc_expiry_date (expiry_date),

    CONSTRAINT fk_pc_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pc_verified_by FOREIGN KEY (verified_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
