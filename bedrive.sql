-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 18, 2025 at 10:25 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bedrive`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_sessions`
--

CREATE TABLE `active_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bans`
--

CREATE TABLE `bans` (
  `id` int(10) UNSIGNED NOT NULL,
  `bannable_type` varchar(255) NOT NULL,
  `bannable_id` bigint(20) UNSIGNED NOT NULL,
  `created_by_type` varchar(255) DEFAULT NULL,
  `created_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `expired_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `billing_plans`
--

CREATE TABLE `billing_plans` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(13,2) DEFAULT NULL,
  `currency` varchar(255) NOT NULL,
  `currency_symbol` varchar(255) NOT NULL DEFAULT '$',
  `interval` varchar(255) NOT NULL DEFAULT 'month',
  `interval_count` int(11) NOT NULL DEFAULT 1,
  `parent_id` int(11) DEFAULT NULL,
  `legacy_permissions` text DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  `paypal_id` varchar(50) DEFAULT NULL,
  `recommended` tinyint(1) NOT NULL DEFAULT 0,
  `free` tinyint(1) NOT NULL DEFAULT 0,
  `show_permissions` tinyint(1) NOT NULL DEFAULT 0,
  `features` text DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `available_space` bigint(20) UNSIGNED DEFAULT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(10) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `path` varchar(255) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `commentable_id` int(10) UNSIGNED NOT NULL,
  `commentable_type` varchar(30) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `upvotes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `downvotes` bigint(20) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comment_reports`
--

CREATE TABLE `comment_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `comment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_ip` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comment_votes`
--

CREATE TABLE `comment_votes` (
  `id` int(10) UNSIGNED NOT NULL,
  `vote_type` varchar(10) NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `comment_id` int(10) UNSIGNED NOT NULL,
  `user_ip` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `css_themes`
--

CREATE TABLE `css_themes` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_dark` tinyint(1) NOT NULL DEFAULT 0,
  `default_light` tinyint(1) NOT NULL DEFAULT 0,
  `default_dark` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `type` varchar(40) NOT NULL DEFAULT 'site',
  `values` text NOT NULL,
  `font` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `css_themes`
--

INSERT INTO `css_themes` (`id`, `name`, `is_dark`, `default_light`, `default_dark`, `user_id`, `type`, `values`, `font`, `created_at`, `updated_at`) VALUES
(1, 'Dark', 1, 0, 1, 1, 'site', '{\"--be-foreground-base\":\"255 255 255\",\"--be-primary-light\":\"239 246 255\",\"--be-primary\":\"191 219 254\",\"--be-primary-dark\":\"147 197 253\",\"--be-on-primary\":\"56 30 114\",\"--be-background\":\"23 23 26\",\"--be-background-alt\":\"34 34 38\",\"--be-background-chip\":\"66 68 74\",\"--be-paper\":\"36 37 40\",\"--be-disabled-bg-opacity\":\"12%\",\"--be-disabled-fg-opacity\":\"30%\",\"--be-hover-opacity\":\"8%\",\"--be-focus-opacity\":\"12%\",\"--be-selected-opacity\":\"16%\",\"--be-text-main-opacity\":\"100%\",\"--be-text-muted-opacity\":\"70%\",\"--be-divider-opacity\":\"12%\"}', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55'),
(2, 'Light', 0, 1, 0, 1, 'site', '{\"--be-foreground-base\":\"0 0 0\",\"--be-primary-light\":\"191 219 254\",\"--be-primary\":\"59 130 246\",\"--be-primary-dark\":\"37 99 235\",\"--be-on-primary\":\"255 255 255\",\"--be-background\":\"255 255 255\",\"--be-background-alt\":\"246 248 250\",\"--be-background-chip\":\"233 236 239\",\"--be-paper\":\"255 255 255\",\"--be-disabled-bg-opacity\":\"12%\",\"--be-disabled-fg-opacity\":\"26%\",\"--be-hover-opacity\":\"4%\",\"--be-focus-opacity\":\"12%\",\"--be-selected-opacity\":\"8%\",\"--be-text-main-opacity\":\"87%\",\"--be-text-muted-opacity\":\"60%\",\"--be-divider-opacity\":\"12%\"}', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55');

-- --------------------------------------------------------

--
-- Table structure for table `csv_exports`
--

CREATE TABLE `csv_exports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cache_name` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `download_name` varchar(50) NOT NULL,
  `uuid` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_domains`
--

CREATE TABLE `custom_domains` (
  `id` int(10) UNSIGNED NOT NULL,
  `host` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `global` tinyint(1) NOT NULL DEFAULT 0,
  `resource_id` int(10) UNSIGNED DEFAULT NULL,
  `resource_type` varchar(20) DEFAULT NULL,
  `workspace_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_pages`
--

CREATE TABLE `custom_pages` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` longtext NOT NULL,
  `slug` varchar(255) NOT NULL,
  `meta` text DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'default',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `hide_nav` tinyint(1) NOT NULL DEFAULT 0,
  `workspace_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fcm_tokens`
--

CREATE TABLE `fcm_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `device_id` varchar(40) NOT NULL,
  `token` varchar(180) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_entries`
--

CREATE TABLE `file_entries` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `file_name` varchar(50) NOT NULL,
  `mime` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `path` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `disk_prefix` varchar(191) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `extension` varchar(10) DEFAULT NULL,
  `public` tinyint(1) NOT NULL DEFAULT 0,
  `preview_token` varchar(15) DEFAULT NULL,
  `thumbnail` tinyint(1) NOT NULL DEFAULT 0,
  `workspace_id` int(10) UNSIGNED DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `file_entries`
--

INSERT INTO `file_entries` (`id`, `name`, `description`, `file_name`, `mime`, `file_size`, `user_id`, `parent_id`, `created_at`, `updated_at`, `deleted_at`, `path`, `disk_prefix`, `type`, `extension`, `public`, `preview_token`, `thumbnail`, `workspace_id`, `owner_id`) VALUES
(1, 'CMC1002-order-carrier-sheet (1).pdf', NULL, 'd292438af3165c821f0e8c481449426bd090420aa3c1e52ae8', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 13:52:00', '2025-08-06 13:52:00', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(2, 'CMC1002-order-carrier-sheet.pdf', NULL, 'b415ab744042a46f2cf4110131b291efffd06bffe08e4b7427', 'application/pdf', 13205830, NULL, NULL, '2025-08-06 14:02:50', '2025-08-06 14:02:50', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(3, 'CMC1002-order-carrier-sheet (1).pdf', NULL, '7841d40073197fa4779fcfc920ee92ad1122c6f8e434dff6c0', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 14:13:30', '2025-08-06 14:13:30', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(4, 'CMC1002-order-carrier-sheet (1).pdf', NULL, '4ed26dbf9a9a04794a6ef51e5f03e54a112b0cec8cf31f7397', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 14:13:30', '2025-08-06 14:13:30', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(5, 'CMC1002-order-carrier-sheet (1).pdf', NULL, 'ba13617a7e65b578c12a5b5443880ddef08190c3c7bdde8e50', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 14:13:30', '2025-08-06 14:13:30', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(6, 'CMC1002-order-carrier-sheet.pdf', NULL, '5a62da25dd150d6e9840ddf3353600c14c5453081d1f5e7e91', 'application/pdf', 13205830, NULL, NULL, '2025-08-06 15:11:51', '2025-08-06 15:11:51', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(7, 'CMC1002-order-carrier-sheet.pdf', NULL, '5c07414bcce624fa9ae0fc8a4666ce9e2892e68ce5678fd516', 'application/pdf', 13205830, NULL, NULL, '2025-08-06 15:13:54', '2025-08-06 15:13:54', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(8, 'DEVRAJ_16PROMAX (1).pdf', NULL, '4fbd433bbf9670a78bdecf95a06769332f79bde3caf0d74881', 'application/pdf', 313743, NULL, NULL, '2025-08-06 15:13:54', '2025-08-06 15:13:54', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(9, 'CMC1002-order-carrier-sheet.pdf', NULL, '9686f6a98227066d99d6a8312a4c2ffc59834d490bd927eb24', 'application/pdf', 13205830, NULL, NULL, '2025-08-06 16:58:33', '2025-08-06 16:58:33', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(10, 'DEVRAJ_16PROMAX (1).pdf', NULL, '83f5b74de09a0b2ada315cce8efd527d5cb283807efe1e2e64', 'application/pdf', 313743, NULL, NULL, '2025-08-06 16:58:33', '2025-08-06 16:58:33', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(11, 'CMC1002-order-carrier-sheet (1).pdf', NULL, 'ed5808e3dcc09853ef7b9a4741a30f49970dbef51135c68abd', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 16:59:04', '2025-08-06 16:59:04', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(12, 'DEVRAJ_16PROMAX (1).pdf', NULL, 'ac4111743601d0317ca703e36bb73978c4dff7d76c698a15cc', 'application/pdf', 313743, NULL, NULL, '2025-08-06 16:59:04', '2025-08-06 16:59:04', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(13, 'CMC1002-order-carrier-sheet (1).pdf', NULL, '9ee291f058de0c77f5c0ca0fbc7ae642b14e2b4450d064c541', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 17:02:46', '2025-08-06 17:02:46', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(14, 'DEVRAJ_16PROMAX (1).pdf', NULL, '33f6f03746781442b4a3b8ecb9dc316a042956eeb731eddad5', 'application/pdf', 313743, NULL, NULL, '2025-08-06 17:02:46', '2025-08-06 17:02:46', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(15, 'CMC1002-order-carrier-sheet (1).pdf', NULL, '15e391cfaec70ef93dc10acd54acc975ea25bf34ff0bbb9bd6', 'application/pdf', 13007660, NULL, NULL, '2025-08-06 21:48:07', '2025-08-06 21:48:07', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(16, 'CMC1002-order-carrier-sheet.pdf', NULL, '3380fb8a7a3464d3381410c48160d85e5fa4ebc6d1cd900b8d', 'application/pdf', 13205830, NULL, NULL, '2025-08-06 21:48:07', '2025-08-06 21:48:07', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(17, 'DEVRAJ_16PROMAX (1).pdf', NULL, 'f5a6716f64271f6efdf4699692a4c249038676b3e75ecb6740', 'application/pdf', 313743, NULL, NULL, '2025-08-06 21:48:07', '2025-08-06 21:48:07', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(18, 'DEVRAJ_16PROMAX.pdf', NULL, '09dba85cef60cecd24316027187c76080ac89e8b2115f6fc46', 'application/pdf', 323060, NULL, NULL, '2025-08-06 21:48:07', '2025-08-06 21:48:07', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(19, 'CMC1002-order-carrier-sheet.pdf', NULL, 'f21dd55caeacaa20a3791965bdea5dd2b52c87a53d6073da46', 'application/pdf', 13205830, NULL, NULL, '2025-08-07 01:49:38', '2025-08-07 01:49:38', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(20, 'HIT The Second Case 2022 WebRip UNCUT 720p x265 HEVC 10bit Hindi Telugu AAC 5.1 ESub - Vegamovies.to 2.mkv', NULL, 'c511ab920264004a2f9fce5d43ba2e3c44774b37f4024aef07', 'video/x-matroska', 1004236167, NULL, NULL, '2025-08-07 03:04:27', '2025-08-07 03:04:27', NULL, '0', NULL, 'file', 'mkv', 0, NULL, 0, 0, NULL),
(21, 'DEVRAJ_16PROMAX.pdf', NULL, '34ba846ee8291456b35fb66972893daaa7b6e9c51a68959933', 'application/pdf', 323060, NULL, NULL, '2025-08-07 12:42:18', '2025-08-07 12:42:18', NULL, 'guest-uploads', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(22, 'CMC1002-order-carrier-sheet.pdf', NULL, '6989e8b91c802d240b07d3ce040689141e648964a87496fa4f', 'application/pdf', 13205830, NULL, NULL, '2025-08-07 13:11:20', '2025-08-07 13:11:20', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(23, 'CMC1002-order-carrier-sheet (1).pdf', NULL, 'f58b29509be1d0c1ae167bbd0fa2c753ec756dcbf0d6722a52', 'application/pdf', 13007660, NULL, NULL, '2025-08-07 13:17:43', '2025-08-07 13:17:43', NULL, '0', NULL, 'file', 'pdf', 0, NULL, 0, 0, NULL),
(24, 'Raid.2.2025.1080p.NF.WEB-DL.DDP5.1.H.264.mkv', NULL, '6fa5d6de7c758cd950f8835ef966df6c8bc4fce46ddc2decbf', 'video/x-matroska', 3008228102, NULL, NULL, '2025-08-07 14:19:39', '2025-08-07 14:19:39', NULL, '0', 'uploads', 'file', 'mkv', 0, NULL, 0, 0, NULL),
(25, 'DEVRAJ_16PROMAX.pdf', NULL, '1ffc39d47ba6f083037dc2e1806cb12567da531b39e55afaba', 'application/pdf', 323060, NULL, NULL, '2025-08-17 15:07:24', '2025-08-17 15:07:24', NULL, '0', 'uploads', 'file', 'pdf', 0, NULL, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `file_entry_models`
--

CREATE TABLE `file_entry_models` (
  `id` int(10) UNSIGNED NOT NULL,
  `file_entry_id` int(10) UNSIGNED NOT NULL,
  `model_id` int(10) UNSIGNED NOT NULL,
  `model_type` varchar(60) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `owner` tinyint(1) NOT NULL DEFAULT 0,
  `permissions` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `path` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `share_id` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `id` int(10) UNSIGNED NOT NULL,
  `follower_id` int(11) NOT NULL,
  `followed_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_uploads`
--

CREATE TABLE `guest_uploads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hash` varchar(32) NOT NULL,
  `file_entry_id` int(10) UNSIGNED DEFAULT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `download_count` int(11) NOT NULL DEFAULT 0,
  `max_downloads` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `link_id` varchar(30) DEFAULT NULL,
  `total_size` bigint(20) NOT NULL DEFAULT 0,
  `sender_email` varchar(255) DEFAULT NULL,
  `recipient_emails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipient_emails`)),
  `last_downloaded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_uploads`
--

INSERT INTO `guest_uploads` (`id`, `hash`, `file_entry_id`, `original_filename`, `file_size`, `mime_type`, `password`, `expires_at`, `download_count`, `max_downloads`, `ip_address`, `user_agent`, `metadata`, `link_id`, `total_size`, `sender_email`, `recipient_emails`, `last_downloaded_at`, `created_at`, `updated_at`) VALUES
(1, '1QB8b7nndBEFzUuRJyhZdg48R6HijBmp', 1, 'CMC1002-order-carrier-sheet (1).pdf', 13007660, 'application/pdf', NULL, '2025-08-09 13:52:00', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 13:52:00', '2025-08-06 13:52:00'),
(2, 'G4xSoSORRaoXCDEsGb68ZbPN82iL8pQq', 2, 'CMC1002-order-carrier-sheet.pdf', 13205830, 'application/pdf', NULL, '2025-08-09 14:02:50', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 14:02:50', '2025-08-06 14:02:50'),
(3, 'HywevChCv2drzuTVSvgiPs90Y2atYHnP', 3, 'CMC1002-order-carrier-sheet (1).pdf', 13007660, 'application/pdf', NULL, '2025-08-09 14:13:30', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 14:13:30', '2025-08-06 14:13:30'),
(4, '6IGr48I7bZswhwEsnookQzM0I7lTvRvG', 4, 'CMC1002-order-carrier-sheet (1).pdf', 13007660, 'application/pdf', NULL, '2025-08-09 14:13:30', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 14:13:30', '2025-08-06 14:13:30'),
(5, 'XwEVaErx6EgxzTpwZREO2HSMb0JeorKa', 5, 'CMC1002-order-carrier-sheet (1).pdf', 13007660, 'application/pdf', NULL, '2025-08-09 14:13:30', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 14:13:30', '2025-08-06 14:13:30'),
(6, '55UFSxDGa1yAEdLZERqqdXjsaOAQC9pA', 6, 'CMC1002-order-carrier-sheet.pdf', 13205830, 'application/pdf', NULL, '2025-08-09 15:11:51', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 15:11:51', '2025-08-06 15:11:51'),
(7, 'Lg17Z4wvS5WnClpUnTqQ632WN8U0DKIJ', 7, 'CMC1002-order-carrier-sheet.pdf', 13205830, 'application/pdf', NULL, '2025-08-09 15:13:54', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 15:13:54', '2025-08-06 15:13:54'),
(8, 'n6WBnIbv9TasmfzOLkjGlGsEbfSZSdvb', 8, 'DEVRAJ_16PROMAX (1).pdf', 313743, 'application/pdf', NULL, '2025-08-09 15:13:54', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"original_extension\":\"pdf\",\"upload_method\":\"direct\"}', NULL, 0, NULL, '[]', NULL, '2025-08-06 15:13:54', '2025-08-06 15:13:54'),
(9, 'QKxAYtqdvSPxMOqZscacKKazX0EPDRUw', NULL, '', 0, NULL, NULL, '2025-08-09 16:58:33', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 13519573, NULL, '[]', NULL, '2025-08-06 16:58:33', '2025-08-06 16:58:33'),
(10, 'busiw2IlQjc71ULjhW2iUv3ehPtJsqo1', NULL, '', 0, NULL, NULL, '2025-08-09 16:59:04', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 13321403, NULL, '[]', NULL, '2025-08-06 16:59:04', '2025-08-06 16:59:04'),
(11, '22D0VmjqigCNPUUuBBYKqREOY19UvkX2', NULL, '', 0, NULL, NULL, '2025-08-09 17:02:46', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 13321403, NULL, '[]', NULL, '2025-08-06 17:02:46', '2025-08-06 17:02:46'),
(12, 'TiJ0JT0iowcoQEhMVpxEx47TKGneNTVg', NULL, '', 0, NULL, NULL, '2025-08-09 21:48:07', 1, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 26850293, NULL, '[]', NULL, '2025-08-06 21:48:07', '2025-08-06 21:48:44'),
(13, 'yvJhZPB6ABcM12kp0HxjfbtBR9lw4oID', NULL, '', 0, NULL, NULL, '2025-08-10 01:49:37', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 13205830, NULL, '[]', NULL, '2025-08-07 01:49:37', '2025-08-07 01:49:38'),
(14, 'iA7rrfzFyHfibJmgpAA2Ba5wrYBZI7zI', NULL, '', 0, NULL, NULL, '2025-08-10 03:04:26', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 1004236167, NULL, '[]', NULL, '2025-08-07 03:04:26', '2025-08-07 03:04:27'),
(15, 'Z6UMBbYt4PZfBcjrnfDfPtEOU2ahuynN', NULL, '', 0, NULL, NULL, '2025-08-10 12:42:18', 2, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 323060, NULL, '[]', NULL, '2025-08-07 12:42:18', '2025-08-07 13:43:32'),
(16, 'cI4k4KuzKChw39O3dquxZRJu9j8c2Ppl', NULL, '', 0, NULL, '$2y$10$1.iYbLBQubhqMTiphWMyYODVY0zKH/ajCUJ6I4WnDTKijha5SlqlC', '2025-08-14 13:11:20', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 13205830, NULL, '[]', NULL, '2025-08-07 13:11:20', '2025-08-07 13:11:20'),
(17, 'iRiQIU2OKVYbPlznbM5s6yVm0AcBnO4O', NULL, '', 0, NULL, '$2y$10$o22Ohz8dySgzWyLql8BzZu/3O7tgdiGceQI4kraQl.CjVwwMhbObW', '2025-08-27 13:17:43', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 13007660, NULL, '[]', NULL, '2025-08-07 13:17:43', '2025-08-07 13:17:43'),
(18, 'EmLlxfZZ1kyM4wfgtckSOcmJGgBwekEx', NULL, '', 0, NULL, NULL, '2025-08-10 14:19:25', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 3008228102, NULL, '[]', NULL, '2025-08-07 14:19:25', '2025-08-07 14:19:39'),
(19, 'aNvZpLzgIeafhn9AE8LDz4uvz4ckpDHZ', NULL, '', 0, NULL, NULL, '2025-08-20 15:07:24', 0, 0, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', '{\"upload_method\":\"direct\"}', NULL, 323060, NULL, '[]', NULL, '2025-08-17 15:07:24', '2025-08-17 15:07:24');

-- --------------------------------------------------------

--
-- Table structure for table `guest_upload_files`
--

CREATE TABLE `guest_upload_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `guest_upload_id` bigint(20) UNSIGNED NOT NULL,
  `file_entry_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_upload_files`
--

INSERT INTO `guest_upload_files` (`id`, `guest_upload_id`, `file_entry_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-08-06 13:52:00', '2025-08-06 13:52:00'),
(2, 2, 2, '2025-08-06 14:02:50', '2025-08-06 14:02:50'),
(3, 3, 3, '2025-08-06 14:13:30', '2025-08-06 14:13:30'),
(4, 4, 4, '2025-08-06 14:13:30', '2025-08-06 14:13:30'),
(5, 5, 5, '2025-08-06 14:13:30', '2025-08-06 14:13:30'),
(6, 6, 6, '2025-08-06 15:11:51', '2025-08-06 15:11:51'),
(7, 7, 7, '2025-08-06 15:13:54', '2025-08-06 15:13:54'),
(8, 8, 8, '2025-08-06 15:13:54', '2025-08-06 15:13:54'),
(9, 9, 9, NULL, NULL),
(10, 9, 10, NULL, NULL),
(11, 10, 11, NULL, NULL),
(12, 10, 12, NULL, NULL),
(13, 11, 13, NULL, NULL),
(14, 11, 14, NULL, NULL),
(15, 12, 15, NULL, NULL),
(16, 12, 16, NULL, NULL),
(17, 12, 17, NULL, NULL),
(18, 12, 18, NULL, NULL),
(19, 13, 19, NULL, NULL),
(20, 14, 20, NULL, NULL),
(21, 15, 21, NULL, NULL),
(22, 16, 22, NULL, NULL),
(23, 17, 23, NULL, NULL),
(24, 18, 24, NULL, NULL),
(25, 19, 25, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(10) UNSIGNED NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `paid` tinyint(1) NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `notes` text DEFAULT NULL,
  `notified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `localizations`
--

CREATE TABLE `localizations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `language` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `localizations`
--

INSERT INTO `localizations` (`id`, `name`, `created_at`, `updated_at`, `language`) VALUES
(1, 'English', '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'en');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2014_10_12_200000_add_two_factor_columns_to_users_table', 1),
(4, '2015_04_127_156842_create_social_profiles_table', 1),
(5, '2015_04_13_140047_create_files_models_table', 1),
(6, '2015_04_18_134312_create_folders_table', 1),
(7, '2015_05_29_131549_create_settings_table', 1),
(8, '2015_10_23_164355_create_follows_table', 1),
(9, '2016_04_06_140017_add_folder_id_index_to_files_table', 1),
(10, '2016_05_12_190852_create_tags_table', 1),
(11, '2016_05_12_190958_create_taggables_table', 1),
(12, '2016_05_26_170044_create_uploads_table', 1),
(13, '2016_05_27_143158_create_uploadables_table', 1),
(14, '2016_07_14_153703_create_groups_table', 1),
(15, '2016_07_14_153921_create_user_group_table', 1),
(16, '2016_10_17_152159_add_space_available_column_to_users_table', 1),
(17, '2017_07_02_120142_create_pages_table', 1),
(18, '2017_07_11_122825_create_localizations_table', 1),
(19, '2017_08_26_131330_add_private_field_to_settings_table', 1),
(20, '2017_09_17_144728_add_columns_to_users_table', 1),
(21, '2017_09_17_152854_make_password_column_nullable', 1),
(22, '2017_09_30_152855_make_settings_value_column_nullable', 1),
(23, '2017_10_01_152897_add_public_column_to_uploads_table', 1),
(24, '2017_12_04_132911_add_avatar_column_to_users_table', 1),
(25, '2018_01_10_140732_create_subscriptions_table', 1),
(26, '2018_01_10_140746_add_billing_to_users_table', 1),
(27, '2018_01_10_161706_create_billing_plans_table', 1),
(28, '2018_06_05_142932_rename_files_table_to_file_entries', 1),
(29, '2018_06_06_141629_rename_file_entries_table_columns', 1),
(30, '2018_06_07_141630_merge_files_and_folders_tables', 1),
(31, '2018_07_03_114346_create_shareable_links_table', 1),
(32, '2018_07_24_113757_add_available_space_to_billing_plans_table', 1),
(33, '2018_07_24_124254_add_available_space_to_users_table', 1),
(34, '2018_07_26_142339_rename_groups_to_roles', 1),
(35, '2018_07_26_142842_rename_user_role_table_columns_to_roles', 1),
(36, '2018_08_07_124200_rename_uploads_to_file_entries', 1),
(37, '2018_08_07_124327_refactor_file_entries_columns', 1),
(38, '2018_08_07_130653_add_folder_path_column_to_file_entries_table', 1),
(39, '2018_08_07_140328_delete_legacy_root_folders', 1),
(40, '2018_08_07_140330_move_folders_into_file_entries_table', 1),
(41, '2018_08_07_140440_migrate_file_entry_users_to_many_to_many', 1),
(42, '2018_08_10_142251_update_users_table_to_v2', 1),
(43, '2018_08_15_132225_move_uploads_into_subfolders', 1),
(44, '2018_08_16_111525_transform_file_entries_records_to_v2', 1),
(45, '2018_08_31_104145_rename_uploadables_table', 1),
(46, '2018_08_31_104325_rename_file_entry_models_table_columns', 1),
(47, '2018_11_26_171703_add_type_and_title_columns_to_pages_table', 1),
(48, '2018_12_01_144233_change_unique_index_on_tags_table', 1),
(49, '2019_02_16_150049_delete_old_seo_settings', 1),
(50, '2019_02_24_141457_create_jobs_table', 1),
(51, '2019_03_11_162627_add_preview_token_to_file_entries_table', 1),
(52, '2019_03_12_160803_add_thumbnail_column_to_file_entries_table', 1),
(53, '2019_03_16_161836_add_paypal_id_column_to_billing_plans_table', 1),
(54, '2019_05_14_120930_index_description_column_in_file_entries_table', 1),
(55, '2019_06_08_120504_create_custom_domains_table', 1),
(56, '2019_06_13_140318_add_user_id_column_to_pages_table', 1),
(57, '2019_06_15_114320_rename_pages_table_to_custom_pages', 1),
(58, '2019_06_18_133933_create_permissions_table', 1),
(59, '2019_06_18_134203_create_permissionables_table', 1),
(60, '2019_06_18_135822_rename_permissions_columns', 1),
(61, '2019_07_08_122001_create_css_themes_table', 1),
(62, '2019_07_20_141752_create_invoices_table', 1),
(63, '2019_08_19_121112_add_global_column_to_custom_domains_table', 1),
(64, '2019_09_13_141123_change_plan_amount_to_float', 1),
(65, '2019_10_14_171943_add_index_to_username_column', 1),
(66, '2019_10_20_143522_create_comments_table', 1),
(67, '2019_10_23_134520_create_notifications_table', 1),
(68, '2019_11_21_144956_add_resource_id_and_type_to_custom_domains_table', 1),
(69, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(70, '2019_12_14_194512_rename_public_path_column_to_disk_prefix', 1),
(71, '2019_12_24_165237_change_file_size_column_default_value_to_0', 1),
(72, '2019_12_28_190836_update_file_entry_models_table_to_v2', 1),
(73, '2019_12_28_191105_move_user_file_entry_table_records_to_file_entry_models', 1),
(74, '2020_01_26_143733_create_notification_subscriptions_table', 1),
(75, '2020_03_03_140720_add_language_col_to_localizations_table', 1),
(76, '2020_03_03_143142_add_lang_code_to_existing_localizations', 1),
(77, '2020_04_14_163347_add_hidden_column_to_plans_table', 1),
(78, '2020_06_27_180040_add_verified_at_column_to_users_table', 1),
(79, '2020_06_27_180253_move_confirmed_column_to_email_verified_at', 1),
(80, '2020_07_15_144024_fix_issues_with_migration_to_laravel_7', 1),
(81, '2020_07_22_165126_create_workspaces_table', 1),
(82, '2020_07_23_145652_create_workspace_invites_table', 1),
(83, '2020_07_23_164502_create_workspace_user_table', 1),
(84, '2020_07_26_165349_add_columns_to_roles_table', 1),
(85, '2020_07_29_141418_add_workspace_id_column_to_workspaceable_models', 1),
(86, '2020_07_30_152330_add_type_column_to_permissions_table', 1),
(87, '2020_08_29_165057_add_hide_nav_column_to_custom_pages_table', 1),
(88, '2020_12_14_155112_create_table_fcm_tokens', 1),
(89, '2020_12_17_124109_subscribe_users_to_notifications', 1),
(90, '2021_04_22_172459_add_internal_columm_to_roles_table', 1),
(91, '2021_05_03_173446_add_deleted_column_to_comments_table', 1),
(92, '2021_05_12_164940_add_advanced_column_to_permissions_table', 1),
(93, '2021_06_04_143405_add_workspace_id_col_to_custom_domains_table', 1),
(94, '2021_06_04_143406_add_workspace_id_col_to_custom_pages_table', 1),
(95, '2021_06_04_143406_add_workspace_id_col_to_file_entries_table', 1),
(96, '2021_06_05_182202_create_csv_exports_table', 1),
(97, '2021_06_18_161030_rename_gateway_col_in_subscriptions_table', 1),
(98, '2021_06_19_111939_add_owner_id_column_to_file_entries_table', 1),
(99, '2021_06_19_112035_materialize_owner_id_in_file_entries_table', 1),
(100, '2021_07_06_144837_migrate_landing_page_config_to_20', 1),
(101, '2021_07_17_093454_add_created_at_col_to_user_role_table', 1),
(102, '2021_09_30_123758_slugify_tag_name_column', 1),
(103, '2021_10_13_132915_add_token_cols_to_social_profiles_table', 1),
(104, '2022_04_08_122553_change_default_workspace_id_from_null_to_zero', 1),
(105, '2022_04_23_115027_add_id_to_all_menus', 1),
(106, '2022_07_30_181012_transform_landing_page_cta', 1),
(107, '2022_08_10_200344_add_produce_id_column_to_subscriptions_table', 1),
(108, '2022_08_11_160401_create_prices_table', 1),
(109, '2022_08_11_170041_create_products_table', 1),
(110, '2022_08_11_170117_move_billing_plans_to_products_and_prices_tables', 1),
(111, '2022_08_17_184337_add_card_expires_column_to_users_table', 1),
(112, '2022_08_24_192127_migrate_common_settings_to_v3', 1),
(113, '2022_09_03_164633_add_expires_at_column_to_personal_access_tokens_table', 1),
(114, '2022_09_27_124344_change_available_space_column_to_big_int', 1),
(115, '2022_09_28_121423_migrate_notif_settings_from_array_to_obj', 1),
(116, '2022_11_06_115107_increase_file_name_column_length', 1),
(117, '2023_03_17_175502_add_user_id_to_tags_table', 1),
(118, '2023_03_17_180355_change_name_index_to_name_user_id_in_tags_table', 1),
(119, '2023_05_09_124348_create_bans_table', 1),
(120, '2023_05_09_133514_add_banned_at_column_to_users_table', 1),
(121, '2023_05_11_200001_add_two_factor_columns_to_users_table', 1),
(122, '2023_05_13_132948_active_sessions_table', 1),
(123, '2023_05_16_150805_change_social_profiles_token_length', 1),
(124, '2023_06_07_000001_create_pulse_tables', 1),
(125, '2023_06_10_131615_add_pos_and_neg_votes_to_comments_table', 1),
(126, '2023_06_10_132135_add_comment_ratings_table', 1),
(127, '2023_06_11_124655_create_comment_reports_table', 1),
(128, '2023_08_08_103123_add_timestamp_indexes_to_comments_table', 1),
(129, '2023_08_31_124910_update_model_types_from_namespace_to_string', 1),
(130, '2023_09_14_172633_create_failed_jobs_table', 1),
(131, '2023_12_10_124446_upgrade_css_themes_table_to_v3', 1),
(132, '2023_12_18_141540_add_search_indices_to_users_table', 1),
(133, '2023_12_19_122804_add_uuid_column_to_failed_jobs_table', 1),
(134, '2023_12_23_121618_encrypt_secret_settings', 1),
(135, '2024_01_05_000001_create_guest_uploads_table', 1),
(136, '2024_02_05_103042_change_avatar_column_to_text', 1),
(137, '2024_05_08_131134_add_gateway_status_column_to_subscriptions_table', 1),
(138, '2024_05_08_151815_increase_uuid_column_length_in_invoices_table', 1),
(139, '2024_05_10_151600_add_paypal_id_to_users_table', 1),
(140, '2024_05_12_133925_create_schedule_log_table', 1),
(141, '2024_05_15_123455_create_outgoing_email_log_table', 1),
(142, '2024_05_16_142030_create_otp_codes_table', 1),
(143, '2024_05_23_134009_add_logs_menu_item_to_admin_menu', 1),
(144, '2024_06_05_122254_add_notified_column_to_invoices_table', 1),
(145, '2024_06_15_123230_create_jobs_table', 1),
(146, '2024_07_27_153953_add_order_column_to_roles_table', 1),
(147, '2024_08_09_132933_add_type_column_to_css_themes_table', 1),
(148, '2024_08_26_125216_rename_avatar_to_image_in_users_table', 1),
(149, '2024_09_15_134634_make_owner_id_in_file_entries_table_nullable', 1),
(150, '2024_10_18_124509_rename_jpg_thumbnails_to_png', 1),
(151, '2025_01_15_120000_add_guest_columns_to_shareable_links', 1),
(152, '2025_01_15_120001_update_guest_uploads_table_corrected', 1),
(153, '2025_01_15_120002_seed_guest_upload_settings', 1),
(154, '2025_01_16_000001_recreate_guest_uploads_table_for_quick_share', 1),
(155, '2025_08_05_161402_drop_guest_uploads_table_if_exists', 1),
(156, '2025_08_06_083214_recreate_guest_uploads_table_after_drop', 1),
(157, '2025_08_06_083215_create_guest_upload_files_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_subscriptions`
--

CREATE TABLE `notification_subscriptions` (
  `id` char(36) NOT NULL,
  `notif_id` varchar(5) NOT NULL,
  `user_id` int(11) NOT NULL,
  `channels` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `outgoing_email_log`
--

CREATE TABLE `outgoing_email_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message_id` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'not-sent',
  `from` varchar(255) NOT NULL,
  `to` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `mime` mediumblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissionables`
--

CREATE TABLE `permissionables` (
  `id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(11) NOT NULL,
  `permissionable_id` int(11) NOT NULL,
  `permissionable_type` varchar(40) NOT NULL,
  `restrictions` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissionables`
--

INSERT INTO `permissionables` (`id`, `permission_id`, `permissionable_id`, `permissionable_type`, `restrictions`) VALUES
(1, 4, 4, 'role', '[]'),
(2, 9, 4, 'role', '[]'),
(3, 18, 4, 'role', '[]'),
(4, 22, 4, 'role', '[]'),
(5, 26, 4, 'role', '[]'),
(6, 32, 4, 'role', '[]'),
(7, 37, 4, 'role', '[]'),
(8, 42, 4, 'role', '[]'),
(9, 48, 4, 'role', '[]'),
(10, 49, 4, 'role', '[]'),
(11, 52, 4, 'role', '[]'),
(12, 9, 5, 'role', '[]'),
(13, 22, 5, 'role', '[]'),
(14, 26, 5, 'role', '[]'),
(15, 32, 5, 'role', '[]'),
(16, 37, 5, 'role', '[]'),
(17, 48, 5, 'role', '[]');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(30) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `group` varchar(30) NOT NULL,
  `restrictions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'sitewide',
  `advanced` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `display_name`, `description`, `group`, `restrictions`, `created_at`, `updated_at`, `type`, `advanced`) VALUES
(1, 'admin.access', 'Access Admin', 'Required in order to access any admin area page.', 'admin', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(2, 'appearance.update', 'Update Appearance', 'Allows access to appearance editor.', 'admin', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(3, 'admin', 'Super Admin', 'Give all permissions to user.', 'admin', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(4, 'api.access', 'Access Api', 'Required in order for users to be able to use the API.', 'api', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(5, 'roles.view', 'View Roles', 'Allow viewing ALL roles, regardless of who is the owner.', 'roles', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(6, 'roles.create', 'Create Roles', 'Allow creating new roles, regardless of who is the owner.', 'roles', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(7, 'roles.update', 'Update Roles', 'Allow updating ALL roles, regardless of who is the owner.', 'roles', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(8, 'roles.delete', 'Delete Roles', 'Allow deleting ALL roles, regardless of who is the owner.', 'roles', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(9, 'custom_pages.view', 'View Custom Pages', 'Allow viewing of all pages on the site, regardless of who created them. User can view their own pages without this permission.', 'custom_pages', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(10, 'custom_pages.create', 'Create Custom Pages', 'Allow creating new custom pages, regardless of who is the owner.', 'custom_pages', '[{\"name\":\"count\",\"type\":\"number\",\"description\":\"Maximum number of pages user will be able to create. Leave empty for unlimited.\"}]', '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(11, 'custom_pages.update', 'Update Custom Pages', 'Allow editing of all pages on the site, regardless of who created them. User can edit their own pages without this permission.', 'custom_pages', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(12, 'custom_pages.delete', 'Delete Custom Pages', 'Allow deleting of all pages on the site, regardless of who created them. User can delete their own pages without this permission.', 'custom_pages', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(13, 'custom_domains.view', 'View Custom Domains', 'Allow viewing all domains on the site, regardless of who created them. User can view their own domains without this permission.', 'custom_domains', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(14, 'custom_domains.create', 'Create Custom Domains', 'Allow user to connect their own custom domains.', 'custom_domains', '[{\"name\":\"count\",\"type\":\"number\",\"description\":\"Maximum number of domains user will be able to create. Leave empty for unlimited.\"}]', '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(15, 'custom_domains.update', 'Update Custom Domains', 'Allow editing all domains on the site, regardless of who created them. User can edit their own domains without this permission.', 'custom_domains', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(16, 'custom_domains.delete', 'Delete Custom Domains', 'Allow deleting all domains on the site, regardless of who created them. User can delete their own domains without this permission.', 'custom_domains', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(17, 'files.view', 'View Files', 'Allow viewing all uploaded files on the site. Users can view their own uploads without this permission.', 'files', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(18, 'files.create', 'Create Files', 'Allow uploading files on the site. This permission is used by any page where it is possible for user to upload files.', 'files', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(19, 'files.update', 'Update Files', 'Allow editing all uploaded files on the site. Users can edit their own uploads without this permission.', 'files', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(20, 'files.delete', 'Delete Files', 'Allow deleting all uploaded files on the site. Users can delete their own uploads (where applicable) without this permission.', 'files', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(21, 'files.download', 'Download Files', 'Allow downloading all uploaded files on the site. Users can download their own uploads (where applicable) without this permission.', 'files', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(22, 'users.view', 'View Users', 'Allow viewing user profile pages on the site. User can view their own profile without this permission.', 'users', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(23, 'users.create', 'Create Users', 'Allow creating users from admin area. Users can register for new accounts without this permission. Registration can be disabled from settings page.', 'users', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(24, 'users.update', 'Update Users', 'Allow editing details of any user on the site. User can edit their own details without this permission.', 'users', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(25, 'users.delete', 'Delete Users', 'Allow deleting any user on the site. User can request deletion of their own account without this permission.', 'users', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(26, 'localizations.view', 'View Localizations', 'Allow viewing ALL localizations, regardless of who is the owner.', 'localizations', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(27, 'localizations.create', 'Create Localizations', 'Allow creating new localizations, regardless of who is the owner.', 'localizations', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(28, 'localizations.update', 'Update Localizations', 'Allow updating ALL localizations, regardless of who is the owner.', 'localizations', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(29, 'localizations.delete', 'Delete Localizations', 'Allow deleting ALL localizations, regardless of who is the owner.', 'localizations', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(30, 'settings.view', 'View Settings', 'Allow viewing ALL settings, regardless of who is the owner.', 'settings', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(31, 'settings.update', 'Update Settings', 'Allow updating ALL settings, regardless of who is the owner.', 'settings', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(32, 'plans.view', 'View Plans', 'Allow viewing ALL plans, regardless of who is the owner.', 'plans', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(33, 'plans.create', 'Create Plans', 'Allow creating new plans, regardless of who is the owner.', 'plans', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(34, 'plans.update', 'Update Plans', 'Allow updating ALL plans, regardless of who is the owner.', 'plans', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(35, 'plans.delete', 'Delete Plans', 'Allow deleting ALL plans, regardless of who is the owner.', 'plans', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(36, 'invoices.view', 'View Invoices', 'Allow viewing ALL invoices, regardless of who is the owner.', 'invoices', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(37, 'tags.view', 'View Tags', 'Allow viewing ALL tags, regardless of who is the owner.', 'tags', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(38, 'tags.create', 'Create Tags', 'Allow creating new tags, regardless of who is the owner.', 'tags', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(39, 'tags.update', 'Update Tags', 'Allow updating ALL tags, regardless of who is the owner.', 'tags', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(40, 'tags.delete', 'Delete Tags', 'Allow deleting ALL tags, regardless of who is the owner.', 'tags', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 1),
(41, 'workspaces.view', 'View Workspaces', 'Allow viewing ALL workspaces, regardless of who is the owner.', 'workspaces', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(42, 'workspaces.create', 'Create Workspaces', 'Allow creating new workspaces, regardless of who is the owner.', 'workspaces', '[{\"name\":\"count\",\"type\":\"number\",\"description\":\"Maximum number of workspaces user will be able to create. Leave empty for unlimited.\"},{\"name\":\"member_count\",\"type\":\"number\",\"description\":\"Maximum number of members workspace is allowed to have.\"}]', '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(43, 'workspaces.update', 'Update Workspaces', 'Allow updating ALL workspaces, regardless of who is the owner.', 'workspaces', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(44, 'workspaces.delete', 'Delete Workspaces', 'Allow deleting ALL workspaces, regardless of who is the owner.', 'workspaces', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(45, 'workspace_members.invite', 'Invite Members', 'Allow user to invite new members into a workspace.', 'workspace_members', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'workspace', 0),
(46, 'workspace_members.update', 'Update Members', 'Allow user to change role of other members.', 'workspace_members', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'workspace', 0),
(47, 'workspace_members.delete', 'Delete Members', 'Allow user to remove members from workspace.', 'workspace_members', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'workspace', 0),
(48, 'links.view', 'View Links', 'Allow viewing ALL links, regardless of who is the owner.', 'links', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(49, 'links.create', 'Create Links', 'Allow creating new links, regardless of who is the owner.', 'links', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(50, 'links.update', 'Update Links', 'Allow updating ALL links, regardless of who is the owner.', 'links', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(51, 'links.delete', 'Delete Links', 'Allow deleting ALL links, regardless of who is the owner.', 'links', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0),
(52, 'notifications.subscribe', 'Subscribe Notifications', 'Allows agents to subscribe to various conversation notifications.', 'notifications', NULL, '2025-08-06 13:19:55', '2025-08-06 13:19:55', 'sitewide', 0);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prices`
--

CREATE TABLE `prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(13,2) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `interval` varchar(255) NOT NULL DEFAULT 'month',
  `interval_count` int(11) NOT NULL DEFAULT 1,
  `product_id` int(11) NOT NULL,
  `stripe_id` varchar(50) DEFAULT NULL,
  `paypal_id` varchar(50) DEFAULT NULL,
  `default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  `feature_list` text DEFAULT NULL,
  `position` smallint(6) NOT NULL DEFAULT 0,
  `recommended` tinyint(1) NOT NULL DEFAULT 0,
  `free` tinyint(1) NOT NULL DEFAULT 0,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `available_space` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pulse_aggregates`
--

CREATE TABLE `pulse_aggregates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bucket` int(10) UNSIGNED NOT NULL,
  `period` mediumint(8) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `key` mediumtext NOT NULL,
  `key_hash` binary(16) GENERATED ALWAYS AS (unhex(md5(`key`))) VIRTUAL,
  `aggregate` varchar(255) NOT NULL,
  `value` decimal(20,2) NOT NULL,
  `count` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pulse_entries`
--

CREATE TABLE `pulse_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `timestamp` int(10) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `key` mediumtext NOT NULL,
  `key_hash` binary(16) GENERATED ALWAYS AS (unhex(md5(`key`))) VIRTUAL,
  `value` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pulse_values`
--

CREATE TABLE `pulse_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `timestamp` int(10) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `key` mediumtext NOT NULL,
  `key_hash` binary(16) GENERATED ALWAYS AS (unhex(md5(`key`))) VIRTUAL,
  `value` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `legacy_permissions` text DEFAULT NULL,
  `default` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `guests` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `internal` tinyint(1) NOT NULL DEFAULT 0,
  `order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'sitewide'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `legacy_permissions`, `default`, `guests`, `internal`, `order`, `created_at`, `updated_at`, `description`, `type`) VALUES
(1, 'Workspace Admin', NULL, 0, 0, 0, 0, '2025-08-06 13:17:22', '2025-08-06 13:17:22', 'Manage workspace content, members, settings and invite new members.', 'workspace'),
(2, 'Workspace Editor', NULL, 0, 0, 0, 0, '2025-08-06 13:17:22', '2025-08-06 13:17:22', 'Add, edit, move and delete workspace files.', 'workspace'),
(3, 'Workspace Contributor', NULL, 0, 0, 0, 0, '2025-08-06 13:17:22', '2025-08-06 13:17:22', 'Add and edit files.', 'workspace'),
(4, 'users', NULL, 1, 0, 1, 0, '2025-08-06 13:19:55', '2025-08-06 13:19:55', NULL, 'sitewide'),
(5, 'guests', NULL, 0, 1, 1, 0, '2025-08-06 13:19:55', '2025-08-06 13:19:55', NULL, 'sitewide');

-- --------------------------------------------------------

--
-- Table structure for table `schedule_log`
--

CREATE TABLE `schedule_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `command` varchar(255) NOT NULL,
  `output` text DEFAULT NULL,
  `ran_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duration` int(10) UNSIGNED NOT NULL,
  `count_in_last_hour` int(11) NOT NULL DEFAULT 1,
  `exit_code` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `private` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `name`, `value`, `created_at`, `updated_at`, `private`) VALUES
(1, 'guest_uploads.enabled', 'true', '2025-08-06 13:17:10', '2025-08-06 13:17:10', 0),
(2, 'guest_uploads.max_size_mb', '100', '2025-08-06 13:17:10', '2025-08-06 13:17:10', 0),
(3, 'guest_uploads.retention_days', '30', '2025-08-06 13:17:10', '2025-08-06 13:17:10', 0);

-- --------------------------------------------------------

--
-- Table structure for table `shareable_links`
--

CREATE TABLE `shareable_links` (
  `id` int(10) UNSIGNED NOT NULL,
  `hash` varchar(30) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `entry_id` int(10) UNSIGNED NOT NULL,
  `allow_edit` tinyint(1) NOT NULL DEFAULT 0,
  `allow_download` tinyint(1) NOT NULL DEFAULT 1,
  `password` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_guest` tinyint(1) NOT NULL DEFAULT 0,
  `guest_deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `social_profiles`
--

CREATE TABLE `social_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `service_name` varchar(20) NOT NULL,
  `user_service_id` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `price_id` varchar(255) NOT NULL,
  `gateway_name` varchar(255) NOT NULL DEFAULT 'none',
  `gateway_id` varchar(255) DEFAULT NULL,
  `gateway_status` varchar(40) NOT NULL DEFAULT 'active',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `renews_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `product_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taggables`
--

CREATE TABLE `taggables` (
  `id` int(10) UNSIGNED NOT NULL,
  `tag_id` int(10) UNSIGNED NOT NULL,
  `taggable_id` int(10) UNSIGNED NOT NULL,
  `taggable_type` varchar(80) NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'custom',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `display_name`, `type`, `created_at`, `updated_at`, `user_id`) VALUES
(1, 'starred', 'Starred', 'label', '2025-08-06 13:17:22', '2025-08-06 13:17:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `uploads`
--

CREATE TABLE `uploads` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(36) NOT NULL,
  `file_size` varchar(255) NOT NULL,
  `mime` varchar(255) NOT NULL,
  `extension` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `public` tinyint(1) NOT NULL DEFAULT 0,
  `path` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `legacy_permissions` text DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(60) DEFAULT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `card_brand` varchar(30) DEFAULT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `space_available` bigint(20) UNSIGNED DEFAULT NULL,
  `language` varchar(6) DEFAULT NULL,
  `country` varchar(40) DEFAULT NULL,
  `timezone` varchar(30) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `stripe_id` varchar(255) DEFAULT NULL,
  `paypal_id` varchar(50) DEFAULT NULL,
  `available_space` bigint(20) UNSIGNED DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `card_expires` varchar(10) DEFAULT NULL,
  `banned_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workspaces`
--

CREATE TABLE `workspaces` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workspace_invites`
--

CREATE TABLE `workspace_invites` (
  `id` char(36) NOT NULL,
  `image` varchar(80) DEFAULT NULL,
  `workspace_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `email` varchar(80) NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workspace_user`
--

CREATE TABLE `workspace_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `workspace_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED DEFAULT NULL,
  `is_owner` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_sessions`
--
ALTER TABLE `active_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `active_sessions_session_id_index` (`session_id`),
  ADD KEY `active_sessions_token_index` (`token`),
  ADD KEY `active_sessions_user_id_index` (`user_id`);

--
-- Indexes for table `bans`
--
ALTER TABLE `bans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bans_bannable_type_bannable_id_index` (`bannable_type`,`bannable_id`),
  ADD KEY `bans_created_by_type_created_by_id_index` (`created_by_type`,`created_by_id`),
  ADD KEY `bans_expired_at_index` (`expired_at`);

--
-- Indexes for table `billing_plans`
--
ALTER TABLE `billing_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `billing_plans_hidden_index` (`hidden`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_parent_id_index` (`parent_id`),
  ADD KEY `comments_path_index` (`path`),
  ADD KEY `comments_user_id_index` (`user_id`),
  ADD KEY `comments_commentable_id_index` (`commentable_id`),
  ADD KEY `comments_commentable_type_index` (`commentable_type`),
  ADD KEY `comments_deleted_index` (`deleted`),
  ADD KEY `comments_upvotes_index` (`upvotes`),
  ADD KEY `comments_downvotes_index` (`downvotes`),
  ADD KEY `comments_created_at_index` (`created_at`),
  ADD KEY `comments_updated_at_index` (`updated_at`);

--
-- Indexes for table `comment_reports`
--
ALTER TABLE `comment_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comment_reports_user_id_index` (`user_id`),
  ADD KEY `comment_reports_comment_id_index` (`comment_id`);

--
-- Indexes for table `comment_votes`
--
ALTER TABLE `comment_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `comment_votes_user_ip_comment_id_unique` (`user_ip`,`comment_id`),
  ADD UNIQUE KEY `comment_votes_user_id_comment_id_unique` (`user_id`,`comment_id`),
  ADD KEY `comment_votes_user_id_index` (`user_id`),
  ADD KEY `comment_votes_comment_id_index` (`comment_id`),
  ADD KEY `comment_votes_user_ip_index` (`user_ip`);

--
-- Indexes for table `css_themes`
--
ALTER TABLE `css_themes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `css_themes_default_light_index` (`default_light`),
  ADD KEY `css_themes_default_dark_index` (`default_dark`),
  ADD KEY `css_themes_user_id_index` (`user_id`),
  ADD KEY `css_themes_type_index` (`type`);

--
-- Indexes for table `csv_exports`
--
ALTER TABLE `csv_exports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `csv_exports_cache_name_unique` (`cache_name`),
  ADD KEY `csv_exports_user_id_index` (`user_id`);

--
-- Indexes for table `custom_domains`
--
ALTER TABLE `custom_domains`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `custom_domains_host_unique` (`host`),
  ADD KEY `custom_domains_user_id_index` (`user_id`),
  ADD KEY `custom_domains_created_at_index` (`created_at`),
  ADD KEY `custom_domains_updated_at_index` (`updated_at`),
  ADD KEY `custom_domains_global_index` (`global`),
  ADD KEY `custom_domains_resource_id_index` (`resource_id`),
  ADD KEY `custom_domains_resource_type_index` (`resource_type`),
  ADD KEY `custom_domains_workspace_id_index` (`workspace_id`);

--
-- Indexes for table `custom_pages`
--
ALTER TABLE `custom_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pages_slug_unique` (`slug`),
  ADD KEY `pages_type_index` (`type`),
  ADD KEY `pages_user_id_index` (`user_id`),
  ADD KEY `custom_pages_workspace_id_index` (`workspace_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fcm_tokens`
--
ALTER TABLE `fcm_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fcm_tokens_device_id_user_id_unique` (`device_id`,`user_id`),
  ADD KEY `fcm_tokens_device_id_index` (`device_id`),
  ADD KEY `fcm_tokens_token_index` (`token`),
  ADD KEY `fcm_tokens_user_id_index` (`user_id`);

--
-- Indexes for table `file_entries`
--
ALTER TABLE `file_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `files_user_id_index` (`user_id`),
  ADD KEY `files_folder_id_index` (`parent_id`),
  ADD KEY `file_entries_name_index` (`name`),
  ADD KEY `file_entries_path_index` (`path`),
  ADD KEY `file_entries_type_index` (`type`),
  ADD KEY `file_entries_public_index` (`public`),
  ADD KEY `file_entries_description_index` (`description`),
  ADD KEY `file_entries_workspace_id_index` (`workspace_id`),
  ADD KEY `file_entries_owner_id_index` (`owner_id`);

--
-- Indexes for table `file_entry_models`
--
ALTER TABLE `file_entry_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uploadable_unique` (`file_entry_id`,`model_id`,`model_type`),
  ADD KEY `file_entry_models_owner_index` (`owner`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `folders_user_id_index` (`user_id`),
  ADD KEY `folders_share_id_index` (`share_id`),
  ADD KEY `folders_folder_id_index` (`folder_id`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `follows_follower_id_followed_id_unique` (`follower_id`,`followed_id`);

--
-- Indexes for table `guest_uploads`
--
ALTER TABLE `guest_uploads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guest_uploads_hash_unique` (`hash`),
  ADD KEY `guest_uploads_file_entry_id_foreign` (`file_entry_id`),
  ADD KEY `guest_uploads_expires_at_created_at_index` (`expires_at`,`created_at`),
  ADD KEY `guest_uploads_link_id_index` (`link_id`),
  ADD KEY `guest_uploads_expires_at_index` (`expires_at`);

--
-- Indexes for table `guest_upload_files`
--
ALTER TABLE `guest_upload_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guest_upload_files_guest_upload_id_file_entry_id_unique` (`guest_upload_id`,`file_entry_id`),
  ADD KEY `guest_upload_files_file_entry_id_foreign` (`file_entry_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoices_subscription_id_index` (`subscription_id`),
  ADD KEY `invoices_uuid_index` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_reserved_at_index` (`queue`,`reserved_at`);

--
-- Indexes for table `localizations`
--
ALTER TABLE `localizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `localizations_name_index` (`name`),
  ADD KEY `localizations_language_index` (`language`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `notification_subscriptions`
--
ALTER TABLE `notification_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_subscriptions_notif_id_index` (`notif_id`),
  ADD KEY `notification_subscriptions_user_id_index` (`user_id`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otp_codes_user_id_index` (`user_id`),
  ADD KEY `otp_codes_expires_at_index` (`expires_at`);

--
-- Indexes for table `outgoing_email_log`
--
ALTER TABLE `outgoing_email_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `outgoing_email_log_message_id_unique` (`message_id`),
  ADD KEY `outgoing_email_log_status_index` (`status`),
  ADD KEY `outgoing_email_log_from_index` (`from`),
  ADD KEY `outgoing_email_log_to_index` (`to`),
  ADD KEY `outgoing_email_log_created_at_index` (`created_at`),
  ADD KEY `outgoing_email_log_updated_at_index` (`updated_at`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `permissionables`
--
ALTER TABLE `permissionables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissionable_unique` (`permission_id`,`permissionable_id`,`permissionable_type`),
  ADD KEY `permissionables_permission_id_index` (`permission_id`),
  ADD KEY `permissionables_permissionable_id_index` (`permissionable_id`),
  ADD KEY `permissionables_permissionable_type_index` (`permissionable_type`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`),
  ADD KEY `permissions_advanced_index` (`advanced`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `prices`
--
ALTER TABLE `prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prices_product_id_index` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_position_index` (`position`),
  ADD KEY `products_free_index` (`free`),
  ADD KEY `products_hidden_index` (`hidden`);

--
-- Indexes for table `pulse_aggregates`
--
ALTER TABLE `pulse_aggregates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pulse_b_p_t_a_k_unique` (`bucket`,`period`,`type`,`aggregate`,`key_hash`),
  ADD KEY `pulse_aggregates_period_bucket_index` (`period`,`bucket`),
  ADD KEY `pulse_aggregates_type_index` (`type`),
  ADD KEY `pulse_aggregates_period_type_aggregate_bucket_index` (`period`,`type`,`aggregate`,`bucket`);

--
-- Indexes for table `pulse_entries`
--
ALTER TABLE `pulse_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pulse_entries_timestamp_index` (`timestamp`),
  ADD KEY `pulse_entries_type_index` (`type`),
  ADD KEY `pulse_entries_key_hash_index` (`key_hash`),
  ADD KEY `pulse_entries_timestamp_type_key_hash_value_index` (`timestamp`,`type`,`key_hash`,`value`);

--
-- Indexes for table `pulse_values`
--
ALTER TABLE `pulse_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pulse_values_type_key_hash_unique` (`type`,`key_hash`),
  ADD KEY `pulse_values_timestamp_index` (`timestamp`),
  ADD KEY `pulse_values_type_index` (`type`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `groups_name_unique` (`name`),
  ADD KEY `groups_default_index` (`default`),
  ADD KEY `groups_guests_index` (`guests`),
  ADD KEY `roles_internal_index` (`internal`),
  ADD KEY `roles_order_index` (`order`);

--
-- Indexes for table `schedule_log`
--
ALTER TABLE `schedule_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_log_command_index` (`command`),
  ADD KEY `schedule_log_ran_at_index` (`ran_at`),
  ADD KEY `schedule_log_duration_index` (`duration`),
  ADD KEY `schedule_log_exit_code_index` (`exit_code`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_name_unique` (`name`),
  ADD KEY `settings_private_index` (`private`);

--
-- Indexes for table `shareable_links`
--
ALTER TABLE `shareable_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shareable_links_hash_unique` (`hash`),
  ADD KEY `shareable_links_user_id_index` (`user_id`),
  ADD KEY `shareable_links_entry_id_index` (`entry_id`);

--
-- Indexes for table `social_profiles`
--
ALTER TABLE `social_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `social_profiles_user_id_service_name_unique` (`user_id`,`service_name`),
  ADD UNIQUE KEY `social_profiles_service_name_user_service_id_unique` (`service_name`,`user_service_id`),
  ADD KEY `social_profiles_user_id_index` (`user_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscriptions_gateway_id_unique` (`gateway_id`),
  ADD KEY `subscriptions_user_id_index` (`user_id`),
  ADD KEY `subscriptions_plan_id_index` (`price_id`),
  ADD KEY `subscriptions_gateway_index` (`gateway_name`),
  ADD KEY `subscriptions_product_id_index` (`product_id`),
  ADD KEY `subscriptions_gateway_status_index` (`gateway_status`);

--
-- Indexes for table `taggables`
--
ALTER TABLE `taggables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `taggable_unique` (`tag_id`,`taggable_id`,`user_id`,`taggable_type`),
  ADD KEY `taggables_tag_id_index` (`tag_id`),
  ADD KEY `taggables_taggable_id_index` (`taggable_id`),
  ADD KEY `taggables_taggable_type_index` (`taggable_type`),
  ADD KEY `taggables_user_id_index` (`user_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tags_name_user_id_type_unique` (`name`,`user_id`,`type`),
  ADD KEY `tags_type_index` (`type`),
  ADD KEY `tags_created_at_index` (`created_at`),
  ADD KEY `tags_updated_at_index` (`updated_at`),
  ADD KEY `tags_user_id_index` (`user_id`);

--
-- Indexes for table `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uploads_file_name_unique` (`file_name`),
  ADD KEY `uploads_name_index` (`name`),
  ADD KEY `uploads_user_id_index` (`user_id`),
  ADD KEY `uploads_public_index` (`public`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_paypal_id_unique` (`paypal_id`),
  ADD KEY `users_created_at_index` (`created_at`),
  ADD KEY `users_updated_at_index` (`updated_at`),
  ADD KEY `users_username_index` (`username`),
  ADD KEY `users_first_name_index` (`first_name`),
  ADD KEY `users_last_name_index` (`last_name`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_group_user_id_group_id_unique` (`user_id`,`role_id`);

--
-- Indexes for table `workspaces`
--
ALTER TABLE `workspaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workspaces_owner_id_index` (`owner_id`),
  ADD KEY `workspaces_created_at_index` (`created_at`),
  ADD KEY `workspaces_updated_at_index` (`updated_at`);

--
-- Indexes for table `workspace_invites`
--
ALTER TABLE `workspace_invites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workspace_invites_workspace_id_index` (`workspace_id`),
  ADD KEY `workspace_invites_user_id_index` (`user_id`),
  ADD KEY `workspace_invites_email_index` (`email`),
  ADD KEY `workspace_invites_role_id_index` (`role_id`);

--
-- Indexes for table `workspace_user`
--
ALTER TABLE `workspace_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `workspace_user_workspace_id_user_id_unique` (`workspace_id`,`user_id`),
  ADD KEY `workspace_user_user_id_index` (`user_id`),
  ADD KEY `workspace_user_workspace_id_index` (`workspace_id`),
  ADD KEY `workspace_user_role_id_index` (`role_id`),
  ADD KEY `workspace_user_is_owner_index` (`is_owner`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_sessions`
--
ALTER TABLE `active_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bans`
--
ALTER TABLE `bans`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billing_plans`
--
ALTER TABLE `billing_plans`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comment_reports`
--
ALTER TABLE `comment_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comment_votes`
--
ALTER TABLE `comment_votes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `css_themes`
--
ALTER TABLE `css_themes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `csv_exports`
--
ALTER TABLE `csv_exports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_domains`
--
ALTER TABLE `custom_domains`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_pages`
--
ALTER TABLE `custom_pages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fcm_tokens`
--
ALTER TABLE `fcm_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_entries`
--
ALTER TABLE `file_entries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `file_entry_models`
--
ALTER TABLE `file_entry_models`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `follows`
--
ALTER TABLE `follows`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest_uploads`
--
ALTER TABLE `guest_uploads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `guest_upload_files`
--
ALTER TABLE `guest_upload_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `localizations`
--
ALTER TABLE `localizations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=158;

--
-- AUTO_INCREMENT for table `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `outgoing_email_log`
--
ALTER TABLE `outgoing_email_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissionables`
--
ALTER TABLE `permissionables`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prices`
--
ALTER TABLE `prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pulse_aggregates`
--
ALTER TABLE `pulse_aggregates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pulse_entries`
--
ALTER TABLE `pulse_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pulse_values`
--
ALTER TABLE `pulse_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `schedule_log`
--
ALTER TABLE `schedule_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shareable_links`
--
ALTER TABLE `shareable_links`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `social_profiles`
--
ALTER TABLE `social_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taggables`
--
ALTER TABLE `taggables`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `uploads`
--
ALTER TABLE `uploads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `workspaces`
--
ALTER TABLE `workspaces`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `workspace_user`
--
ALTER TABLE `workspace_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guest_uploads`
--
ALTER TABLE `guest_uploads`
  ADD CONSTRAINT `guest_uploads_file_entry_id_foreign` FOREIGN KEY (`file_entry_id`) REFERENCES `file_entries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_upload_files`
--
ALTER TABLE `guest_upload_files`
  ADD CONSTRAINT `guest_upload_files_file_entry_id_foreign` FOREIGN KEY (`file_entry_id`) REFERENCES `file_entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_upload_files_guest_upload_id_foreign` FOREIGN KEY (`guest_upload_id`) REFERENCES `guest_uploads` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
