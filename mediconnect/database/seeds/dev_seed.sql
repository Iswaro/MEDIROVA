-- =============================================================================
-- MEDICONNECT — Development Seed Data
-- Kenyan Healthcare Context | MySQL 8.0+
-- =============================================================================
-- SECURITY NOTE: All password_hash values below are the literal placeholder:
--   '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data'
-- This represents the Argon2id hash of 'Password123!'.
-- Real hashing MUST be done by the application layer (never in SQL).
-- NEVER commit real password hashes or credentials to version control.
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';

SET FOREIGN_KEY_CHECKS = 0;

-- Clear tables in reverse dependency order for idempotent re-seeding
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE platform_settings;
TRUNCATE TABLE support_tickets;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE refunds;
TRUNCATE TABLE payments;
TRUNCATE TABLE provider_locations;
TRUNCATE TABLE booking_status_history;
TRUNCATE TABLE bookings;
TRUNCATE TABLE patient_addresses;
TRUNCATE TABLE provider_service_areas;
TRUNCATE TABLE provider_availability;
TRUNCATE TABLE provider_services;
TRUNCATE TABLE service_categories;
TRUNCATE TABLE provider_credentials;
TRUNCATE TABLE provider_profiles;
TRUNCATE TABLE patient_profiles;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- SECTION 1: USERS
-- =============================================================================

INSERT INTO users (id, email, phone, password_hash, role, is_active, email_verified_at) VALUES

-- Admin & Support
('11111111-0000-0000-0000-000000000001', 'admin@mediconnect.ke',   '+254700000001', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'ADMIN',   TRUE, '2024-01-01 00:00:00'),
('11111111-0000-0000-0000-000000000002', 'support@mediconnect.ke', '+254700000002', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'SUPPORT', TRUE, '2024-01-01 00:00:00'),

