-- =============================================================================
-- Migration 004: Create Bookings, Booking Status History,
--                Patient Addresses & Provider Locations
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 10. patient_addresses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_addresses (
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
CREATE TABLE IF NOT EXISTS bookings (
    id                    CHAR(36)      NOT NULL,
    patient_user_id       CHAR(36)      NOT NULL,
    provider_id           CHAR(36)      NULL  COMMENT 'NULL until a provider accepts',
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
CREATE TABLE IF NOT EXISTS booking_status_history (
    id                  CHAR(36)    NOT NULL,
    booking_id          CHAR(36)    NOT NULL,
    from_status         VARCHAR(50) NULL,
    to_status           VARCHAR(50) NOT NULL,
    changed_by_user_id  CHAR(36)    NOT NULL,
    notes               TEXT        NULL,
    created_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
-- 13. provider_locations (real-time location ping)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_locations (
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
