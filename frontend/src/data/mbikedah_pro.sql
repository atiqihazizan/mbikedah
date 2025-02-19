# Host: localhost  (Version 8.0.39)
# Date: 2025-02-18 23:42:40
# Generator: MySQL-Front 6.0  (Build 2.20)


#
# Structure for table "billing_detail"
#

DROP TABLE IF EXISTS `billing_detail`;
CREATE TABLE `billing_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billing_id` int NOT NULL,
  `budget` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `ref` varchar(50) NOT NULL,
  `qty` int NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `billing_id` (`billing_id`),
  CONSTRAINT `billing_detail_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `billing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#
# Data for table "billing_detail"
#

INSERT INTO `billing_detail` VALUES (1,1,'Labor','Project Management','LBR001',2,1000.00,2000.00),(2,1,'Materials','Building Materials','MTL001',3,1000.00,3000.00),(3,2,'Consulting','Software Development','CS001',1,3000.00,3000.00);

#
# Structure for table "billing_status"
#

DROP TABLE IF EXISTS `billing_status`;
CREATE TABLE `billing_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#
# Data for table "billing_status"
#

INSERT INTO `billing_status` VALUES (1,'Draft'),(2,'Approval by Ketua Jabatan'),(3,'Finance Review'),(4,'Finance Approval'),(5,'Approved'),(6,'Rejected'),(7,'Paid');

#
# Structure for table "billing_type"
#

DROP TABLE IF EXISTS `billing_type`;
CREATE TABLE `billing_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#
# Data for table "billing_type"
#

INSERT INTO `billing_type` VALUES (1,'Regular'),(2,'Urgent');

#
# Structure for table "payment_type"
#

DROP TABLE IF EXISTS `payment_type`;
CREATE TABLE `payment_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#
# Data for table "payment_type"
#

INSERT INTO `payment_type` VALUES (1,'Bank Transfer','Pembayaran dilakukan melalui transfer bank','2025-02-18 23:18:46','2025-02-18 23:18:46'),(2,'Cash','Pembayaran tunai langsung di tempat','2025-02-18 23:18:46','2025-02-18 23:18:46');

#
# Structure for table "billing"
#

DROP TABLE IF EXISTS `billing`;
CREATE TABLE `billing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_at` date NOT NULL,
  `no_project` varchar(50) NOT NULL,
  `issue_to` varchar(50) NOT NULL,
  `issue_desc` text NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `payment_type` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `billing_status_id` int NOT NULL,
  `billing_type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `billing_status_id` (`billing_status_id`),
  KEY `billing_type_id` (`billing_type_id`),
  KEY `payment_type` (`payment_type`),
  CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`billing_status_id`) REFERENCES `billing_status` (`id`),
  CONSTRAINT `billing_ibfk_2` FOREIGN KEY (`billing_type_id`) REFERENCES `billing_type` (`id`),
  CONSTRAINT `billing_ibfk_3` FOREIGN KEY (`payment_type`) REFERENCES `payment_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#
# Data for table "billing"
#

INSERT INTO `billing` VALUES (1,'2025-02-18','P12345','PT ABC','Biaya layanan pengembangan perangkat lunak',1000000.00,0,1,'2025-02-18 23:21:59','2025-02-18 23:26:55',1,2),(2,'2025-02-18','P67890','PT XYZ','Pembayaran untuk pemeliharaan aplikasi',500000.00,1,2,'2025-02-18 23:21:59','2025-02-18 23:26:57',2,1);

#
# Structure for table "zbilling1"
#

DROP TABLE IF EXISTS `zbilling1`;
CREATE TABLE `zbilling1` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_at` date NOT NULL,
  `no_project` varchar(50) NOT NULL,
  `issue_to` varchar(50) NOT NULL,
  `issue_desc` text NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `payment_type` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `billing_status_id` int NOT NULL,
  `billing_type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `billing_status_id` (`billing_status_id`),
  KEY `billing_type_id` (`billing_type_id`),
  CONSTRAINT `zbilling1_ibfk_1` FOREIGN KEY (`billing_status_id`) REFERENCES `billing_status` (`id`),
  CONSTRAINT `zbilling1_ibfk_2` FOREIGN KEY (`billing_type_id`) REFERENCES `billing_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#
# Data for table "zbilling1"
#

INSERT INTO `zbilling1` VALUES (1,'2025-02-18','PRJ001','Company A','Project description for PRJ001',5000.00,1,0,'2025-02-18 23:14:02','2025-02-18 23:14:02',1,1),(2,'2025-02-18','PRJ002','Company B','Project description for PRJ002',3000.00,0,1,'2025-02-18 23:14:02','2025-02-18 23:14:02',3,2);
