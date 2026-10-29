-- =============================================================================
-- MEDICONNECT DATABASE SCHEMA
-- MySQL 8.0+  |  Charset: utf8mb4 / utf8mb4_unicode_ci
-- =============================================================================
-- Conventions:
--   • All PKs are CHAR(36) UUIDs generated at the application layer (UUID v4).
--   • Monetary values use DECIMAL(10,2).
--   • All timestamps are DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP.
--   • Passwords are NEVER stored in plain text; the application layer hashes
--     them with Argon2id before persistence.
--   • Card numbers and M-Pesa PINs are NEVER stored.
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- Drop in reverse dependency order for clean re-runs
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS provider_locations;
DROP TABLE IF EXISTS booking_status_history;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS patient_addresses;
DROP TABLE IF EXISTS provider_service_areas;
DROP TABLE IF EXISTS provider_availability;
DROP TABLE IF EXISTS provider_services;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS provider_credentials;
DROP TABLE IF EXISTS provider_profiles;
DROP TABLE IF EXISTS patient_profiles;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
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
    INDEX      idx_users_role  (role),
    INDEX      idx_users_is_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. refresh_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
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

-- ---------------------------------------------------------------------------
-- 3. patient_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE patient_profiles (
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
CREATE TABLE provider_profiles (
    id                   CHAR(36)     NOT NULL,
    user_id              CHAR(36)     NOT NULL,
    provider_type        ENUM('DOCTOR','NURSE','LABORATORY','PHARMACY',
                              'AMBULANCE','PHYSIOTHERAPIST','HOME_CARE','OTHER') NOT NULL,
    first_name           VARCHAR(100) NOT NULL,
    last_name            VARCHAR(100) NOT NULL,
    business_name        VARCHAR(300) NULL,
    profile_photo_url    TEXT         NULL,
    bio                  TEXT         NULL,
    verification_status  ENUM('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','SUSPENDED')
                                      NOT NULL DEFAULT 'PENDING',
    verification_notes   TEXT         NULL,
    average_rating       DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    total_reviews        INT          NOT NULL DEFAULT 0,
    is_available         BOOLEAN      NOT NULL DEFAULT FALSE,
    current_latitude     DECIMAL(10,8) NULL,
    current_longitude    DECIMAL(11,8) NULL,
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_provp_user_id           (user_id),
    INDEX      idx_provp_verification     (verification_status),
    INDEX      idx_provp_type             (provider_type),
    INDEX      idx_provp_is_available     (is_available),
    INDEX      idx_provp_location         (current_latitude, current_longitude),

    CONSTRAINT fk_provp_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. provider_credentials
-- ---------------------------------------------------------------------------
CREATE TABLE provider_credentials (
    id                  CHAR(36)     NOT NULL,
    provider_id         CHAR(36)     NOT NULL  COMMENT 'FK → provider_profiles.id',
    credential_type     VARCHAR(100) NOT NULL,
    credential_number   VARCHAR(200) NOT NULL,
    issuing_authority   VARCHAR(300) NOT NULL,
    issue_date          DATE         NOT NULL,
    expiry_date         DATE         NULL,
    document_url        TEXT         NOT NULL COMMENT 'Secure, signed URL — never public',
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

-- ---------------------------------------------------------------------------
-- 6. service_categories
-- ---------------------------------------------------------------------------
CREATE TABLE service_categories (
    id            CHAR(36)     NOT NULL,
    slug          VARCHAR(100) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT         NULL,
    icon_name     VARCHAR(100) NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order INT          NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_sc_slug     (slug),
    INDEX      idx_sc_active  (is_active),
    INDEX      idx_sc_order   (display_order)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. provider_services
-- ---------------------------------------------------------------------------
CREATE TABLE provider_services (
    id           CHAR(36)     NOT NULL,
    provider_id  CHAR(36)     NOT NULL,
    category_id  CHAR(36)     NOT NULL,
    description  TEXT         NULL,
    base_price   DECIMAL(10,2) NOT NULL,
    price_unit   ENUM('PER_VISIT','PER_HOUR','FIXED') NOT NULL DEFAULT 'PER_VISIT',
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_ps_provider_category (provider_id, category_id),
    INDEX      idx_ps_category_id      (category_id),
    INDEX      idx_ps_is_active        (is_active),

    CONSTRAINT fk_ps_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ps_category FOREIGN KEY (category_id)
        REFERENCES service_categories (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. provider_availability
-- ---------------------------------------------------------------------------
CREATE TABLE provider_availability (
    id           CHAR(36)  NOT NULL,
    provider_id  CHAR(36)  NOT NULL,
    day_of_week  TINYINT   NOT NULL COMMENT '0=Sunday … 6=Saturday',
    start_time   TIME      NOT NULL,
    end_time     TIME      NOT NULL,
    is_active    BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_pa_provider_day (provider_id, day_of_week),

    CONSTRAINT fk_pa_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_pa_day CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT chk_pa_times CHECK (end_time > start_time)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. provider_service_areas
-- ---------------------------------------------------------------------------
CREATE TABLE provider_service_areas (
    id               CHAR(36)      NOT NULL,
    provider_id      CHAR(36)      NOT NULL,
    area_name        VARCHAR(200)  NOT NULL,
    center_latitude  DECIMAL(10,8) NOT NULL,
    center_longitude DECIMAL(11,8) NOT NULL,
    radius_km        DECIMAL(6,2)  NOT NULL DEFAULT 20.00,
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_psa_provider_id (provider_id),
    INDEX idx_psa_location    (center_latitude, center_longitude),

    CONSTRAINT fk_psa_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 10. patient_addresses
-- ---------------------------------------------------------------------------
CREATE TABLE patient_addresses (
    id              CHAR(36)      NOT NULL,
    patient_user_id CHAR(36)      NOT NULL,
    label           VARCHAR(100)  NOT NULL DEFAULT 'Home',
    address_line    TEXT          NULL,
    latitude        DECIMAL(10,8) NOT NULL,
    longitude       DECIMAL(11,8) NOT NULL,
    is_default      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_addr_patient_user_id (patient_user_id),
    INDEX idx_addr_location        (latitude, longitude),

    CONSTRAINT fk_addr_patient FOREIGN KEY (patient_user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 11. bookings
-- ---------------------------------------------------------------------------
CREATE TABLE bookings (
    id                    CHAR(36)      NOT NULL,
    patient_user_id       CHAR(36)      NOT NULL,
    provider_id           CHAR(36)      NULL  COMMENT 'FK → provider_profiles.id; NULL until accepted',
    category_id           CHAR(36)      NOT NULL,
    booking_type          ENUM('IMMEDIATE','SCHEDULED') NOT NULL DEFAULT 'IMMEDIATE',
    status                ENUM(
                            'PENDING',
                            'ACCEPTED',
                            'EN_ROUTE',
                            'ARRIVED',
                            'IN_PROGRESS',
                            'COMPLETED',
                            'CANCELLED_BY_PATIENT',
                            'CANCELLED_BY_PROVIDER',
                            'REJECTED',
                            'EXPIRED'
                          ) NOT NULL DEFAULT 'PENDING',
    patient_address_id    CHAR(36)      NULL,
    patient_latitude      DECIMAL(10,8) NOT NULL,
    patient_longitude     DECIMAL(11,8) NOT NULL,
    patient_address_text  TEXT          NOT NULL,
    scheduled_at          DATETIME      NULL,
    notes                 TEXT          NULL,
    quoted_price          DECIMAL(10,2) NULL,
    final_price           DECIMAL(10,2) NULL,
    platform_commission   DECIMAL(10,2) NULL,
    provider_payout       DECIMAL(10,2) NULL,
    accepted_at           DATETIME      NULL,
    completed_at          DATETIME      NULL,
    cancelled_at          DATETIME      NULL,
    cancellation_reason   TEXT          NULL,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_bk_patient_user_id (patient_user_id),
    INDEX idx_bk_provider_id     (provider_id),
    INDEX idx_bk_category_id     (category_id),
    INDEX idx_bk_status          (status),
    INDEX idx_bk_booking_type    (booking_type),
    INDEX idx_bk_scheduled_at    (scheduled_at),
    INDEX idx_bk_created_at      (created_at),

    CONSTRAINT fk_bk_patient FOREIGN KEY (patient_user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bk_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_bk_category FOREIGN KEY (category_id)
        REFERENCES service_categories (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bk_address FOREIGN KEY (patient_address_id)
        REFERENCES patient_addresses (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 12. booking_status_history
-- ---------------------------------------------------------------------------
CREATE TABLE booking_status_history (
    id                  CHAR(36)     NOT NULL,
    booking_id          CHAR(36)     NOT NULL,
    from_status         VARCHAR(50)  NULL  COMMENT 'NULL for initial status insertion',
    to_status           VARCHAR(50)  NOT NULL,
    changed_by_user_id  CHAR(36)     NOT NULL,
    notes               TEXT         NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_bsh_booking_id (booking_id),
    INDEX idx_bsh_created_at (created_at),

    CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bsh_changed_by FOREIGN KEY (changed_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 13. provider_locations  (real-time ping table)
-- ---------------------------------------------------------------------------
CREATE TABLE provider_locations (
    id          CHAR(36)      NOT NULL,
    provider_id CHAR(36)      NOT NULL,
    latitude    DECIMAL(10,8) NOT NULL,
    longitude   DECIMAL(11,8) NOT NULL,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_pl_provider_id (provider_id),
    INDEX      idx_pl_location   (latitude, longitude),

    CONSTRAINT fk_pl_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 14. payments
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
    id                CHAR(36)      NOT NULL,
    booking_id        CHAR(36)      NOT NULL,
    patient_user_id   CHAR(36)      NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    currency          CHAR(3)       NOT NULL DEFAULT 'KES',
    payment_method    ENUM('MPESA','CARD','CASH','MOCK') NOT NULL,
    status            ENUM('PENDING','PROCESSING','COMPLETED','FAILED',
                           'REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    gateway_reference VARCHAR(300)  NULL  COMMENT 'M-Pesa checkout request ID, etc.',
    gateway_response  JSON          NULL  COMMENT 'Full raw callback — never card numbers',
    idempotency_key   CHAR(36)      NOT NULL,
    paid_at           DATETIME      NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_pay_booking_id      (booking_id),
    UNIQUE KEY uq_pay_idempotency_key (idempotency_key),
    INDEX      idx_pay_patient_user_id (patient_user_id),
    INDEX      idx_pay_status          (status),
    INDEX      idx_pay_payment_method  (payment_method),

    CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pay_patient FOREIGN KEY (patient_user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 15. refunds
-- ---------------------------------------------------------------------------
CREATE TABLE refunds (
    id                    CHAR(36)      NOT NULL,
    payment_id            CHAR(36)      NOT NULL,
    requested_by_user_id  CHAR(36)      NOT NULL,
    amount                DECIMAL(10,2) NOT NULL,
    reason                TEXT          NOT NULL,
    status                ENUM('PENDING','APPROVED','PROCESSED','REJECTED') NOT NULL DEFAULT 'PENDING',
    processed_by_user_id  CHAR(36)      NULL,
    gateway_reference     VARCHAR(300)  NULL,
    processed_at          DATETIME      NULL,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_ref_payment_id   (payment_id),
    INDEX idx_ref_status       (status),

    CONSTRAINT fk_ref_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ref_requested_by FOREIGN KEY (requested_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ref_processed_by FOREIGN KEY (processed_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 16. reviews
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
    id              CHAR(36)  NOT NULL,
    booking_id      CHAR(36)  NOT NULL,
    patient_user_id CHAR(36)  NOT NULL,
    provider_id     CHAR(36)  NOT NULL,
    rating          TINYINT   NOT NULL,
    comment         TEXT      NULL,
    is_visible      BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at      DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_rev_booking_id (booking_id),
    INDEX      idx_rev_provider_id (provider_id),
    INDEX      idx_rev_patient_id  (patient_user_id),
    INDEX      idx_rev_rating      (rating),

    CONSTRAINT chk_rev_rating CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT fk_rev_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rev_patient FOREIGN KEY (patient_user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rev_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 17. notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id         CHAR(36)     NOT NULL,
    user_id    CHAR(36)     NOT NULL,
    type       VARCHAR(100) NOT NULL,
    title      VARCHAR(500) NOT NULL,
    body       TEXT         NOT NULL,
    data       JSON         NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at    DATETIME     NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_notif_user_id  (user_id),
    INDEX idx_notif_is_read  (is_read),
    INDEX idx_notif_type     (type),
    INDEX idx_notif_created  (created_at),

    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 18. support_tickets
-- ---------------------------------------------------------------------------
CREATE TABLE support_tickets (
    id                   CHAR(36)     NOT NULL,
    patient_user_id      CHAR(36)     NULL,
    provider_user_id     CHAR(36)     NULL,
    booking_id           CHAR(36)     NULL,
    subject              VARCHAR(500) NOT NULL,
    description          TEXT         NOT NULL,
    status               ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
    priority             ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
    assigned_to_user_id  CHAR(36)     NULL,
    resolved_at          DATETIME     NULL,
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_st_status             (status),
    INDEX idx_st_priority           (priority),
    INDEX idx_st_patient_user_id    (patient_user_id),
    INDEX idx_st_provider_user_id   (provider_user_id),
    INDEX idx_st_booking_id         (booking_id),
    INDEX idx_st_assigned_to        (assigned_to_user_id),

    CONSTRAINT fk_st_patient FOREIGN KEY (patient_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_st_provider FOREIGN KEY (provider_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_st_booking FOREIGN KEY (booking_id)
        REFERENCES bookings (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_st_assigned FOREIGN KEY (assigned_to_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 19. audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id           CHAR(36)     NOT NULL,
    user_id      CHAR(36)     NULL  COMMENT 'NULL for system-generated events',
    action       VARCHAR(200) NOT NULL,
    entity_type  VARCHAR(100) NULL,
    entity_id    CHAR(36)     NULL,
    old_value    JSON         NULL,
    new_value    JSON         NULL,
    ip_address   VARCHAR(45)  NULL,
    user_agent   TEXT         NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_al_user_id     (user_id),
    INDEX idx_al_action      (action),
    INDEX idx_al_entity      (entity_type, entity_id),
    INDEX idx_al_created_at  (created_at),

    -- Intentionally no FK on user_id: audit logs must survive user deletion
    CONSTRAINT fk_al_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 20. platform_settings
-- ---------------------------------------------------------------------------
CREATE TABLE platform_settings (
    id                  CHAR(36)     NOT NULL,
    `key`               VARCHAR(200) NOT NULL,
    value               TEXT         NOT NULL,
    description         TEXT         NULL,
    updated_by_user_id  CHAR(36)     NULL,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_ps_key (`key`),

    CONSTRAINT fk_ps_updated_by FOREIGN KEY (updated_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
