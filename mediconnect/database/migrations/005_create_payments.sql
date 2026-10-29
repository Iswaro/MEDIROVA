-- =============================================================================
-- Migration 005: Create Payments & Refunds
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 14. payments
-- IMPORTANT: gateway_response JSON stores raw M-Pesa / card callback payloads.
--            Card PANs, CVVs, and M-Pesa PINs are NEVER stored here or anywhere.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id                CHAR(36)      NOT NULL,
    booking_id        CHAR(36)      NOT NULL,
    patient_user_id   CHAR(36)      NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    currency          CHAR(3)       NOT NULL DEFAULT 'KES',
    payment_method    ENUM('MPESA','CARD','CASH','MOCK') NOT NULL,
    status            ENUM('PENDING','PROCESSING','COMPLETED','FAILED',
                           'REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    gateway_reference VARCHAR(300)  NULL,
    gateway_response  JSON          NULL,
    idempotency_key   CHAR(36)      NOT NULL,
    paid_at           DATETIME      NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_pay_booking_id       (booking_id),
    UNIQUE KEY uq_pay_idempotency_key  (idempotency_key),
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
CREATE TABLE IF NOT EXISTS refunds (
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
    INDEX idx_ref_payment_id (payment_id),
    INDEX idx_ref_status     (status),

    CONSTRAINT fk_ref_payment FOREIGN KEY (payment_id)
        REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ref_requested_by FOREIGN KEY (requested_by_user_id)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ref_processed_by FOREIGN KEY (processed_by_user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