-- Patients
('22222222-0000-0000-0000-000000000001', 'amina.ochieng@gmail.com',    '+254712345001', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PATIENT', TRUE, '2024-03-10 08:00:00'),
('22222222-0000-0000-0000-000000000002', 'brian.kamau@gmail.com',      '+254712345002', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PATIENT', TRUE, '2024-04-05 09:00:00'),
('22222222-0000-0000-0000-000000000003', 'cynthia.njeri@gmail.com',    '+254712345003', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PATIENT', TRUE, '2024-05-20 10:00:00'),
('22222222-0000-0000-0000-000000000004', 'david.mwangi@gmail.com',     '+254712345004', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PATIENT', TRUE, '2024-06-01 11:00:00'),
('22222222-0000-0000-0000-000000000005', 'esther.wanjiku@gmail.com',   '+254712345005', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PATIENT', TRUE, '2024-06-15 12:00:00'),

-- Providers
('33333333-0000-0000-0000-000000000001', 'dr.felix.mutua@mediconnect.ke',     '+254722001001', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-02-01 08:00:00'),
('33333333-0000-0000-0000-000000000002', 'dr.grace.achieng@mediconnect.ke',   '+254722001002', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-02-10 08:00:00'),
('33333333-0000-0000-0000-000000000003', 'dr.hassan.omar@mediconnect.ke',     '+254722001003', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-02-15 08:00:00'),
('33333333-0000-0000-0000-000000000004', 'nurse.joan.kariuki@mediconnect.ke', '+254722001004', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-03-01 08:00:00'),
('33333333-0000-0000-0000-000000000005', 'nurse.peter.ndung@mediconnect.ke',  '+254722001005', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-03-05 08:00:00'),
('33333333-0000-0000-0000-000000000006', 'pathlab.nairobi@mediconnect.ke',    '+254722001006', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-03-10 08:00:00'),
('33333333-0000-0000-0000-000000000007', 'goodlife.pharmacy@mediconnect.ke',  '+254722001007', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-03-15 08:00:00'),
('33333333-0000-0000-0000-000000000008', 'rapid.ambulance@mediconnect.ke',    '+254722001008', '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash_for_seed_data', 'PROVIDER', TRUE, '2024-03-20 08:00:00');

-- =============================================================================
-- SECTION 2: PATIENT PROFILES
-- =============================================================================
-- Nairobi neighbourhoods: Westlands (-1.2631, 36.8027), Karen (-1.3185, 36.7057),
-- Kilimani (-1.2916, 36.7860), Parklands (-1.2598, 36.8191), Lang'ata (-1.3350, 36.7457)

INSERT INTO patient_profiles (id, user_id, first_name, last_name, date_of_birth, gender, emergency_contact_name, emergency_contact_phone) VALUES
('22222222-aaaa-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Amina',   'Ochieng',  '1990-06-14', 'FEMALE', 'John Ochieng',   '+254700111001'),
('22222222-aaaa-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Brian',   'Kamau',    '1985-11-22', 'MALE',   'Mary Kamau',     '+254700111002'),
('22222222-aaaa-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Cynthia', 'Njeri',    '1995-03-08', 'FEMALE', 'Joseph Njeri',   '+254700111003'),
('22222222-aaaa-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'David',   'Mwangi',   '1978-09-30', 'MALE',   'Grace Mwangi',   '+254700111004'),
('22222222-aaaa-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', 'Esther',  'Wanjiku',  '2000-01-17', 'FEMALE', 'Samuel Wanjiku', '+254700111005');

-- =============================================================================
-- SECTION 3: PROVIDER PROFILES
-- =============================================================================

INSERT INTO provider_profiles (id, user_id, provider_type, first_name, last_name, business_name, bio, verification_status, average_rating, total_reviews, is_available, current_latitude, current_longitude) VALUES
('provp-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'DOCTOR',        'Felix',  'Mutua',   NULL,                       'General practitioner with 10+ years experience. Specialises in chronic disease management and home visits across Nairobi.',    'VERIFIED', 4.80, 120, TRUE,  -1.2714, 36.8079),
('provp-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'DOCTOR',        'Grace',  'Achieng', NULL,                       'Paediatric-focused GP. Passionate about maternal and child health in Kilimani and Lavington.',                               'VERIFIED', 4.90,  85, TRUE,  -1.2916, 36.7860),
('provp-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', 'DOCTOR',        'Hassan', 'Omar',    NULL,                       'Internal medicine physician. Available for home consultations in Westlands, Parklands, and Gigiri.',                         'VERIFIED', 4.70,  63, FALSE, -1.2598, 36.8191),
('provp-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000004', 'NURSE',         'Joan',   'Kariuki', NULL,                       'Registered nurse (BSN) offering wound care, IV therapy, and post-op nursing at home. Karen and Ngong Road area.',           'VERIFIED', 4.85,  47, TRUE,  -1.3185, 36.7057),
('provp-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000005', 'NURSE',         'Peter',  'Ndung\'u', NULL,                      'Community health nurse. Specialises in elderly care, physiotherapy support, and health education.',                         'VERIFIED', 4.60,  30, TRUE,  -1.3350, 36.7457),
('provp-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000006', 'LABORATORY',    'PathLab','Nairobi', 'PathLab Diagnostics Ltd', 'Accredited diagnostic lab offering home sample collection. Results via secure app link within 24 hours.',                    'VERIFIED', 4.75,  98, TRUE,  -1.2841, 36.8155),
('provp-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000007', 'PHARMACY',      'GoodLife','Pharmacy','GoodLife Pharmacy Westlands','Licensed pharmacy offering prescription delivery and OTC medicines across Westlands, Parklands, and Lavington.','VERIFIED', 4.55,  72, TRUE,  -1.2631, 36.8027),
('provp-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000008', 'AMBULANCE',     'Rapid',  'Response','Rapid Ambulance Services','ALS-equipped ambulance with trained paramedics. 24/7 emergency response across Greater Nairobi.',                           'VERIFIED', 4.95,  55, TRUE,  -1.2921, 36.8219);

-- =============================================================================
-- SECTION 4: PROVIDER CREDENTIALS
-- =============================================================================

INSERT INTO provider_credentials (id, provider_id, credential_type, credential_number, issuing_authority, issue_date, expiry_date, document_url, verified_at, verified_by_user_id) VALUES
('cred-0000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001', 'Medical License',            'KMP/2014/10234', 'Kenya Medical Practitioners & Dentists Council', '2014-06-01', '2025-05-31', 'https://storage.mediconnect.ke/docs/creds/felix_license.pdf',    '2024-02-05 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000002', 'provp-0000-0000-0000-000000000002', 'Medical License',            'KMP/2016/11562', 'Kenya Medical Practitioners & Dentists Council', '2016-09-01', '2026-08-31', 'https://storage.mediconnect.ke/docs/creds/grace_license.pdf',    '2024-02-12 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000003', 'Medical License',            'KMP/2012/08891', 'Kenya Medical Practitioners & Dentists Council', '2012-03-01', '2025-02-28', 'https://storage.mediconnect.ke/docs/creds/hassan_license.pdf',   '2024-02-17 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000004', 'Nursing Council Certificate','NCK/2018/45612', 'Nursing Council of Kenya',                       '2018-07-01', '2026-06-30', 'https://storage.mediconnect.ke/docs/creds/joan_nck.pdf',         '2024-03-03 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000005', 'Nursing Council Certificate','NCK/2019/48921', 'Nursing Council of Kenya',                       '2019-04-01', '2026-03-31', 'https://storage.mediconnect.ke/docs/creds/peter_nck.pdf',        '2024-03-07 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000006', 'provp-0000-0000-0000-000000000006', 'Lab Accreditation',          'KEBS/LAB/2020/0077','Kenya Bureau of Standards',                   '2020-01-15', '2025-01-14', 'https://storage.mediconnect.ke/docs/creds/pathlab_kebs.pdf',     '2024-03-12 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000007', 'provp-0000-0000-0000-000000000007', 'Pharmacy License',           'PPB/2017/PHA/3321','Pharmacy and Poisons Board Kenya',              '2017-11-01', '2025-10-31', 'https://storage.mediconnect.ke/docs/creds/goodlife_ppb.pdf',     '2024-03-17 10:00:00', '11111111-0000-0000-0000-000000000001'),
('cred-0000-0000-0000-000000000008', 'provp-0000-0000-0000-000000000008', 'Ambulance Operating License','NTSA/AMB/2021/0542','National Transport & Safety Authority',         '2021-05-01', '2026-04-30', 'https://storage.mediconnect.ke/docs/creds/rapid_ntsa.pdf',       '2024-03-22 10:00:00', '11111111-0000-0000-0000-000000000001');

-- =============================================================================
-- SECTION 5: SERVICE CATEGORIES
-- =============================================================================

INSERT INTO service_categories (id, slug, name, description, icon_name, is_active, display_order) VALUES
('cat-0000-0000-0000-000000000001', 'doctor-home-visit',      'Doctor Home Visit',       'A qualified physician visits you at home for diagnosis, treatment, or consultation.',              'stethoscope',   TRUE, 1),
('cat-0000-0000-0000-000000000002', 'nurse-home-visit',       'Nurse Home Visit',        'Registered nurses for wound care, injections, IV therapy, and post-operative care at home.',      'syringe',       TRUE, 2),
('cat-0000-0000-0000-000000000003', 'telemedicine',           'Telemedicine',            'Video or voice consultation with a licensed doctor from the comfort of your home.',               'video-camera',  TRUE, 3),
('cat-0000-0000-0000-000000000004', 'lab-sample-collection',  'Lab Sample Collection',   'Accredited lab technicians collect blood, urine, or swab samples at your location.',             'flask',         TRUE, 4),
('cat-0000-0000-0000-000000000005', 'pharmacy-delivery',      'Pharmacy Delivery',       'Prescription and OTC medicines delivered to your door from licensed pharmacies.',                 'pill',          TRUE, 5),
('cat-0000-0000-0000-000000000006', 'ambulance',              'Ambulance',               '24/7 emergency and non-emergency ambulance services with trained paramedics.',                    'ambulance',     TRUE, 6),
('cat-0000-0000-0000-000000000007', 'physiotherapy',          'Physiotherapy',           'Qualified physiotherapists provide rehabilitation and pain management sessions at home.',         'person-running',TRUE, 7),
('cat-0000-0000-0000-000000000008', 'home-care',              'Home Care',               'Trained caregivers for the elderly, disabled, or post-surgery patients requiring daily support.', 'heart-hand',    TRUE, 8);

-- =============================================================================
-- SECTION 6: PROVIDER SERVICES  (realistic KES prices)
-- =============================================================================

INSERT INTO provider_services (id, provider_id, category_id, description, base_price, price_unit, is_active) VALUES
-- Dr. Felix Mutua — Doctor Home Visit & Telemedicine
('ps-000000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000001', 'General consultation, diagnosis, and prescription at your home.',      3500.00, 'PER_VISIT', TRUE),
('ps-000000-0000-0000-000000000002', 'provp-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000003', 'Video consultation for follow-ups, minor ailments, and prescriptions.', 1500.00, 'PER_VISIT', TRUE),

-- Dr. Grace Achieng — Doctor Home Visit & Telemedicine
('ps-000000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000002', 'cat-0000-0000-0000-000000000001', 'Paediatric and general home consultations.',                          4000.00, 'PER_VISIT', TRUE),
('ps-000000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000002', 'cat-0000-0000-0000-000000000003', 'Video consultation — specialises in child health and maternal care.',  2000.00, 'PER_VISIT', TRUE),

-- Dr. Hassan Omar — Doctor Home Visit & Telemedicine
('ps-000000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000003', 'cat-0000-0000-0000-000000000001', 'Internal medicine home visit — chronic illness management.',           4500.00, 'PER_VISIT', TRUE),
('ps-000000-0000-0000-000000000006', 'provp-0000-0000-0000-000000000003', 'cat-0000-0000-0000-000000000003', 'Telemedicine for hypertension, diabetes, and respiratory conditions.', 2000.00, 'PER_VISIT', TRUE),

-- Nurse Joan Kariuki — Nurse Home Visit
('ps-000000-0000-0000-000000000007', 'provp-0000-0000-0000-000000000004', 'cat-0000-0000-0000-000000000002', 'Wound dressing, IV cannulation, medication administration.',           2500.00, 'PER_VISIT', TRUE),
('ps-000000-0000-0000-000000000008', 'provp-0000-0000-0000-000000000004', 'cat-0000-0000-0000-000000000008', 'Post-operative home care and daily nursing support.',                  3000.00, 'PER_HOUR',  TRUE),

-- Nurse Peter Ndung'u — Nurse Home Visit & Home Care
('ps-000000-0000-0000-000000000009', 'provp-0000-0000-0000-000000000005', 'cat-0000-0000-0000-000000000002', 'Community nursing: injections, vitals monitoring, health education.',  2000.00, 'PER_VISIT', TRUE),
('ps-000000-0000-0000-000000000010', 'provp-0000-0000-0000-000000000005', 'cat-0000-0000-0000-000000000008', 'Elderly care and companion nursing services.',                         2500.00, 'PER_HOUR',  TRUE),

-- PathLab Diagnostics — Lab Sample Collection
('ps-000000-0000-0000-000000000011', 'provp-0000-0000-0000-000000000006', 'cat-0000-0000-0000-000000000004', 'Home sample collection: FBC, LFT, RFT, lipid panel, HbA1c, and more.', 800.00, 'FIXED',     TRUE),

-- GoodLife Pharmacy — Pharmacy Delivery
('ps-000000-0000-0000-000000000012', 'provp-0000-0000-0000-000000000007', 'cat-0000-0000-0000-000000000005', 'Same-day delivery of prescription and OTC medicines within Nairobi.',   250.00, 'FIXED',     TRUE),

-- Rapid Ambulance — Ambulance
('ps-000000-0000-0000-000000000013', 'provp-0000-0000-0000-000000000008', 'cat-0000-0000-0000-000000000006', 'ALS emergency ambulance with paramedic crew. Greater Nairobi coverage.', 8000.00,'FIXED',    TRUE);

-- =============================================================================
-- SECTION 7: PROVIDER AVAILABILITY (Mon–Fri 08:00–18:00, Sat 08:00–13:00)
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- =============================================================================

INSERT INTO provider_availability (id, provider_id, day_of_week, start_time, end_time, is_active) VALUES
-- Dr. Felix Mutua
('pav-0001-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001', 1, '08:00:00', '18:00:00', TRUE),
('pav-0001-0000-0000-000000000002', 'provp-0000-0000-0000-000000000001', 2, '08:00:00', '18:00:00', TRUE),
('pav-0001-0000-0000-000000000003', 'provp-0000-0000-0000-000000000001', 3, '08:00:00', '18:00:00', TRUE),
('pav-0001-0000-0000-000000000004', 'provp-0000-0000-0000-000000000001', 4, '08:00:00', '18:00:00', TRUE),
('pav-0001-0000-0000-000000000005', 'provp-0000-0000-0000-000000000001', 5, '08:00:00', '18:00:00', TRUE),
('pav-0001-0000-0000-000000000006', 'provp-0000-0000-0000-000000000001', 6, '08:00:00', '13:00:00', TRUE),
-- Dr. Grace Achieng
('pav-0002-0000-0000-000000000001', 'provp-0000-0000-0000-000000000002', 1, '08:00:00', '18:00:00', TRUE),
('pav-0002-0000-0000-000000000002', 'provp-0000-0000-0000-000000000002', 2, '08:00:00', '18:00:00', TRUE),
('pav-0002-0000-0000-000000000003', 'provp-0000-0000-0000-000000000002', 3, '08:00:00', '18:00:00', TRUE),
('pav-0002-0000-0000-000000000004', 'provp-0000-0000-0000-000000000002', 4, '08:00:00', '18:00:00', TRUE),
('pav-0002-0000-0000-000000000005', 'provp-0000-0000-0000-000000000002', 5, '08:00:00', '18:00:00', TRUE),
('pav-0002-0000-0000-000000000006', 'provp-0000-0000-0000-000000000002', 6, '08:00:00', '13:00:00', TRUE),
-- Dr. Hassan Omar
('pav-0003-0000-0000-000000000001', 'provp-0000-0000-0000-000000000003', 1, '09:00:00', '17:00:00', TRUE),
('pav-0003-0000-0000-000000000002', 'provp-0000-0000-0000-000000000003', 2, '09:00:00', '17:00:00', TRUE),
('pav-0003-0000-0000-000000000003', 'provp-0000-0000-0000-000000000003', 3, '09:00:00', '17:00:00', TRUE),
('pav-0003-0000-0000-000000000004', 'provp-0000-0000-0000-000000000003', 4, '09:00:00', '17:00:00', TRUE),
('pav-0003-0000-0000-000000000005', 'provp-0000-0000-0000-000000000003', 5, '09:00:00', '17:00:00', TRUE),
-- Nurse Joan Kariuki
('pav-0004-0000-0000-000000000001', 'provp-0000-0000-0000-000000000004', 1, '07:00:00', '19:00:00', TRUE),
('pav-0004-0000-0000-000000000002', 'provp-0000-0000-0000-000000000004', 2, '07:00:00', '19:00:00', TRUE),
('pav-0004-0000-0000-000000000003', 'provp-0000-0000-0000-000000000004', 3, '07:00:00', '19:00:00', TRUE),
('pav-0004-0000-0000-000000000004', 'provp-0000-0000-0000-000000000004', 4, '07:00:00', '19:00:00', TRUE),
('pav-0004-0000-0000-000000000005', 'provp-0000-0000-0000-000000000004', 5, '07:00:00', '19:00:00', TRUE),
('pav-0004-0000-0000-000000000006', 'provp-0000-0000-0000-000000000004', 6, '08:00:00', '13:00:00', TRUE),
-- Nurse Peter Ndung'u
('pav-0005-0000-0000-000000000001', 'provp-0000-0000-0000-000000000005', 1, '08:00:00', '17:00:00', TRUE),
('pav-0005-0000-0000-000000000002', 'provp-0000-0000-0000-000000000005', 2, '08:00:00', '17:00:00', TRUE),
('pav-0005-0000-0000-000000000003', 'provp-0000-0000-0000-000000000005', 3, '08:00:00', '17:00:00', TRUE),
('pav-0005-0000-0000-000000000004', 'provp-0000-0000-0000-000000000005', 4, '08:00:00', '17:00:00', TRUE),
('pav-0005-0000-0000-000000000005', 'provp-0000-0000-0000-000000000005', 5, '08:00:00', '17:00:00', TRUE),
('pav-0005-0000-0000-000000000006', 'provp-0000-0000-0000-000000000005', 6, '08:00:00', '13:00:00', TRUE),
-- PathLab Diagnostics (Mon–Sat)
('pav-0006-0000-0000-000000000001', 'provp-0000-0000-0000-000000000006', 1, '07:00:00', '17:00:00', TRUE),
('pav-0006-0000-0000-000000000002', 'provp-0000-0000-0000-000000000006', 2, '07:00:00', '17:00:00', TRUE),
('pav-0006-0000-0000-000000000003', 'provp-0000-0000-0000-000000000006', 3, '07:00:00', '17:00:00', TRUE),
('pav-0006-0000-0000-000000000004', 'provp-0000-0000-0000-000000000006', 4, '07:00:00', '17:00:00', TRUE),
('pav-0006-0000-0000-000000000005', 'provp-0000-0000-0000-000000000006', 5, '07:00:00', '17:00:00', TRUE),
('pav-0006-0000-0000-000000000006', 'provp-0000-0000-0000-000000000006', 6, '07:00:00', '12:00:00', TRUE),
-- GoodLife Pharmacy (Mon–Sun)
('pav-0007-0000-0000-000000000001', 'provp-0000-0000-0000-000000000007', 0, '09:00:00', '18:00:00', TRUE),
('pav-0007-0000-0000-000000000002', 'provp-0000-0000-0000-000000000007', 1, '08:00:00', '21:00:00', TRUE),
('pav-0007-0000-0000-000000000003', 'provp-0000-0000-0000-000000000007', 2, '08:00:00', '21:00:00', TRUE),
('pav-0007-0000-0000-000000000004', 'provp-0000-0000-0000-000000000007', 3, '08:00:00', '21:00:00', TRUE),
('pav-0007-0000-0000-000000000005', 'provp-0000-0000-0000-000000000007', 4, '08:00:00', '21:00:00', TRUE),
('pav-0007-0000-0000-000000000006', 'provp-0000-0000-0000-000000000007', 5, '08:00:00', '21:00:00', TRUE),
('pav-0007-0000-0000-000000000007', 'provp-0000-0000-0000-000000000007', 6, '09:00:00', '18:00:00', TRUE),
-- Rapid Ambulance (24/7)
('pav-0008-0000-0000-000000000001', 'provp-0000-0000-0000-000000000008', 0, '00:00:00', '23:59:00', TRUE),
('pav-0008-0000-0000-000000000002', 'provp-0000-0000-0000-000000000008', 1, '00:00:00', '23:59:00', TRUE),
('pav-0008-0000-0000-000000000003', 'provp-0000-0000-0000-000000000008', 2, '00:00:00', '23:59:00', TRUE),
('pav-0008-0000-0000-000000000004', 'provp-0000-0000-0000-000000000008', 3, '00:00:00', '23:59:00', TRUE),
('pav-0008-0000-0000-000000000005', 'provp-0000-0000-0000-000000000008', 4, '00:00:00', '23:59:00', TRUE),
('pav-0008-0000-0000-000000000006', 'provp-0000-0000-0000-000000000008', 5, '00:00:00', '23:59:00', TRUE),
('pav-0008-0000-0000-000000000007', 'provp-0000-0000-0000-000000000008', 6, '00:00:00', '23:59:00', TRUE);

-- =============================================================================
-- SECTION 8: PROVIDER SERVICE AREAS
-- =============================================================================

INSERT INTO provider_service_areas (id, provider_id, area_name, center_latitude, center_longitude, radius_km) VALUES
('psa-0000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001', 'Westlands & Parklands',   -1.2631, 36.8027, 10.00),
('psa-0000-0000-0000-000000000002', 'provp-0000-0000-0000-000000000001', 'Kilimani & Lavington',    -1.2916, 36.7860, 8.00),
('psa-0000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000002', 'Kilimani & Lavington',    -1.2916, 36.7860, 10.00),
('psa-0000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000002', 'Karen & Lang\'ata',       -1.3185, 36.7057, 10.00),
('psa-0000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000003', 'Westlands & Gigiri',      -1.2598, 36.8191, 12.00),
('psa-0000-0000-0000-000000000006', 'provp-0000-0000-0000-000000000004', 'Karen & Ngong Road',      -1.3185, 36.7057, 15.00),
('psa-0000-0000-0000-000000000007', 'provp-0000-0000-0000-000000000005', 'Lang\'ata & Otiende',     -1.3350, 36.7457, 12.00),
('psa-0000-0000-0000-000000000008', 'provp-0000-0000-0000-000000000006', 'Greater Nairobi',         -1.2921, 36.8219, 30.00),
('psa-0000-0000-0000-000000000009', 'provp-0000-0000-0000-000000000007', 'Westlands & Parklands',   -1.2631, 36.8027, 15.00),
('psa-0000-0000-0000-000000000010', 'provp-0000-0000-0000-000000000008', 'Greater Nairobi',         -1.2921, 36.8219, 50.00);

-- =============================================================================
-- SECTION 9: PATIENT ADDRESSES
-- =============================================================================

INSERT INTO patient_addresses (id, patient_user_id, label, address_line, latitude, longitude, is_default) VALUES
('addr-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Home', 'Apartment 4B, Woodlands Estate, Westlands, Nairobi',         -1.2631, 36.8027, TRUE),
('addr-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Home', 'House 12, Karen Hardy, Karen, Nairobi',                       -1.3185, 36.7057, TRUE),
('addr-0000-0000-0000-000000000002b','22222222-0000-0000-0000-000000000002', 'Office','3rd Floor, Westend Towers, Westlands, Nairobi',               -1.2714, 36.8079, FALSE),
('addr-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Home', 'Flat 7A, Kilimani Court, Kilimani, Nairobi',                   -1.2916, 36.7860, TRUE),
('addr-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'Home', '25 Gitanga Road, Lavington, Nairobi',                          -1.2964, 36.7763, TRUE),
('addr-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', 'Home', 'Bungalow 3, Peponi Heights, Parklands, Nairobi',               -1.2598, 36.8191, TRUE);

-- =============================================================================
-- SECTION 10: BOOKINGS  (10 bookings in various statuses)
-- =============================================================================

INSERT INTO bookings (id, patient_user_id, provider_id, category_id, booking_type, status,
                      patient_address_id, patient_latitude, patient_longitude, patient_address_text,
                      scheduled_at, notes, quoted_price, final_price, platform_commission, provider_payout,
                      accepted_at, completed_at, cancelled_at) VALUES

-- 1. COMPLETED — Dr. Felix visited Amina at home
('bk-000000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001',
 'cat-0000-0000-0000-000000000001', 'SCHEDULED', 'COMPLETED',
 'addr-0000-0000-0000-000000000001', -1.2631, 36.8027, 'Apartment 4B, Woodlands Estate, Westlands, Nairobi',
 '2024-09-10 10:00:00', 'Patient has recurring fever. Request blood pressure check.', 3500.00, 3500.00, 525.00, 2975.00,
 '2024-09-09 15:00:00', '2024-09-10 11:30:00', NULL),

-- 2. COMPLETED — Dr. Grace visited Cynthia (paediatric)
('bk-000000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000002',
 'cat-0000-0000-0000-000000000001', 'SCHEDULED', 'COMPLETED',
 'addr-0000-0000-0000-000000000003', -1.2916, 36.7860, 'Flat 7A, Kilimani Court, Kilimani, Nairobi',
 '2024-09-12 09:00:00', 'Child (3 yrs) has high fever and cough for 2 days.', 4000.00, 4000.00, 600.00, 3400.00,
 '2024-09-11 17:00:00', '2024-09-12 10:15:00', NULL),

-- 3. COMPLETED — Nurse Joan for wound care on Brian
('bk-000000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'provp-0000-0000-0000-000000000004',
 'cat-0000-0000-0000-000000000002', 'IMMEDIATE', 'COMPLETED',
 'addr-0000-0000-0000-000000000002', -1.3185, 36.7057, 'House 12, Karen Hardy, Karen, Nairobi',
 NULL, 'Post-surgical wound dressing — knee replacement follow-up.', 2500.00, 2500.00, 375.00, 2125.00,
 '2024-09-15 08:45:00', '2024-09-15 10:30:00', NULL),

-- 4. COMPLETED — PathLab collected samples from David
('bk-000000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000006',
 'cat-0000-0000-0000-000000000004', 'SCHEDULED', 'COMPLETED',
 'addr-0000-0000-0000-000000000004', -1.2964, 36.7763, '25 Gitanga Road, Lavington, Nairobi',
 '2024-09-18 07:30:00', 'Fasting blood draw — HbA1c, FBC, lipid panel.', 800.00, 800.00, 120.00, 680.00,
 '2024-09-17 20:00:00', '2024-09-18 08:00:00', NULL),

-- 5. COMPLETED — GoodLife Pharmacy delivery to Esther
('bk-000000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000007',
 'cat-0000-0000-0000-000000000005', 'IMMEDIATE', 'COMPLETED',
 'addr-0000-0000-0000-000000000005', -1.2598, 36.8191, 'Bungalow 3, Peponi Heights, Parklands, Nairobi',
 NULL, 'Prescription: Metformin 500mg x60, Atorvastatin 20mg x30.', 250.00, 250.00, 37.50, 212.50,
 '2024-09-20 11:00:00', '2024-09-20 12:45:00', NULL),

-- 6. ACCEPTED — Dr. Hassan accepted, upcoming visit for Amina
('bk-000000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000003',
 'cat-0000-0000-0000-000000000001', 'SCHEDULED', 'ACCEPTED',
 'addr-0000-0000-0000-000000000001', -1.2631, 36.8027, 'Apartment 4B, Woodlands Estate, Westlands, Nairobi',
 '2024-10-05 10:00:00', 'Hypertension review. Bring ECG report.', 4500.00, NULL, NULL, NULL,
 '2024-09-25 09:00:00', NULL, NULL),

-- 7. PENDING — Brian requesting nurse visit
('bk-000000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000002', NULL,
 'cat-0000-0000-0000-000000000002', 'IMMEDIATE', 'PENDING',
 'addr-0000-0000-0000-000000000002b', -1.2714, 36.8079, '3rd Floor, Westend Towers, Westlands, Nairobi',
 NULL, 'IV drip administration needed — dehydration.', NULL, NULL, NULL, NULL,
 NULL, NULL, NULL),

-- 8. EN_ROUTE — Rapid Ambulance dispatched to Cynthia
('bk-000000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000008',
 'cat-0000-0000-0000-000000000006', 'IMMEDIATE', 'EN_ROUTE',
 'addr-0000-0000-0000-000000000003', -1.2916, 36.7860, 'Flat 7A, Kilimani Court, Kilimani, Nairobi',
 NULL, 'Patient collapsed — suspected cardiac event.', 8000.00, NULL, NULL, NULL,
 '2024-09-28 14:05:00', NULL, NULL),

-- 9. CANCELLED_BY_PATIENT — David cancelled lab visit
('bk-000000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000006',
 'cat-0000-0000-0000-000000000004', 'SCHEDULED', 'CANCELLED_BY_PATIENT',
 'addr-0000-0000-0000-000000000004', -1.2964, 36.7763, '25 Gitanga Road, Lavington, Nairobi',
 '2024-09-22 07:30:00', NULL, 800.00, NULL, NULL, NULL,
 NULL, NULL, '2024-09-21 18:00:00'),

-- 10. REJECTED — Esther telemedicine request rejected (provider unavailable)
('bk-000000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000001',
 'cat-0000-0000-0000-000000000003', 'SCHEDULED', 'REJECTED',
 NULL, -1.2598, 36.8191, 'Bungalow 3, Peponi Heights, Parklands, Nairobi',
 '2024-09-30 16:00:00', 'Follow-up on prescription renewal.', 1500.00, NULL, NULL, NULL,
 NULL, NULL, '2024-09-29 08:00:00');

-- =============================================================================
-- SECTION 11: BOOKING STATUS HISTORY
-- =============================================================================

INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, notes) VALUES
('bsh-000-0000-0000-000000000001', 'bk-000000-0000-0000-000000000001', NULL,          'PENDING',    '22222222-0000-0000-0000-000000000001', 'Booking created by patient.'),
('bsh-000-0000-0000-000000000002', 'bk-000000-0000-0000-000000000001', 'PENDING',     'ACCEPTED',   '33333333-0000-0000-0000-000000000001', 'Confirmed for 10 Sep 10:00.'),
('bsh-000-0000-0000-000000000003', 'bk-000000-0000-0000-000000000001', 'ACCEPTED',    'IN_PROGRESS','33333333-0000-0000-0000-000000000001', 'Consultation started.'),
('bsh-000-0000-0000-000000000004', 'bk-000000-0000-0000-000000000001', 'IN_PROGRESS', 'COMPLETED',  '33333333-0000-0000-0000-000000000001', 'Visit completed successfully.'),
('bsh-000-0000-0000-000000000005', 'bk-000000-0000-0000-000000000002', NULL,          'PENDING',    '22222222-0000-0000-0000-000000000003', 'Booking created by patient.'),
('bsh-000-0000-0000-000000000006', 'bk-000000-0000-0000-000000000002', 'PENDING',     'ACCEPTED',   '33333333-0000-0000-0000-000000000002', 'Scheduled for 12 Sep 09:00.'),
('bsh-000-0000-0000-000000000007', 'bk-000000-0000-0000-000000000002', 'ACCEPTED',    'IN_PROGRESS','33333333-0000-0000-0000-000000000002', 'Visit in progress.'),
('bsh-000-0000-0000-000000000008', 'bk-000000-0000-0000-000000000002', 'IN_PROGRESS', 'COMPLETED',  '33333333-0000-0000-0000-000000000002', 'Paediatric visit completed.'),
('bsh-000-0000-0000-000000000009', 'bk-000000-0000-0000-000000000008', NULL,          'PENDING',    '22222222-0000-0000-0000-000000000003', 'Emergency booking.'),
('bsh-000-0000-0000-000000000010', 'bk-000000-0000-0000-000000000008', 'PENDING',     'ACCEPTED',   '33333333-0000-0000-0000-000000000008', 'Ambulance dispatched.'),
('bsh-000-0000-0000-000000000011', 'bk-000000-0000-0000-000000000008', 'ACCEPTED',    'EN_ROUTE',   '33333333-0000-0000-0000-000000000008', 'Unit 3 en route — ETA 8 min.'),
('bsh-000-0000-0000-000000000012', 'bk-000000-0000-0000-000000000009', NULL,          'PENDING',    '22222222-0000-0000-0000-000000000004', 'Lab booking created.'),
('bsh-000-0000-0000-000000000013', 'bk-000000-0000-0000-000000000009', 'PENDING',     'ACCEPTED',   '33333333-0000-0000-0000-000000000006', 'Confirmed for 22 Sep.'),
('bsh-000-0000-0000-000000000014', 'bk-000000-0000-0000-000000000009', 'ACCEPTED',    'CANCELLED_BY_PATIENT','22222222-0000-0000-0000-000000000004', 'Patient cancelled — rescheduling.'),
('bsh-000-0000-0000-000000000015', 'bk-000000-0000-0000-000000000010', NULL,          'PENDING',    '22222222-0000-0000-0000-000000000005', 'Telemedicine request.'),
('bsh-000-0000-0000-000000000016', 'bk-000000-0000-0000-000000000010', 'PENDING',     'REJECTED',   '33333333-0000-0000-0000-000000000001', 'Provider at capacity for this slot.');

-- =============================================================================
-- SECTION 12: PROVIDER LOCATIONS (real-time last known positions)
-- =============================================================================

INSERT INTO provider_locations (id, provider_id, latitude, longitude) VALUES
('pl-000000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001', -1.2714, 36.8079),
('pl-000000-0000-0000-000000000002', 'provp-0000-0000-0000-000000000002', -1.2916, 36.7860),
('pl-000000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000004', -1.3085, 36.7200),
('pl-000000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000006', -1.2841, 36.8155),
('pl-000000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000007', -1.2631, 36.8027),
('pl-000000-0000-0000-000000000006', 'provp-0000-0000-0000-000000000008', -1.2921, 36.8219);

-- =============================================================================
-- SECTION 13: PAYMENTS (5 completed payments for the 5 completed bookings)
-- =============================================================================

INSERT INTO payments (id, booking_id, patient_user_id, amount, currency, payment_method, status,
                      gateway_reference, idempotency_key, paid_at) VALUES
('pay-0000-0000-0000-000000000001', 'bk-000000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
 3500.00, 'KES', 'MPESA', 'COMPLETED',
 'ws_CO_100920241011001234', 'idem-0000-0000-0000-000000000001', '2024-09-10 11:45:00'),

('pay-0000-0000-0000-000000000002', 'bk-000000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003',
 4000.00, 'KES', 'MPESA', 'COMPLETED',
 'ws_CO_120920241022005678', 'idem-0000-0000-0000-000000000002', '2024-09-12 10:30:00'),

('pay-0000-0000-0000-000000000003', 'bk-000000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002',
 2500.00, 'KES', 'CASH', 'COMPLETED',
 NULL, 'idem-0000-0000-0000-000000000003', '2024-09-15 10:35:00'),

('pay-0000-0000-0000-000000000004', 'bk-000000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004',
 800.00, 'KES', 'MPESA', 'COMPLETED',
 'ws_CO_180920240733009999', 'idem-0000-0000-0000-000000000004', '2024-09-18 08:05:00'),

('pay-0000-0000-0000-000000000005', 'bk-000000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005',
 250.00, 'KES', 'MPESA', 'COMPLETED',
 'ws_CO_200920241100011122', 'idem-0000-0000-0000-000000000005', '2024-09-20 12:50:00');

-- =============================================================================
-- SECTION 14: REVIEWS (5 reviews for 5 completed bookings)
-- =============================================================================

INSERT INTO reviews (id, booking_id, patient_user_id, provider_id, rating, comment, is_visible) VALUES
('rev-0000-0000-0000-000000000001', 'bk-000000-0000-0000-000000000001',
 '22222222-0000-0000-0000-000000000001', 'provp-0000-0000-0000-000000000001', 5,
 'Dr. Mutua was punctual, thorough, and very professional. He explained everything clearly. Highly recommended!', TRUE),

('rev-0000-0000-0000-000000000002', 'bk-000000-0000-0000-000000000002',
 '22222222-0000-0000-0000-000000000003', 'provp-0000-0000-0000-000000000002', 5,
 'Dr. Grace is wonderful with children. My daughter was at ease immediately. Excellent diagnosis and prescription.', TRUE),

('rev-0000-0000-0000-000000000003', 'bk-000000-0000-0000-000000000003',
 '22222222-0000-0000-0000-000000000002', 'provp-0000-0000-0000-000000000004', 5,
 'Nurse Joan was incredibly skilled and gentle. My wound is healing perfectly. Will book again without hesitation.', TRUE),

('rev-0000-0000-0000-000000000004', 'bk-000000-0000-0000-000000000004',
 '22222222-0000-0000-0000-000000000004', 'provp-0000-0000-0000-000000000006', 4,
 'PathLab technician arrived on time. Sample collection was quick and painless. Results were ready within 20 hours.', TRUE),

('rev-0000-0000-0000-000000000005', 'bk-000000-0000-0000-000000000005',
 '22222222-0000-0000-0000-000000000005', 'provp-0000-0000-0000-000000000007', 4,
 'Fast delivery and correct medication. The rider was polite. Would have given 5 stars but packaging was slightly damaged.', TRUE);

-- Update provider rating aggregates to match seed reviews
UPDATE provider_profiles SET average_rating = 4.80, total_reviews = 120 WHERE id = 'provp-0000-0000-0000-000000000001';
UPDATE provider_profiles SET average_rating = 4.90, total_reviews = 85  WHERE id = 'provp-0000-0000-0000-000000000002';
UPDATE provider_profiles SET average_rating = 4.85, total_reviews = 47  WHERE id = 'provp-0000-0000-0000-000000000004';
UPDATE provider_profiles SET average_rating = 4.75, total_reviews = 98  WHERE id = 'provp-0000-0000-0000-000000000006';
UPDATE provider_profiles SET average_rating = 4.55, total_reviews = 72  WHERE id = 'provp-0000-0000-0000-000000000007';

-- =============================================================================
-- SECTION 15: NOTIFICATIONS
-- =============================================================================

INSERT INTO notifications (id, user_id, type, title, body, data, is_read) VALUES
('notif-000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
 'BOOKING_CONFIRMED', 'Booking Confirmed',
 'Dr. Felix Mutua has confirmed your home visit on 10 Sep at 10:00 AM.',
 '{"booking_id":"bk-000000-0000-0000-000000000001"}', TRUE),

('notif-000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
 'BOOKING_COMPLETED', 'Visit Completed',
 'Your home visit with Dr. Felix Mutua has been completed. Please leave a review!',
 '{"booking_id":"bk-000000-0000-0000-000000000001"}', TRUE),

('notif-000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002',
 'BOOKING_PENDING', 'Nurse Request Sent',
 'Your request for a nurse visit has been submitted. A nurse will accept shortly.',
 '{"booking_id":"bk-000000-0000-0000-000000000007"}', FALSE),

('notif-000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000003',
 'PROVIDER_EN_ROUTE', 'Ambulance En Route',
 'Rapid Ambulance is on the way. Estimated arrival in 8 minutes.',
 '{"booking_id":"bk-000000-0000-0000-000000000008","eta_minutes":8}', FALSE),

('notif-000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005',
 'BOOKING_REJECTED', 'Booking Not Available',
 'Unfortunately Dr. Felix Mutua is unavailable for your selected slot. Please try another time.',
 '{"booking_id":"bk-000000-0000-0000-000000000010"}', TRUE);

-- =============================================================================
-- SECTION 16: PLATFORM SETTINGS
-- =============================================================================

INSERT INTO platform_settings (id, `key`, value, description, updated_by_user_id) VALUES
('pset-000-0000-0000-000000000001', 'commission_rate',                 '0.15', 'Platform commission as a decimal fraction (15%).',                                               '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000002', 'default_search_radius_km',        '20',   'Default radius in kilometres for provider search queries.',                                      '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000003', 'min_booking_notice_minutes',      '30',   'Minimum advance notice (in minutes) required for SCHEDULED bookings.',                          '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000004', 'max_active_bookings_per_patient', '3',    'Maximum number of active (non-terminal) bookings a patient may hold at once.',                  '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000005', 'booking_expiry_minutes',          '15',   'Minutes after creation that a PENDING IMMEDIATE booking auto-expires if unaccepted.',           '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000006', 'mpesa_shortcode',                 '174379','Safaricom M-Pesa Lipa Na M-Pesa shortcode (sandbox). Override with production value.',         '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000007', 'support_email',                   'support@mediconnect.ke','Primary support contact email displayed in the app.','11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000008', 'support_phone',                   '+254700000002','Primary support WhatsApp/phone number displayed in the app.','11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000009', 'app_version_android_min',         '1.0.0','Minimum Android app version allowed to connect to the API.',                                    '11111111-0000-0000-0000-000000000001'),
('pset-000-0000-0000-000000000010', 'app_version_ios_min',             '1.0.0','Minimum iOS app version allowed to connect to the API.',                                        '11111111-0000-0000-0000-000000000001');

-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
