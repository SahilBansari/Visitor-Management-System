-- VMS Database Backup
-- Timestamp: 2026-01-22T15:25:45.202Z


-- ========== APPOINTMENT_STATUS ==========
DROP TABLE IF EXISTS appointment_status;
CREATE TABLE `appointment_status` (
  `appointment_status_id` int NOT NULL AUTO_INCREMENT,
  `appointment_status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`appointment_status_id`),
  UNIQUE KEY `appointment_status_name` (`appointment_status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table appointment_status
INSERT INTO appointment_status (appointment_status_id, appointment_status_name) VALUES (2, 'approved');
INSERT INTO appointment_status (appointment_status_id, appointment_status_name) VALUES (4, 'completed');
INSERT INTO appointment_status (appointment_status_id, appointment_status_name) VALUES (1, 'pending');
INSERT INTO appointment_status (appointment_status_id, appointment_status_name) VALUES (3, 'rejected');


-- ========== APPOINTMENTS ==========
DROP TABLE IF EXISTS appointments;
CREATE TABLE `appointments` (
  `appointments_id` int NOT NULL AUTO_INCREMENT,
  `visitor_id` int NOT NULL,
  `officer_id` int DEFAULT NULL,
  `office_id` int DEFAULT NULL,
  `purpose_id` int DEFAULT NULL,
  `appointment_visit_date` date DEFAULT NULL,
  `appointments_time_slot` int DEFAULT NULL,
  `number_of_visitors` int DEFAULT '1',
  `appointment_status_id` int DEFAULT NULL,
  `appointment_created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `appointment_updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointments_id`),
  KEY `visitor_id` (`visitor_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`visitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table appointments
INSERT INTO appointments (appointments_id, visitor_id, officer_id, office_id, purpose_id, appointment_visit_date, appointments_time_slot, number_of_visitors, appointment_status_id, appointment_created_time, appointment_updated_time) VALUES (1, 1, 1, 1, 1, '2026-01-21T18:30:00.000Z', 7, 4, 1, '2026-01-22T15:20:12.000Z', '2026-01-22T15:20:12.000Z');


-- ========== AUDIT_LOGS ==========
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE `audit_logs` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) DEFAULT NULL,
  `activity` varchar(255) DEFAULT NULL,
  `description` text,
  `status` varchar(50) DEFAULT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ========== OFFICER_STATUS ==========
DROP TABLE IF EXISTS officer_status;
CREATE TABLE `officer_status` (
  `officer_status_id` int NOT NULL AUTO_INCREMENT,
  `officer_status_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`officer_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ========== OFFICERS ==========
DROP TABLE IF EXISTS officers;
CREATE TABLE `officers` (
  `officers_id` int NOT NULL AUTO_INCREMENT,
  `officer_name` varchar(255) DEFAULT NULL,
  `officer_designation` varchar(100) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `officer_status_id` int DEFAULT NULL,
  PRIMARY KEY (`officers_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `officers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table officers
INSERT INTO officers (officers_id, officer_name, officer_designation, user_id, officer_status_id) VALUES (1, 'Rajesh Kumar', 'Chief Engineer', 2, 1);


-- ========== OFFICES ==========
DROP TABLE IF EXISTS offices;
CREATE TABLE `offices` (
  `offices_id` int NOT NULL AUTO_INCREMENT,
  `office_name` varchar(255) DEFAULT NULL,
  `office_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`offices_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table offices
INSERT INTO offices (offices_id, office_name, office_address) VALUES (1, 'Irrigation Dept. HQ', NULL);


-- ========== ROLES ==========
DROP TABLE IF EXISTS roles;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table roles
INSERT INTO roles (role_id, role_name) VALUES (1, 'Admin');
INSERT INTO roles (role_id, role_name) VALUES (3, 'Clerk');
INSERT INTO roles (role_id, role_name) VALUES (2, 'HOD');
INSERT INTO roles (role_id, role_name) VALUES (4, 'Officer');
INSERT INTO roles (role_id, role_name) VALUES (5, 'Viewer');


-- ========== TIME_SLOTS ==========
DROP TABLE IF EXISTS time_slots;
CREATE TABLE `time_slots` (
  `time_slots_id` int NOT NULL AUTO_INCREMENT,
  `time_slots_start_time` time DEFAULT NULL,
  `time_slots_end_time` time DEFAULT NULL,
  `time_slots_max_capacity` int DEFAULT '10',
  PRIMARY KEY (`time_slots_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table time_slots
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (1, '09:00:00', '09:30:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (2, '09:30:00', '10:00:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (3, '10:00:00', '10:30:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (4, '10:30:00', '11:00:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (5, '11:00:00', '11:30:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (6, '11:30:00', '12:00:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (7, '14:00:00', '14:30:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (8, '14:30:00', '15:00:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (9, '15:00:00', '15:30:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (10, '15:30:00', '16:00:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (11, '16:00:00', '16:30:00', 10);
INSERT INTO time_slots (time_slots_id, time_slots_start_time, time_slots_end_time, time_slots_max_capacity) VALUES (12, '16:30:00', '17:00:00', 10);


-- ========== USER_ROLES ==========
DROP TABLE IF EXISTS user_roles;
CREATE TABLE `user_roles` (
  `user_role_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_role_id`),
  KEY `user_id` (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table user_roles
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES (1, 1, 1);
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES (2, 2, 2);
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES (3, 3, 3);
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES (4, 1, 1);
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES (5, 2, 2);
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES (6, 3, 3);


-- ========== USERS ==========
DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_mobile` varchar(20) DEFAULT NULL,
  `designation_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table users
INSERT INTO users (user_id, user_email, password_hash, user_mobile, designation_id, created_at) VALUES (1, 'admin@nic.in', 'admin', '9876543210', NULL, '2026-01-22T15:17:53.000Z');
INSERT INTO users (user_id, user_email, password_hash, user_mobile, designation_id, created_at) VALUES (2, 'hod@nic.in', 'hod', '9876543211', NULL, '2026-01-22T15:17:53.000Z');
INSERT INTO users (user_id, user_email, password_hash, user_mobile, designation_id, created_at) VALUES (3, 'clerk@nic.in', 'clerk', '9876543212', NULL, '2026-01-22T15:17:53.000Z');


-- ========== VISITOR_REQUESTS ==========
DROP TABLE IF EXISTS visitor_requests;
CREATE TABLE `visitor_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `visitor_id` int DEFAULT NULL,
  `visitor_name` varchar(255) NOT NULL,
  `visitor_type` enum('Visitor','Vendor','Officer') DEFAULT 'Visitor',
  `mobile_number` varchar(20) NOT NULL,
  `pass_id` varchar(50) NOT NULL,
  `host_name` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `visit_date` date NOT NULL,
  `visit_start_time` time NOT NULL,
  `visit_end_time` time NOT NULL,
  `number_of_visitors` int DEFAULT '1',
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `pass_id` (`pass_id`),
  KEY `visitor_id` (`visitor_id`),
  CONSTRAINT `visitor_requests_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`visitor_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table visitor_requests
INSERT INTO visitor_requests (request_id, visitor_id, visitor_name, visitor_type, mobile_number, pass_id, host_name, department, visit_date, visit_start_time, visit_end_time, number_of_visitors, status, created_at, updated_at) VALUES (1, 1, 'Harshal Chavan ', 'Visitor', '9834890983', 'PASS95212846FFB441', 'Shri Narendra Modi', 'Ministry of Home Affairs', '2026-01-21T18:30:00.000Z', '14:00:00', '14:30:00', 4, 'PENDING', '2026-01-22T15:20:12.000Z', '2026-01-22T15:20:12.000Z');


-- ========== VISITORS ==========
DROP TABLE IF EXISTS visitors;
CREATE TABLE `visitors` (
  `visitor_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `visitor_mobile_no` varchar(20) DEFAULT NULL,
  `visitor_email` varchar(255) DEFAULT NULL,
  `visitor_photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`visitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table visitors
INSERT INTO visitors (visitor_id, full_name, visitor_mobile_no, visitor_email, visitor_photo_url, created_at) VALUES (1, 'Harshal Chavan ', '9834890983', '9834890983@visitor.vms', NULL, '2026-01-22T15:20:12.000Z');

