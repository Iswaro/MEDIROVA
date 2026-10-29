-- =============================================================================
-- Migration 007: Create Admin Tables
--               (Support Tickets, Audit Logs, Platform Settings)
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 18. support_tickets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
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
    INDEX idx_st_status           (status),
    INDEX idx_st_priority         (priority),
    INDEX idx_st_patient_user_id  (patient_user_id),
    INDEX idx_st_provider_user_id (provider_user_id),
    INDEX idx_st_booking_id       (booking_id),
    INDEX idx_st_assigned_to      (assigned_to_user_id),

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
CREATE TABLE IF NOT EXISTS audit_logs (
    id           CHAR(36)     NOT NULL,
    user_id      CHAR(36)     NULL  COMMENT 'NULL for system events; survives user deletion',
    action       VARCHAR(200) NOT NULL,
    entity_type  VARCHAR(100) NULL,
    entity_id    CHAR(36)     NULL,
    old_value    JSON         NULL,
    new_value    JSON         NULL,
    ip_address   VARCHAR(45)  NULL,
    user_agent   TEXT         NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_al_user_id    (user_id),
    INDEX idx_al_action     (action),
    INDEX idx_al_entity     (entity_type, entity_id),
    INDEX idx_al_created_at (created_at),

    CONSTRAINT fk_al_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 20. platform_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
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
