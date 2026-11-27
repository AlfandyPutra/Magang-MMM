-- ============================================================================
-- DATABASE: mmm_maintenance
-- PT Mitra Mulia Makmur (MMM Plastic) — Maintenance Summary Dashboard (MtD)
-- Kompatibel dengan XAMPP MySQL & Laravel Eloquent ORM
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `mmm_maintenance`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `mmm_maintenance`;

-- ============================================================================
-- 1. TABEL CABANG / PABRIK (branches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `branches` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `branches_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data awal 4 cabang pabrik PT MMM Plastic
INSERT IGNORE INTO `branches` (`code`, `name`, `city`) VALUES
('MMM', 'PT Mitra Mulia Makmur — Sidoarjo', 'Sidoarjo'),
('MMN', 'PT Mitra Mulia Makmur — Nganjuk', 'Nganjuk'),
('MMS', 'PT Mitra Mulia Makmur — Serang', 'Serang'),
('MMG', 'PT Mitra Mulia Makmur — Malang', 'Malang');

-- ============================================================================
-- 2. TABEL MASTER MESIN (machines)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `machines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `unit_name` VARCHAR(150) NOT NULL,
    `category` ENUM('Injection', 'Printing', 'Blowing', 'Utility', 'Robot', 'Auxiliary', 'Lain-lain') NOT NULL DEFAULT 'Injection',
    `operational_status` ENUM('Running', 'Breakdown', 'No Order') NOT NULL DEFAULT 'No Order',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `machines_code_unique` (`code`),
    KEY `machines_branch_category_idx` (`branch_id`, `category`),
    KEY `machines_status_idx` (`operational_status`),
    CONSTRAINT `machines_branch_id_fk`
        FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. TABEL TIKET SPK & LOG HARIAN (maintenance_tickets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `maintenance_tickets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ticket_number` VARCHAR(60) NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `machine_id` BIGINT UNSIGNED NOT NULL,
    `ticket_date` DATE NOT NULL,
    `type` ENUM('DT', 'PM') NOT NULL DEFAULT 'DT',
    `dt_hours` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `pm_hours` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `cost_dt` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `cost_pm` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `total_cost` DECIMAL(15,2) GENERATED ALWAYS AS (`cost_dt` + `cost_pm`) STORED,
    `status` ENUM('OPEN', 'ASSIGNMENT', 'WAITING_TO_CLOSE', 'CLOSED') NOT NULL DEFAULT 'CLOSED',
    `problem_description` TEXT NULL,
    `sparepart_action` TEXT NULL,
    `pic_technician` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `tickets_number_idx` (`ticket_number`),
    KEY `tickets_date_type_status_idx` (`ticket_date`, `type`, `status`),
    KEY `tickets_branch_machine_idx` (`branch_id`, `machine_id`),
    CONSTRAINT `tickets_branch_id_fk`
        FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `tickets_machine_id_fk`
        FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. TABEL DATA PROJECT MAINTENANCE & UPGRADING (maintenance_projects)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `maintenance_projects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_code` VARCHAR(50) NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `machine_related` VARCHAR(150) NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'Injection',
    `pic_name` VARCHAR(100) NOT NULL,
    `progress_pct` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('OPEN', 'PROSES', 'OUTSTANDING', 'SELESAI') NOT NULL DEFAULT 'OPEN',
    `target_date` VARCHAR(50) NULL,
    `efficiency_impact` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `projects_code_unique` (`project_code`),
    KEY `projects_branch_status_idx` (`branch_id`, `status`),
    CONSTRAINT `projects_branch_id_fk`
        FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
