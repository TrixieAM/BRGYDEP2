-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 07, 2026 at 07:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `brgy145`
--

-- --------------------------------------------------------

--
-- Table structure for table `barangay_clearance`
--

CREATE TABLE `barangay_clearance` (
  `barangay_clearance_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `barangay_clearance`
--

INSERT INTO `barangay_clearance` (`barangay_clearance_id`, `resident_id`, `transactionNum`, `full_name`, `address`, `provincial_address`, `dob`, `age`, `civil_status`, `contact_no`, `request_reason`, `remarks`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `signature_id`) VALUES
(0, 6, '', 'Lyra Borling', '29 St', 'MetroManila', '2000-01-28', 25, 'Single', '09276121723', 'sdsadsa', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2025-12-10', 'BC-251210-428100', 1, '2025-12-10 04:07:12', '2025-12-10 04:07:12', 0, NULL),
(0, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'esign', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2026-01-06', 'BC-260106-555100', 1, '2026-01-06 12:42:02', '2026-01-06 12:42:02', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `bhert_certificate_normal`
--

CREATE TABLE `bhert_certificate_normal` (
  `bhert_certificate_normal_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `requestor` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bhert_certificate_normal`
--

INSERT INTO `bhert_certificate_normal` (`bhert_certificate_normal_id`, `resident_id`, `full_name`, `address`, `requestor`, `purpose`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `secretary_signature_id`, `captain_signature_id`) VALUES
(1, 8, 'Trixie Ann G. Morales', 'Sampaloc, Manila', 'St. Peter Chapel', 'Hospitall', '2025-11-07', 'BCN-251107-540100', 0, '2025-11-07 22:32:34', '2026-01-07 08:04:15', 0, NULL, NULL),
(2, 8, 'Trixie Ann G. Morales', 'Sampaloc, Manila', 'St. Peter Chapel', 'Hospitall', '2025-11-07', 'BHERT-260107080415-514', 1, '2026-01-07 08:04:15', '2026-01-07 08:04:15', 1, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `bhert_certificate_positive`
--

CREATE TABLE `bhert_certificate_positive` (
  `bhert_certificate_positive_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `request_reason` text NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bhert_certificate_positive`
--

INSERT INTO `bhert_certificate_positive` (`bhert_certificate_positive_id`, `resident_id`, `full_name`, `address`, `request_reason`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `secretary_signature_id`, `captain_signature_id`) VALUES
(1, 7, 'Hanna N. Sarabia', '123 General Tirona St', 'sample', '2025-10-24', 'BHERT-251024-504511', 1, '2025-10-24 23:23:23', '2025-11-09 16:28:32', 0, NULL, NULL),
(2, 8, 'Trixie Ann G. Morales', 'Sampaloc, Manila', 'dkk', '2025-11-09', 'BHERT-251109-717100', 1, '2025-11-09 16:30:06', '2025-11-09 17:31:44', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `business_clearance`
--

CREATE TABLE `business_clearance` (
  `business_clearance_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `nature_of_business` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` text NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_clearance`
--

INSERT INTO `business_clearance` (`business_clearance_id`, `resident_id`, `full_name`, `nature_of_business`, `address`, `date_issued`, `date_expired`, `remarks`, `request_reason`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `signature_id`) VALUES
(1, 8, 'Trixie Ann G. Morales', 'House Renovation', 'Sampaloc, Manila', '2025-11-07', '2026-11-07', 'They are operating under the jurisdiction of our Brgy. 145, being issued under the requirement of the New Local Code under Republic Act 7160 for securing their permit.', 'Local Employment', 'BUS-251107-51100', 0, '2025-11-07 23:23:37', '2025-11-07 23:24:14', 0, NULL),
(2, 7, 'Hanna N. Sarabia', 'House Renovation', '123 General Tirona St', '2025-11-07', '2026-11-07', 'They are operating under the jurisdiction of our Brgy. 145, being issued under the requirement of the New Local Code under Republic Act 7160 for securing their permit.', 'Local Employment', 'BUS-251107-426100', 1, '2025-11-07 23:25:35', '2025-11-09 16:48:27', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cash_assistance`
--

CREATE TABLE `cash_assistance` (
  `cash_assistance_id` int(11) NOT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `since_year` year(4) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_assistance`
--

INSERT INTO `cash_assistance` (`cash_assistance_id`, `resident_id`, `full_name`, `since_year`, `address`, `request_reason`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `secretary_signature_id`, `captain_signature_id`) VALUES
(1, 6, 'Lyra Borling', '2025', '29 St', 'samplee', '2025-10-24', 'CA-251024-399691', 0, '2025-10-24 17:27:05', '2026-01-07 01:16:59', 0, NULL, NULL),
(2, 6, 'Lyra Borling', '2025', '29 St', 'esign', '2025-10-24', 'CA-260107011659-193', 0, '2026-01-07 01:16:59', '2026-01-07 10:06:21', 1, NULL, NULL),
(3, 6, 'Lyra Borling', '2025', '29 St', 'esign', '2025-10-24', 'CA-260107100621-344', 1, '2026-01-07 10:06:21', '2026-01-07 10:06:21', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `certificate_id` int(11) NOT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `reason` text DEFAULT NULL,
  `validity_period` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `timestap` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`certificate_id`, `resident_id`, `full_name`, `certificate_type`, `reason`, `validity_period`, `date_issued`, `timestap`) VALUES
(1, 8, 'Trixie Ann G. Morales', 'Barangay Clearance', 'hahahaaaaa', '6 months', '2025-11-08', '2025-11-08 13:05:19'),
(2, 7, 'Hanna N. Sarabia', 'Barangay Clearance', 'hehhehaa', '6 months', '2025-11-08', '2025-11-08 13:05:53'),
(9, 1, 'Moneque Sazon', 'Barangay Indigency', 'changetest', '6 months', '2025-11-08', '2025-11-08 13:52:07'),
(10, 6, 'Lyra Borling', 'Barangay Indigency', 'Wala lang', '6 months', '2025-11-08', '2025-11-08 13:53:29'),
(11, 6, 'Lyra Borling', 'Barangay Indigency', 'fsfsdaa', '6 months', '2025-10-14', '2025-11-08 13:53:32'),
(12, 8, 'Trixie Ann G. Morales', 'Barangay Indigency', 'dasaaa', '6 months', '2025-10-14', '2025-11-08 13:53:36'),
(13, 8, 'Trixie Ann G. Morales', 'BHERT Certificate Normal', 'Hospitall', '1 year', '2025-11-07', '2025-11-08 14:12:02'),
(14, 7, 'Hanna N. Sarabia', 'BHERT Certificate Positive', 'sample', '6 months', '2025-10-24', '2025-11-09 08:28:32'),
(15, 8, 'Trixie Ann G. Morales', 'BHERT Certificate Positive', 'dkk', '6 months', '2025-11-09', '2025-11-09 08:30:06'),
(16, 7, 'Hanna N. Sarabia', 'Business Clearance', 'Local Employment', '1 year', '2025-11-07', '2025-11-09 08:48:27'),
(17, 6, 'Lyra Borling', 'Cash Assistance', 'esign', '6 months', '2025-10-24', '2025-11-09 08:51:35'),
(18, 7, 'Hanna N. Sarabia', 'Certificate of Residency', 'heheh', '6 months', '2025-10-18', '2025-11-09 08:54:07'),
(26, 8, 'Trixie Ann G. Morales', 'Certificate of Action', 'Unsettled Money Matter', '6 months', '2025-11-08', '2025-11-09 10:18:03'),
(27, 7, 'Hanna N. Sarabia', 'Certificate of Action', 'testt', '6 months', '2025-11-09', '2025-11-09 10:19:03'),
(28, 8, 'Trixie Ann G. Morales', 'Certificate of Action', 'SSSS', '6 months', '2025-11-09', '2025-11-09 10:32:02'),
(39, 8, 'Trixie Ann G. Morales & Hanna N. Sarabia', 'Cohabitation', 'Cohabitation', '1 year', '2025-10-31', '2025-11-09 11:54:44'),
(40, 6, 'Lyra Borling & Moneque Sazon', 'Cohabitation', 'Cohabitation', '1 year', '2025-11-09', '2025-11-09 11:55:11'),
(41, 7, 'Hanna N. Sarabia', 'Financial Assistance', 'Sample', '6 months', '2025-10-24', '2025-11-09 11:59:41'),
(42, 1, 'Moneque Sazon', 'Permit to Travel', 'hehehea', '6 months', '2025-10-18', '2025-11-09 12:04:31'),
(43, 8, 'Trixie Ann G. Morales', 'Solo Parent', 'Solo Parent', '6 months', '2025-10-31', '2025-11-09 18:41:21'),
(44, 6, 'Lyra Borling', 'Solo Parent', 'Solo Parent', '6 months', '2025-11-09', '2025-11-09 19:29:40'),
(45, 7, 'Hanna N. Sarabia', 'Permit to Travel', 'testt', '6 months', '2025-11-10', '2025-11-10 07:00:31'),
(47, 1, 'Moneque Sazon', 'Solo Parent', 'Solo Parent', '6 months', '2025-11-09', '2025-11-10 07:18:28'),
(48, 7, 'Hanna N. Sarabia', 'Solo Parent', 'Solo Parent', '6 months', '2025-11-09', '2025-11-10 07:18:38'),
(49, 8, 'Trixie Ann G. Morales', 'Oath of Undertaking Job Seeker', 'Job Application', '1 year', '2025-11-08', '2025-11-10 07:35:18'),
(50, 7, 'Hanna N. Sarabia', 'Oath of Undertaking Job Seeker', 'Job Application', '1 year', '2025-11-09', '2025-11-10 07:36:07'),
(51, 8, 'Trixie Ann G. Morales', 'Oath of Undertaking Job Seeker', 'Job Application', '1 year', '2025-11-03', '2025-11-10 07:36:15'),
(52, 8, 'Trixie Ann G. Morales', 'Certificate of Action', 'gdfgdf', '6 months', '2025-12-09', '2025-12-09 08:01:04'),
(53, 7, 'Hanna N. Sarabia', 'Barangay Indigency', 'dasdasdas', '6 months', '2025-12-10', '2025-12-10 00:59:07'),
(54, 7, 'Hanna N. Sarabia', 'Barangay Indigency', 'dasdas', '6 months', '2025-12-10', '2025-12-10 00:59:26'),
(55, 7, 'Hanna N. Sarabia', 'Barangay Indigency', 'fdgdg', '6 months', '2025-12-10', '2025-12-10 01:35:48'),
(56, 8, 'Trixie Ann G. Morales', 'Certificate of Action', 'fsdfdfsd', '6 months', '2025-12-10', '2025-12-10 02:25:35'),
(57, 6, 'Lyra Borling', 'Barangay Clearance', 'sdsadsa', '6 months', '2025-12-10', '2025-12-10 04:07:12'),
(58, 7, 'Hanna N. Sarabia', 'Certificate of Action', 'BOBO KASI SHA', '6 months', '2025-12-10', '2025-12-10 04:26:30'),
(59, 6, 'Lyra Borling', 'Permit to Travel', 'hdshdhshdhd', '6 months', '2025-12-10', '2025-12-10 04:53:29'),
(60, 1, 'Moneque Sazon', 'Certificate of Action', 'asdd', '6 months', '2026-01-06', '2026-01-06 11:38:10'),
(61, 1, 'Moneque Sazon', 'Barangay Indigency', 'guamana ka', '6 months', '2026-01-06', '2026-01-06 11:51:51'),
(62, 1, 'Moneque Sazon', 'Barangay Clearance', 'esign', '6 months', '2026-01-06', '2026-01-06 12:42:02'),
(63, 1, 'Moneque Sazon', 'Oath of Undertaking Job Seeker', 'Job Application', '1 year', '2026-01-06', '2026-01-06 13:44:25'),
(64, 1, 'Moneque Sazon', 'Oath of Undertaking Job Seeker', 'Job Application', '1 year', '2026-01-07', '2026-01-07 02:11:28');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_of_action`
--

CREATE TABLE `certificate_of_action` (
  `certificate_of_action_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `complainant_name` varchar(255) NOT NULL,
  `respondent_name` varchar(255) NOT NULL,
  `barangay_case_no` varchar(50) NOT NULL,
  `request_reason` text NOT NULL,
  `filed_date` date NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_of_action`
--

INSERT INTO `certificate_of_action` (`certificate_of_action_id`, `resident_id`, `complainant_name`, `respondent_name`, `barangay_case_no`, `request_reason`, `filed_date`, `date_issued`, `transaction_number`, `use_signature`, `signature_id`, `is_active`, `date_created`, `date_updated`) VALUES
(1, 8, 'Trixie Ann G. Morales', 'Juan Dela Cruz', '2025-1111', 'Unsettled Money Matter', '2025-08-19', '2025-11-08', 'COA-251025-934030', 0, NULL, 1, '2025-10-25 00:34:25', '2025-11-09 18:33:20'),
(3, 7, 'Hanna N. Sarabia', 'test', '1234', 'testt', '2025-11-09', '2025-11-09', 'COA-251109-569362', 0, NULL, 0, '2025-11-09 17:15:38', '2025-11-09 18:33:48'),
(4, 8, 'Trixie Ann G. Morales', 'HEHEHEHE', '1234', 'SSSS', '2025-12-10', '2025-12-10', 'CACT-251210105156-527', 0, NULL, 0, '2025-11-09 18:32:02', '2025-12-10 10:55:49'),
(5, 8, 'Trixie Ann G. Morales', 'fsdf', 'gdfgf', 'gdfgdf', '2025-12-09', '2025-12-09', 'COA-251209-764074', 0, NULL, 0, '2025-12-09 16:01:04', '2025-12-10 10:20:36'),
(6, 8, 'Trixie Ann G. Morales', 'HEHEHEHEsdfsdfs', '1234', 'fsdfdfsd', '2025-12-10', '2025-12-10', 'CACT-251210105549-108', 0, NULL, 1, '2025-12-10 10:55:49', '2025-12-10 10:55:49'),
(7, 7, 'Hanna N. Sarabia', 'Trixie Ann Morales', '20134507', 'BOBO KASI SHA', '2025-12-10', '2025-12-10', 'COA-251210-392714', 0, NULL, 1, '2025-12-10 12:26:30', '2025-12-10 12:26:30'),
(8, 1, 'Moneque Sazon', 'qwe', '3455', 'asd', '2026-01-06', '2026-01-06', 'COA-260106-174063', 1, 1, 0, '2026-01-06 19:38:09', '2026-01-06 19:39:48'),
(9, 1, 'Moneque Sazon', 'qwe', '3455', 'asdd', '2026-01-06', '2026-01-06', 'CACT-260106193948-773', 1, 1, 1, '2026-01-06 19:39:48', '2026-01-06 19:39:48');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_of_cohabitation`
--

CREATE TABLE `certificate_of_cohabitation` (
  `certificate_of_cohabitation_id` int(11) NOT NULL,
  `resident1_id` int(11) NOT NULL,
  `resident2_id` int(11) NOT NULL,
  `full_name1` varchar(255) NOT NULL,
  `dob1` date NOT NULL,
  `full_name2` varchar(255) NOT NULL,
  `dob2` date NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_started` year(4) NOT NULL,
  `date_issued` date NOT NULL,
  `witness1_name` varchar(255) DEFAULT NULL,
  `witness2_name` varchar(255) DEFAULT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_of_cohabitation`
--

INSERT INTO `certificate_of_cohabitation` (`certificate_of_cohabitation_id`, `resident1_id`, `resident2_id`, `full_name1`, `dob1`, `full_name2`, `dob2`, `address`, `date_started`, `date_issued`, `witness1_name`, `witness2_name`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `secretary_signature_id`, `captain_signature_id`) VALUES
(1, 8, 7, 'Trixie Ann G. Morales', '2002-10-05', 'Hanna N. Sarabia', '2004-06-01', '123 General Tirona St', '2025', '2025-10-31', 'HehEaaq', 'Wala Lang', 'COH-251031-936668', 1, '2025-10-31 12:55:01', '2025-11-09 19:55:36', 0, NULL, NULL),
(2, 6, 1, 'Lyra Borling', '2000-01-28', 'Moneque Sazon', '2000-01-31', '12 Kanto St', '2025', '2025-11-09', 'q', 'aaaaaa', 'COH-251109-119536', 0, '2025-11-09 19:02:46', '2026-01-07 02:23:20', 0, NULL, NULL),
(7, 6, 1, 'Lyra Borling', '2000-01-28', 'Moneque Sazon', '2000-01-31', '12 Kanto St', '2025', '2025-11-09', 'q', 'aaaaaa', 'COH-260107022320-764', 1, '2026-01-07 02:23:20', '2026-01-07 02:23:20', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `certificate_of_residency`
--

CREATE TABLE `certificate_of_residency` (
  `certificate_of_residency_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_of_residency`
--

INSERT INTO `certificate_of_residency` (`certificate_of_residency_id`, `resident_id`, `transactionNum`, `full_name`, `address`, `provincial_address`, `dob`, `age`, `civil_status`, `contact_no`, `request_reason`, `remarks`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `signature_id`) VALUES
(1, 7, '', 'Hanna N. Sarabia', '123 General Tirona St', '123 General ', '2004-06-01', 21, 'Single', '09663122562', 'heheh', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2025-10-18', 'COR-251018-100100', 0, '2025-10-18 02:44:53', '2026-01-06 16:23:51', 0, NULL),
(3, 7, '', 'Hanna N. Sarabia', '123 General Tirona St', '123 General ', '2004-06-01', 21, 'Single', '09663122562', 'heheh', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2025-10-18', 'RES-260107002351-803', 1, '2026-01-06 16:23:51', '2026-01-06 16:23:51', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `faq_id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`faq_id`, `question`, `answer`, `sort_order`, `is_active`, `updated_by`, `date_created`, `date_updated`) VALUES
(1, 'How to retrived the data?', 'ewan ko sayo', 0, 1, 1, '2025-12-09 07:34:35', '2025-12-09 07:34:35');

-- --------------------------------------------------------

--
-- Table structure for table `financial_assistance`
--

CREATE TABLE `financial_assistance` (
  `financial_assistance_id` int(11) NOT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `financial_assistance`
--

INSERT INTO `financial_assistance` (`financial_assistance_id`, `resident_id`, `full_name`, `age`, `dob`, `address`, `occupation`, `purpose`, `monthly_income`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `secretary_signature_id`, `captain_signature_id`) VALUES
(1, 7, 'Hanna N. Sarabia', 21, '2004-06-01', '123 General Tirona St', 'vendor', 'Sample', 3000.00, '2025-10-24', 'FA-251024-890117', 0, '2025-10-24 15:36:51', '2026-01-06 18:42:41', 0, NULL, NULL),
(2, 7, 'Hanna N. Sarabia', 21, '2004-06-01', '123 General Tirona St', 'vendor', 'Sample', 3000.00, '2025-10-24', 'FIN-260107024241-578', 1, '2026-01-06 18:42:41', '2026-01-06 18:42:41', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `indigency`
--

CREATE TABLE `indigency` (
  `indigency_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indigency`
--

INSERT INTO `indigency` (`indigency_id`, `resident_id`, `transactionNum`, `full_name`, `address`, `provincial_address`, `dob`, `age`, `civil_status`, `contact_no`, `request_reason`, `remarks`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `signature_id`) VALUES
(6, 8, '', 'Trixie Ann G. Morales', 'Sampaloc, Manila', 'Metro Manila', '2002-10-05', 23, 'Single', '09354685456', 'dasaaa', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-10-14', 'IND-251014-167', 1, '2025-10-14 07:39:55', '2025-11-08 13:53:36', 0, NULL),
(7, 6, '', 'Lyra Borling', '29 St', 'MetroManila', '2000-01-28', 25, 'Single', '09276121723', 'fsfsdaa', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-10-14', 'IND-251014-756', 1, '2025-10-14 07:40:16', '2025-11-08 13:53:32', 0, NULL),
(8, 6, '', 'Lyra Borling', '29 St', 'MetroManila', '2000-01-28', 25, 'Single', '09276121723', 'Wala lang', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-11-08', 'IND-251014-050', 1, '2025-10-14 07:44:34', '2025-11-08 13:53:29', 0, NULL),
(9, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'changetest', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-11-08', 'IND-251108211205-851', 1, '2025-11-08 13:12:05', '2025-11-09 11:43:50', 0, NULL),
(10, 7, '', 'Hanna N. Sarabia', '123 General Tirona St', '123 General Tirona St', '2004-06-01', 21, 'Single', '09663122562', 'dasdasdas', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-12-10', 'IND-251210-884100', 1, '2025-12-10 00:59:07', '2025-12-10 00:59:07', 0, NULL),
(11, 7, '', 'Hanna N. Sarabia', '123 General Tirona St', '123 General Tirona St', '2004-06-01', 21, 'Single', '09663122562', 'dasdas', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-12-10', 'IND-251210-644100', 1, '2025-12-10 00:59:26', '2025-12-10 00:59:26', 0, NULL),
(12, 7, '', 'Hanna N. Sarabia', '123 General Tirona St', '123 General Tirona St', '2004-06-01', 21, 'Single', '09663122562', 'fdgdg', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2025-12-10', 'IND-251210-743100', 1, '2025-12-10 01:35:48', '2025-12-10 01:35:48', 0, NULL),
(13, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'guamana ka', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2026-01-06', 'IND-260106-409100', 0, '2026-01-06 11:51:51', '2026-01-06 12:13:45', 1, NULL),
(14, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'guamana ka', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2026-01-06', 'IND-260106201345-237', 1, '2026-01-06 12:13:46', '2026-01-06 12:13:46', 1, 1),
(15, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'guamana ka', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2026-01-06', 'IND-260106201354-250', 1, '2026-01-06 12:13:54', '2026-01-06 12:13:54', 1, 1),
(16, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'guamana kaaa', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2026-01-06', 'IND-260106201359-604', 0, '2026-01-06 12:13:59', '2026-01-06 12:14:32', 1, 1),
(17, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'guamana kaaa', 'Residence in this Barangay and certifies that he/she belongs to indigent families.', '2026-01-06', 'IND-260106201418-850', 0, '2026-01-06 12:14:18', '2026-01-06 12:14:27', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `oath_job`
--

CREATE TABLE `oath_job` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `oath_job`
--

INSERT INTO `oath_job` (`id`, `resident_id`, `transaction_number`, `full_name`, `age`, `address`, `date_issued`, `date_created`, `date_updated`, `use_signature`, `signature_id`, `is_active`) VALUES
(7, 8, 'IND-251109155653-046', 'Trixie Ann G. Morales', 23, 'Sampaloc, Manila', '2025-11-08', '2025-11-09 07:56:53', '2025-11-09 08:00:06', 0, NULL, 1),
(8, 7, 'IND-251109160050-734', 'Hanna N. Sarabia', 21, '123 General Tirona St.', '2025-11-09', '2025-11-09 08:00:50', '2025-11-10 07:25:28', 0, NULL, 1),
(9, 8, 'IND-251110152040-880', 'Trixie Ann G. Morales', 23, 'Sampaloc, Manila', '2025-11-03', '2025-11-10 07:20:40', '2025-11-10 07:26:46', 0, NULL, 1),
(10, 1, 'IND-260106214425-267', 'Moneque Sazon', 25, '12 Kanto St', '2026-01-06', '2026-01-06 13:44:25', '2026-01-06 14:06:42', 1, 1, 0),
(11, 1, 'OJS-260106220642-382', 'Moneque Sazon', 25, '12 Kanto St', '2026-01-06', '2026-01-06 14:06:42', '2026-01-07 02:10:19', 1, 1, 0),
(12, 1, 'OJS-260107101019-244', 'Moneque Sazon', 25, '12 Kanto St', '2026-01-06', '2026-01-07 02:10:19', '2026-01-07 02:11:28', 1, 1, 0),
(13, 1, 'OJS-260107101128-802', 'Moneque Sazon', 25, '12 Kanto St', '2026-01-07', '2026-01-07 02:11:28', '2026-01-07 02:11:28', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `official_signature`
--

CREATE TABLE `official_signature` (
  `signature_id` int(11) NOT NULL,
  `official_name` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `signature_path` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `official_signature`
--

INSERT INTO `official_signature` (`signature_id`, `official_name`, `designation`, `signature_path`, `created_at`, `updated_at`) VALUES
(1, 'Arnold Dondonayos', 'Barangay Captain', '/uploads/signatures/signature-1767659976035-910038458.png', '2025-12-10 13:12:50', '2026-01-06 08:39:36');

-- --------------------------------------------------------

--
-- Table structure for table `permit_to_travel`
--

CREATE TABLE `permit_to_travel` (
  `permit_to_travel_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permit_to_travel`
--

INSERT INTO `permit_to_travel` (`permit_to_travel_id`, `resident_id`, `transactionNum`, `full_name`, `address`, `provincial_address`, `dob`, `age`, `civil_status`, `contact_no`, `request_reason`, `remarks`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `signature_id`) VALUES
(1, 1, '', 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', 'hehehea', 'you can also change this', '2025-10-18', 'PTT-251018-377100', 1, '2025-10-18 02:47:42', '2025-11-09 12:04:31', 0, NULL),
(2, 7, '', 'Hanna N. Sarabia', '123 General Tirona St', '123 General Tirona St', '2004-06-01', 21, 'Single', '09663122562', 'testt', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2025-11-10', 'PTT-251110-446100', 1, '2025-11-10 07:00:31', '2025-11-10 07:00:54', 0, NULL),
(3, 6, '', 'Lyra Borling', '29 St', 'MetroManila', '2000-01-28', 25, 'Single', '09276121723', 'hdshdhshdhd', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2025-12-10', 'PTT-251210-481100', 0, '2025-12-10 04:53:29', '2026-01-06 16:47:19', 0, NULL),
(4, 6, '', 'Lyra Borling', '29 St', 'MetroManila', '2000-01-28', 25, 'Single', '09276121723', 'hdshdhshdhd', 'Residence in this Barangay and certifies that he/she is a resident of good moral character.', '2025-12-10', 'TRV-260107004719-716', 1, '2026-01-06 16:47:19', '2026-01-06 16:47:19', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `provincial_address` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') DEFAULT 'Single',
  `contact_no` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`resident_id`, `full_name`, `address`, `provincial_address`, `dob`, `age`, `civil_status`, `contact_no`, `created_at`) VALUES
(1, 'Moneque Sazon', '12 Kanto St', 'Metro Manila', '2000-01-31', 25, 'Single', '098726416782', '2025-10-11 07:01:56'),
(6, 'Lyra Borling', '29 St', 'MetroManila', '2000-01-28', 25, 'Single', '09276121723', '2025-10-11 07:58:05'),
(7, 'Hanna N. Sarabia', '123 General Tirona St. Bagong Barrio Caloocan City', '123 General Tirona St', '2004-06-01', 21, 'Single', '09663122562', '2025-10-13 08:07:13'),
(8, 'Trixie Ann G. Morales', 'Sampaloc, Manila', 'Metro Manila', '2002-10-05', 23, 'Single', '09354685456', '2025-10-13 08:30:55');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_permission_id` int(11) NOT NULL,
  `role` enum('admin','staff','chairman') NOT NULL,
  `permission` varchar(150) NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `security_settings`
--

CREATE TABLE `security_settings` (
  `security_settings_id` int(11) NOT NULL,
  `mfa_enabled` tinyint(1) DEFAULT 0,
  `twofa_optional` tinyint(1) DEFAULT 1,
  `data_retention_days` int(11) DEFAULT NULL,
  `encryption_at_rest` tinyint(1) DEFAULT 1,
  `encryption_in_transit` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `security_settings`
--

INSERT INTO `security_settings` (`security_settings_id`, `mfa_enabled`, `twofa_optional`, `data_retention_days`, `encryption_at_rest`, `encryption_in_transit`, `notes`, `updated_by`, `date_created`, `date_updated`) VALUES
(1, 0, 1, NULL, 1, 1, NULL, NULL, '2025-12-09 07:33:47', '2025-12-09 07:33:47');

-- --------------------------------------------------------

--
-- Table structure for table `settings_pages`
--

CREATE TABLE `settings_pages` (
  `page_id` int(11) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings_pages`
--

INSERT INTO `settings_pages` (`page_id`, `slug`, `title`, `content`, `is_active`, `updated_by`, `date_created`, `date_updated`) VALUES
(1, 'mission-vision', 'Mission & Vision', '', 1, NULL, '2025-12-09 07:33:47', '2025-12-09 07:33:47'),
(2, 'about', 'About', '', 1, NULL, '2025-12-09 07:33:47', '2025-12-09 07:33:47'),
(3, 'security-privacy', 'Security & Privacy', '', 1, NULL, '2025-12-09 07:33:47', '2025-12-09 07:33:47');

-- --------------------------------------------------------

--
-- Table structure for table `solo_parent_children`
--

CREATE TABLE `solo_parent_children` (
  `child_id` int(11) NOT NULL,
  `solo_parent_id` int(11) NOT NULL,
  `child_name` varchar(255) NOT NULL,
  `child_age` varchar(10) DEFAULT NULL,
  `child_birthday` date DEFAULT NULL,
  `child_level` enum('Nursery','Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','College 1st Year','College 2nd Year','College 3rd Year','College 4th Year','College 5th Year','Graduate School','Others') DEFAULT NULL,
  `child_level_remarks` varchar(255) DEFAULT NULL,
  `child_gender` enum('Male','Female','Others') DEFAULT NULL,
  `child_relationship` enum('Son','Daughter','Others') DEFAULT NULL,
  `child_relationship_remarks` varchar(255) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `solo_parent_children`
--

INSERT INTO `solo_parent_children` (`child_id`, `solo_parent_id`, `child_name`, `child_age`, `child_birthday`, `child_level`, `child_level_remarks`, `child_gender`, `child_relationship`, `child_relationship_remarks`, `date_created`, `date_updated`) VALUES
(24, 1, 'Hanna Nyek', '21', '2004-01-06', 'College 4th Year', NULL, 'Female', 'Daughter', NULL, '2025-11-10 07:17:41', '2025-11-10 07:17:41'),
(25, 6, 'gurl', '12', '2013-01-30', 'Grade 6', NULL, 'Female', 'Daughter', NULL, '2025-11-10 07:18:10', '2025-11-10 07:18:10'),
(26, 7, 'nak', '5', '2020-10-13', 'Nursery', NULL, 'Male', 'Son', NULL, '2025-11-10 07:18:28', '2025-11-10 07:18:28'),
(28, 5, 'boy', '7', '2018-01-30', 'Grade 1', NULL, 'Male', 'Son', NULL, '2025-11-10 07:18:55', '2025-11-10 07:18:55'),
(29, 8, 'nak', '5', '2020-10-13', 'Nursery', NULL, 'Male', 'Son', NULL, '2026-01-06 14:40:08', '2026-01-06 14:40:08');

-- --------------------------------------------------------

--
-- Table structure for table `solo_parent_records`
--

CREATE TABLE `solo_parent_records` (
  `solo_parent_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `residents_since_year` varchar(10) DEFAULT NULL,
  `unwed_since_year` varchar(10) DEFAULT NULL,
  `employment_status` enum('Employed','Unemployed','Self-Employed','Business Owner','Freelancer','Contract Worker','Others') DEFAULT NULL,
  `employment_remarks` varchar(255) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `solo_parent_records`
--

INSERT INTO `solo_parent_records` (`solo_parent_id`, `resident_id`, `transactionNum`, `full_name`, `address`, `dob`, `age`, `contact_no`, `residents_since_year`, `unwed_since_year`, `employment_status`, `employment_remarks`, `date_issued`, `transaction_number`, `is_active`, `date_created`, `date_updated`, `use_signature`, `secretary_signature_id`, `captain_signature_id`) VALUES
(1, 8, 'SP-1761883633940', 'Trixie Ann G. Morales', 'Sampaloc, Manila', '2002-10-05', 23, NULL, '2001', '2012', 'Self-Employed', NULL, '2025-10-31', 'SP-1761883633940', 1, '2025-10-31 04:07:13', '2025-11-10 06:53:40', 0, NULL, NULL),
(5, 7, 'SP-1762691728991', 'Hanna N. Sarabia', '123 General Tirona St', '2004-06-01', 21, NULL, '2020', '2022', 'Employed', NULL, '2025-11-09', 'SP-1762691728991', 1, '2025-11-09 12:35:28', '2025-11-10 07:18:55', 0, NULL, NULL),
(6, 6, 'SP-1762698305229', 'Lyra Borling', '29 St', '2000-01-28', 25, NULL, '2023', '2023', 'Unemployed', NULL, '2025-11-09', 'SP-1762698305229', 1, '2025-11-09 14:25:05', '2025-11-09 14:25:05', 0, NULL, NULL),
(7, 1, 'SP-1762716580247', 'Moneque Sazon', '12 Kanto St', '2000-01-31', 25, NULL, '2023', '2024', 'Employed', NULL, '2025-11-09', 'SP-1762716580247', 0, '2025-11-09 19:29:40', '2026-01-06 14:40:07', 0, NULL, NULL),
(8, 1, 'SP-260106224007-722', 'Moneque Sazon', '12 Kanto St', '2000-01-31', 25, NULL, '2023', '2024', 'Employed', NULL, '2025-11-09', 'SP-260106224007-722', 1, '2026-01-06 14:40:07', '2026-01-06 14:40:07', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','chairman') DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `name`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'System Administrator', '$2a$10$bUyF1Q1Yf6ciA9JC1meB.ut/7r18kk1mj42bbOEvI4K7RHkeqXb0S', 'admin', '2025-09-22 04:37:24'),
(2, 'chairman', 'Barangay Chairman', '$2a$10$jgED7lGEw8j9iq39MHHUt.OsJOGyMUROSDLVTS7kcPs4h/f79EkUq', 'chairman', '2025-09-22 04:37:24'),
(3, 'staff', 'Barangay Staff', '$2a$10$cenRvwfB/eqQE339/vq0ROdTIVfxClidW2YEBUCw//rGIZeInRxWK', 'staff', '2025-09-22 04:37:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bhert_certificate_normal`
--
ALTER TABLE `bhert_certificate_normal`
  ADD PRIMARY KEY (`bhert_certificate_normal_id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `secretary_signature_id` (`secretary_signature_id`),
  ADD KEY `captain_signature_id` (`captain_signature_id`);

--
-- Indexes for table `bhert_certificate_positive`
--
ALTER TABLE `bhert_certificate_positive`
  ADD PRIMARY KEY (`bhert_certificate_positive_id`),
  ADD KEY `fk_bhert_positive_resident` (`resident_id`),
  ADD KEY `secretary_signature_id` (`secretary_signature_id`),
  ADD KEY `captain_signature_id` (`captain_signature_id`);

--
-- Indexes for table `business_clearance`
--
ALTER TABLE `business_clearance`
  ADD PRIMARY KEY (`business_clearance_id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `signature_id` (`signature_id`);

--
-- Indexes for table `cash_assistance`
--
ALTER TABLE `cash_assistance`
  ADD PRIMARY KEY (`cash_assistance_id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `fk_ca_secretary_signature` (`secretary_signature_id`),
  ADD KEY `fk_ca_captain_signature` (`captain_signature_id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certificate_id`),
  ADD KEY `idx_certificate_type` (`certificate_type`),
  ADD KEY `idx_resident_id` (`resident_id`);

--
-- Indexes for table `certificate_of_action`
--
ALTER TABLE `certificate_of_action`
  ADD PRIMARY KEY (`certificate_of_action_id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `signature_id` (`signature_id`);

--
-- Indexes for table `certificate_of_cohabitation`
--
ALTER TABLE `certificate_of_cohabitation`
  ADD PRIMARY KEY (`certificate_of_cohabitation_id`),
  ADD KEY `resident1_id` (`resident1_id`),
  ADD KEY `resident2_id` (`resident2_id`),
  ADD KEY `secretary_signature_id` (`secretary_signature_id`),
  ADD KEY `captain_signature_id` (`captain_signature_id`);

--
-- Indexes for table `certificate_of_residency`
--
ALTER TABLE `certificate_of_residency`
  ADD PRIMARY KEY (`certificate_of_residency_id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `idx_transaction_number` (`transaction_number`),
  ADD KEY `signature_id` (`signature_id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`faq_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `financial_assistance`
--
ALTER TABLE `financial_assistance`
  ADD PRIMARY KEY (`financial_assistance_id`),
  ADD KEY `fk_financial_assistance_resident` (`resident_id`),
  ADD KEY `secretary_signature_id` (`secretary_signature_id`),
  ADD KEY `captain_signature_id` (`captain_signature_id`);

--
-- Indexes for table `indigency`
--
ALTER TABLE `indigency`
  ADD PRIMARY KEY (`indigency_id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `idx_transaction_number` (`transaction_number`);

--
-- Indexes for table `oath_job`
--
ALTER TABLE `oath_job`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oath_job_resident` (`resident_id`),
  ADD KEY `signature_id` (`signature_id`);

--
-- Indexes for table `official_signature`
--
ALTER TABLE `official_signature`
  ADD PRIMARY KEY (`signature_id`);

--
-- Indexes for table `permit_to_travel`
--
ALTER TABLE `permit_to_travel`
  ADD PRIMARY KEY (`permit_to_travel_id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `idx_transaction_number` (`transaction_number`),
  ADD KEY `signature_id` (`signature_id`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`resident_id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD UNIQUE KEY `uniq_role_permission` (`role`,`permission`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `security_settings`
--
ALTER TABLE `security_settings`
  ADD PRIMARY KEY (`security_settings_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `settings_pages`
--
ALTER TABLE `settings_pages`
  ADD PRIMARY KEY (`page_id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `solo_parent_children`
--
ALTER TABLE `solo_parent_children`
  ADD PRIMARY KEY (`child_id`),
  ADD KEY `solo_parent_id` (`solo_parent_id`);

--
-- Indexes for table `solo_parent_records`
--
ALTER TABLE `solo_parent_records`
  ADD PRIMARY KEY (`solo_parent_id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `idx_transaction_number` (`transaction_number`),
  ADD KEY `secretary_signature_id` (`secretary_signature_id`),
  ADD KEY `captain_signature_id` (`captain_signature_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bhert_certificate_normal`
--
ALTER TABLE `bhert_certificate_normal`
  MODIFY `bhert_certificate_normal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bhert_certificate_positive`
--
ALTER TABLE `bhert_certificate_positive`
  MODIFY `bhert_certificate_positive_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `business_clearance`
--
ALTER TABLE `business_clearance`
  MODIFY `business_clearance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cash_assistance`
--
ALTER TABLE `cash_assistance`
  MODIFY `cash_assistance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `certificate_of_action`
--
ALTER TABLE `certificate_of_action`
  MODIFY `certificate_of_action_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `certificate_of_cohabitation`
--
ALTER TABLE `certificate_of_cohabitation`
  MODIFY `certificate_of_cohabitation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `certificate_of_residency`
--
ALTER TABLE `certificate_of_residency`
  MODIFY `certificate_of_residency_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `faq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `financial_assistance`
--
ALTER TABLE `financial_assistance`
  MODIFY `financial_assistance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `indigency`
--
ALTER TABLE `indigency`
  MODIFY `indigency_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `oath_job`
--
ALTER TABLE `oath_job`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `official_signature`
--
ALTER TABLE `official_signature`
  MODIFY `signature_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `permit_to_travel`
--
ALTER TABLE `permit_to_travel`
  MODIFY `permit_to_travel_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `resident_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_settings`
--
ALTER TABLE `security_settings`
  MODIFY `security_settings_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `settings_pages`
--
ALTER TABLE `settings_pages`
  MODIFY `page_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `solo_parent_children`
--
ALTER TABLE `solo_parent_children`
  MODIFY `child_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `solo_parent_records`
--
ALTER TABLE `solo_parent_records`
  MODIFY `solo_parent_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bhert_certificate_normal`
--
ALTER TABLE `bhert_certificate_normal`
  ADD CONSTRAINT `bhert_certificate_normal_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `bhert_certificate_normal_ibfk_2` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `bhert_certificate_normal_ibfk_3` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`);

--
-- Constraints for table `bhert_certificate_positive`
--
ALTER TABLE `bhert_certificate_positive`
  ADD CONSTRAINT `bhert_certificate_positive_ibfk_1` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `bhert_certificate_positive_ibfk_2` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `fk_bhert_positive_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`);

--
-- Constraints for table `business_clearance`
--
ALTER TABLE `business_clearance`
  ADD CONSTRAINT `business_clearance_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `business_clearance_ibfk_2` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`);

--
-- Constraints for table `cash_assistance`
--
ALTER TABLE `cash_assistance`
  ADD CONSTRAINT `cash_assistance_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `fk_ca_captain_signature` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ca_secretary_signature` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`);

--
-- Constraints for table `certificate_of_action`
--
ALTER TABLE `certificate_of_action`
  ADD CONSTRAINT `certificate_of_action_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `fk_cert_action_signature` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `certificate_of_cohabitation`
--
ALTER TABLE `certificate_of_cohabitation`
  ADD CONSTRAINT `certificate_of_cohabitation_ibfk_1` FOREIGN KEY (`resident1_id`) REFERENCES `residents` (`resident_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `certificate_of_cohabitation_ibfk_2` FOREIGN KEY (`resident2_id`) REFERENCES `residents` (`resident_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `certificate_of_cohabitation_ibfk_3` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `certificate_of_cohabitation_ibfk_4` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`);

--
-- Constraints for table `certificate_of_residency`
--
ALTER TABLE `certificate_of_residency`
  ADD CONSTRAINT `certificate_of_residency_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `certificate_of_residency_ibfk_2` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`);

--
-- Constraints for table `faqs`
--
ALTER TABLE `faqs`
  ADD CONSTRAINT `faqs_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `financial_assistance`
--
ALTER TABLE `financial_assistance`
  ADD CONSTRAINT `financial_assistance_ibfk_1` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `financial_assistance_ibfk_2` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `fk_financial_assistance_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `indigency`
--
ALTER TABLE `indigency`
  ADD CONSTRAINT `indigency_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`);

--
-- Constraints for table `oath_job`
--
ALTER TABLE `oath_job`
  ADD CONSTRAINT `fk_oath_job_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `oath_job_ibfk_1` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`);

--
-- Constraints for table `permit_to_travel`
--
ALTER TABLE `permit_to_travel`
  ADD CONSTRAINT `permit_to_travel_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `permit_to_travel_ibfk_2` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `security_settings`
--
ALTER TABLE `security_settings`
  ADD CONSTRAINT `security_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `settings_pages`
--
ALTER TABLE `settings_pages`
  ADD CONSTRAINT `settings_pages_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `solo_parent_children`
--
ALTER TABLE `solo_parent_children`
  ADD CONSTRAINT `solo_parent_children_ibfk_1` FOREIGN KEY (`solo_parent_id`) REFERENCES `solo_parent_records` (`solo_parent_id`) ON DELETE CASCADE;

--
-- Constraints for table `solo_parent_records`
--
ALTER TABLE `solo_parent_records`
  ADD CONSTRAINT `solo_parent_records_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `solo_parent_records_ibfk_2` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`),
  ADD CONSTRAINT `solo_parent_records_ibfk_3` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
