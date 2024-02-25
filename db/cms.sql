-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 183.83.189.23:3308
-- Generation Time: Feb 25, 2024 at 08:57 PM
-- Server version: 8.0.36-0ubuntu0.22.04.1
-- PHP Version: 7.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cms`
--

-- --------------------------------------------------------

--
-- Table structure for table `Comment`
--

CREATE TABLE `Comment` (
  `commentId` bigint NOT NULL,
  `postId` bigint NOT NULL,
  `userId` bigint NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'published, pending, deleted',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Comment`
--

INSERT INTO `Comment` (`commentId`, `postId`, `userId`, `text`, `status`, `createdAt`) VALUES
(1, 1, 1, 'Asdasdad', 'published', '2024-02-25 20:51:21'),
(2, 1, 1, 'asda', 'pending', '2024-02-25 20:56:19');

-- --------------------------------------------------------

--
-- Table structure for table `Otp`
--

CREATE TABLE `Otp` (
  `otpId` bigint NOT NULL,
  `sendTo` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'email',
  `code` int NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'register, login, forgot-password',
  `expAt` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'pending, used, expired',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Otp`
--

INSERT INTO `Otp` (`otpId`, `sendTo`, `method`, `code`, `action`, `expAt`, `status`, `createdAt`) VALUES
(1, 'yyugi64@gmail.com', 'email', 117460, 'register', '2024-02-20 14:27:17', 'used', '2024-02-20 13:57:18'),
(2, 'yyugi64@gmail.com', 'email', 303734, 'login', '2024-02-20 14:27:53', 'expired', '2024-02-20 13:57:54'),
(3, 'yyugi64@gmail.com', 'email', 166979, 'login', '2024-02-20 14:28:08', 'used', '2024-02-20 13:58:09'),
(4, 'yyugi64@gmail.com', 'email', 726988, 'forgot-password', '2024-02-20 14:08:47', 'used', '2024-02-20 13:58:48');

-- --------------------------------------------------------

--
-- Table structure for table `Post`
--

CREATE TABLE `Post` (
  `postId` bigint NOT NULL,
  `tagId` bigint NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'drafted' COMMENT 'published, archived, drafted, deleted',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Post`
--

INSERT INTO `Post` (`postId`, `tagId`, `title`, `description`, `banner`, `status`, `createdAt`) VALUES
(1, 1, 'Test', 'Lorem', 'img', 'published', '2024-02-25 16:25:30'),
(2, 2, 'Test2', 'Lorem2', 'img', 'published', '2024-02-25 16:25:30'),
(3, 3, 'Test3', 'Lorem3', 'img', 'published', '2024-02-25 16:25:30');

-- --------------------------------------------------------

--
-- Table structure for table `PostLike`
--

CREATE TABLE `PostLike` (
  `postLikeId` bigint NOT NULL,
  `postId` bigint NOT NULL,
  `userId` bigint NOT NULL,
  `status` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'liked' COMMENT 'liked, unliked',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `PostLike`
--

INSERT INTO `PostLike` (`postLikeId`, `postId`, `userId`, `status`, `createdAt`) VALUES
(1, 2, 1, 'liked', '2024-02-25 20:38:17'),
(2, 2, 2, 'liked', '2024-02-25 20:39:51'),
(3, 3, 2, 'liked', '2024-02-25 20:39:51');

-- --------------------------------------------------------

--
-- Table structure for table `Tag`
--

CREATE TABLE `Tag` (
  `tagId` bigint NOT NULL,
  `tagName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'drafted' COMMENT 'published, archived, drafted, deleted',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Tag`
--

INSERT INTO `Tag` (`tagId`, `tagName`, `status`, `createdAt`) VALUES
(1, 'Tech', 'published', '2024-02-25 15:49:18'),
(2, 'Fashion', 'published', '2024-02-25 15:49:29'),
(3, 'Food', 'published', '2024-02-25 15:49:41');

-- --------------------------------------------------------

--
-- Table structure for table `Token`
--

CREATE TABLE `Token` (
  `tokenId` bigint NOT NULL,
  `userId` bigint NOT NULL,
  `tokenType` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ACCESS, REFRESH',
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Token`
--

INSERT INTO `Token` (`tokenId`, `userId`, `tokenType`, `token`, `expiresAt`, `createdAt`) VALUES
(1, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODQzNzQ0OSwiZXhwIjoxNzA4NTIzODQ5fQ.6oMO6Y9d1TgIGbxpvnuClVc19XnMQoW_AypuQLsx-rs', '2024-02-21 13:57:29', '2024-02-20 13:57:30'),
(2, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODQzNzQ0OSwiZXhwIjoxNzExMDI5NDQ5fQ.YD9ozNI8Kv4X9NB_qCoXEZnEM0H4DVv4xEDZHt4oWDg', '2024-03-21 13:57:29', '2024-02-20 13:57:30'),
(3, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODQzNzUwOSwiZXhwIjoxNzA4NTIzOTA5fQ.WIYMZ9rpZ12pWdoT_-Yp6PeSFziFf0UYNhzFaP5lkBY', '2024-02-21 13:58:29', '2024-02-20 13:58:30'),
(4, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODQzNzUwOSwiZXhwIjoxNzExMDI5NTA5fQ.BVe7ifv4JBCs0UCAuYd932D0FnXZ1ny2_rnfPON2iWU', '2024-03-21 13:58:29', '2024-02-20 13:58:30'),
(5, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODQzNzU0MCwiZXhwIjoxNzA4NTIzOTQwfQ.7z00dWqZL2AdjfzYG17azCf8eusoe34-M5xOSOkzHjQ', '2024-02-21 13:59:00', '2024-02-20 13:59:01'),
(6, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODQzNzU0MCwiZXhwIjoxNzExMDI5NTQwfQ.elXbFZ7ZnO_TxCOvjlfaAv4db8FUOephflO1FcGOpVQ', '2024-03-21 13:59:00', '2024-02-20 13:59:01'),
(7, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODc1Nzg3OSwiZXhwIjoxNzA4ODQ0Mjc5fQ.gVJfXxS8K2oV5YCoi0uroZ7agOOiqUp7mUGYVrjEVvI', '2024-02-25 06:57:59', '2024-02-24 06:58:00'),
(8, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODc1Nzg3OSwiZXhwIjoxNzExMzQ5ODc5fQ.ywHM-bdDhIlRdB1HfC5BSwvPowDMr_4ndm_9P8VfBhg', '2024-03-25 06:57:59', '2024-02-24 06:58:00'),
(9, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODc1OTEwNywiZXhwIjoxNzA4ODQ1NTA3fQ.zOauDngq2KuTLPekBNA1Aw6l_epPjpPMZ7vy_fAg9uk', '2024-02-25 07:18:27', '2024-02-24 07:18:27'),
(10, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODc1OTEwNywiZXhwIjoxNzExMzUxMTA3fQ.Wdqgx6V_363eYBN9Cllkfpcmb6MJS88fjD5FUFztoGI', '2024-03-25 07:18:27', '2024-02-24 07:18:27'),
(11, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg3NDkwOSwiZXhwIjoxNzA4OTYxMzA5fQ.8fqlKPeqHZYrr8pranit2JPPciGCKHMJEmfXSGUk0e8', '2024-02-26 15:28:29', '2024-02-25 15:28:29'),
(12, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg3NDkwOSwiZXhwIjoxNzExNDY2OTA5fQ.wp5XGnhx8o3WgaYAcZhK7lv_RpkNV4ZXf0eKKk-wUf4', '2024-03-26 15:28:29', '2024-02-25 15:28:29'),
(13, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg3NTc2MSwiZXhwIjoxNzA4OTYyMTYxfQ.RP9SBFHA_WgRsDtXYSwNTLneRgnsls6pctA9-1O3pFE', '2024-02-26 15:42:41', '2024-02-25 15:42:41'),
(14, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg3NTc2MSwiZXhwIjoxNzExNDY3NzYxfQ.1z6OoJofFNOYjm23KyeIIXOwRcANNNHjQsPRFYYYXas', '2024-03-26 15:42:41', '2024-02-25 15:42:41'),
(15, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg3ODE2NiwiZXhwIjoxNzA4OTY0NTY2fQ._8XNcJvmVlEtWGIH0YMIZWcnAPQVHTj6Rap9DQbMCEQ', '2024-02-26 16:22:46', '2024-02-25 16:22:46'),
(16, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg3ODE2NiwiZXhwIjoxNzExNDcwMTY2fQ.ngUaiArC43f912PCMpTpSQusjLy03OKZF_QG93D7Hxo', '2024-03-26 16:22:46', '2024-02-25 16:22:46'),
(17, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg4ODU1NCwiZXhwIjoxNzA4OTc0OTU0fQ.zp4XNl8AaQdi3_PA-rG0UiKkxlDUgTbFkTIF6o2FrLo', '2024-02-26 19:15:54', '2024-02-25 19:15:54'),
(18, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsImlhdCI6MTcwODg4ODU1NCwiZXhwIjoxNzExNDgwNTU0fQ.IASNhCrnkXrQ_g3iT0IeP9-4EMTcI6bIDg-Ky5xbNxU', '2024-03-26 19:15:54', '2024-02-25 19:15:54'),
(19, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA4ODg5Mjc5LCJleHAiOjE3MDg5NzU2Nzl9.yI-RGe_La_z33iSPaczTu2aYxSH3CznMrnAMvnnLoW4', '2024-02-26 19:27:59', '2024-02-25 19:27:59'),
(20, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA4ODg5Mjc5LCJleHAiOjE3MTE0ODEyNzl9.vlfGB8ifdQXmDSRur3b22Utx1hmwFckZtEPUb1b0ucM', '2024-03-26 19:27:59', '2024-02-25 19:27:59'),
(21, 1, 'ACCESS', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA4ODk0MjQ1LCJleHAiOjE3MDg5ODA2NDV9.0z89-CfCgaCbbYuDaweiMi9gC6S5Asmwhkgf7syHoEs', '2024-02-26 20:50:45', '2024-02-25 20:50:45'),
(22, 1, 'REFRESH', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJZdWdpIiwiZW1haWwiOiJ5eXVnaTY0QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA4ODk0MjQ1LCJleHAiOjE3MTE0ODYyNDV9.CEbKDdGygZp87l6CdK4udPkzP8H_0DWGFoypMzjzFpU', '2024-03-26 20:50:45', '2024-02-25 20:50:45');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `userId` bigint NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`userId`, `name`, `email`, `password`, `isVerified`, `createdAt`) VALUES
(1, 'Yugi', 'yyugi64@gmail.com', '$2b$12$1g9gp37y4zeuotwXdrJ5A.RC1jLmAjtJLIXrjZcGHj5oVNWSznP6e', 1, '2024-02-20 13:57:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Comment`
--
ALTER TABLE `Comment`
  ADD PRIMARY KEY (`commentId`);

--
-- Indexes for table `Otp`
--
ALTER TABLE `Otp`
  ADD PRIMARY KEY (`otpId`);

--
-- Indexes for table `Post`
--
ALTER TABLE `Post`
  ADD PRIMARY KEY (`postId`);

--
-- Indexes for table `PostLike`
--
ALTER TABLE `PostLike`
  ADD PRIMARY KEY (`postLikeId`);

--
-- Indexes for table `Tag`
--
ALTER TABLE `Tag`
  ADD PRIMARY KEY (`tagId`);

--
-- Indexes for table `Token`
--
ALTER TABLE `Token`
  ADD PRIMARY KEY (`tokenId`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Comment`
--
ALTER TABLE `Comment`
  MODIFY `commentId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Otp`
--
ALTER TABLE `Otp`
  MODIFY `otpId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Post`
--
ALTER TABLE `Post`
  MODIFY `postId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `PostLike`
--
ALTER TABLE `PostLike`
  MODIFY `postLikeId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Tag`
--
ALTER TABLE `Tag`
  MODIFY `tagId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Token`
--
ALTER TABLE `Token`
  MODIFY `tokenId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
  MODIFY `userId` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
