CREATE TABLE `artists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL DEFAULT '',
	`specialty` text,
	`bio` text,
	`tools` text,
	`profileImageUrl` text,
	`profileImageKey` text,
	`sns` varchar(500),
	`displayOrder` int DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`titleKo` varchar(200) NOT NULL,
	`titleEn` varchar(200) NOT NULL DEFAULT '',
	`description` text,
	`year` varchar(10) DEFAULT '2025',
	`medium` varchar(200),
	`mediaType` enum('image','video') NOT NULL DEFAULT 'image',
	`mediaUrl` text,
	`mediaKey` text,
	`thumbnailUrl` text,
	`thumbnailKey` text,
	`tags` text,
	`displayOrder` int DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artworks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
