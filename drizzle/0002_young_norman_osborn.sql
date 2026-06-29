CREATE TABLE `exhibitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`titleKo` varchar(200) NOT NULL,
	`titleEn` varchar(200) NOT NULL DEFAULT '',
	`description` text,
	`curatorName` varchar(100),
	`subtitle` varchar(300),
	`startDate` timestamp,
	`endDate` timestamp,
	`maxArtists` int NOT NULL DEFAULT 10,
	`status` enum('draft','active','closed') NOT NULL DEFAULT 'draft',
	`coverImageUrl` text,
	`coverImageKey` text,
	`genre` varchar(100),
	`season` varchar(50),
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exhibitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `exhibitions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `artists` ADD `exhibitionId` int;