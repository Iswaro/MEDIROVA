-- =============================================================================
-- Migration 006: Create Reviews & Notifications
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 16. reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id              CHAR(36) NOT NULL,
    booking_id      CHAR(36) NOT NULL,
    patient_user_id CHAR(36) NOT NULL,
    provider_id     CHAR(36) NOT NULL,
    rating          TINYINT  NOT NULL,
    comment         TEXT     NULL,
    is_visible      BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_rev_booking_id  (booking_id),
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
CREATE TABLE IF NOT EXISTS notifications (
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
    INDEX idx_notif_user_id (user_id),
    INDEX idx_notif_is_read (is_read),
    INDEX idx_notif_type    (type),
    INDEX idx_notif_created (created_at),

    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
