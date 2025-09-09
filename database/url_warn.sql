-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 09, 2025 at 03:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `url_warn`
--

-- --------------------------------------------------------

--
-- Table structure for table `flagged_urls`
--

CREATE TABLE `flagged_urls` (
  `id` int(11) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `url_hash` char(64) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `flags_count` int(11) NOT NULL,
  `first_flagged_at` datetime NOT NULL,
  `last_flagged_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rate_limiter`
--

CREATE TABLE `rate_limiter` (
  `ip` varbinary(16) NOT NULL,
  `bucket` varchar(32) NOT NULL,
  `count` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rate_limiter`
--

INSERT INTO `rate_limiter` (`ip`, `bucket`, `count`, `created_at`) VALUES
(0x3a3a31, 'flag', 4, '2025-09-09 04:04:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `flagged_urls`
--
ALTER TABLE `flagged_urls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_url_hash` (`url_hash`),
  ADD KEY `last_flagged_at` (`last_flagged_at`);

--
-- Indexes for table `rate_limiter`
--
ALTER TABLE `rate_limiter`
  ADD PRIMARY KEY (`ip`,`bucket`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `flagged_urls`
--
ALTER TABLE `flagged_urls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
