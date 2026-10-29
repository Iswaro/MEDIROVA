-- =============================================================================
-- Migration 003: Create Service Categories, Provider Services,
--                Availability, and Service Areas
-- MEDICONNECT | MySQL 8.0+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 6. service_categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_categories (
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
    UNIQUE KEY uq_sc_slug    (slug),
    INDEX      idx_sc_active (is_active),
    INDEX      idx_sc_order  (display_order)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. provider_services
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_services (
    id           CHAR(36)      NOT NULL,
    provider_id  CHAR(36)      NOT NULL,
    category_id  CHAR(36)      NOT NULL,
    description  TEXT          NULL,
    base_price   DECIMAL(10,2) NOT NULL,
    price_unit   ENUM('PER_VISIT','PER_HOUR','FIXED') NOT NULL DEFAULT 'PER_VISIT',
    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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
CREATE TABLE IF NOT EXISTS provider_availability (
    id          CHAR(36) NOT NULL,
    provider_id CHAR(36) NOT NULL,
    day_of_week TINYINT  NOT NULL COMMENT '0=Sunday … 6=Saturday',
    start_time  TIME     NOT NULL,
    end_time    TIME     NOT NULL,
    is_active   BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_pa_provider_day (provider_id, day_of_week),

    CONSTRAINT fk_pa_provider FOREIGN KEY (provider_id)
        REFERENCES provider_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_pa_day   CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT chk_pa_times CHECK (end_time > start_time)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. provider_service_areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_service_areas (
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
