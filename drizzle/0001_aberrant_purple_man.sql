CREATE TABLE `artists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`bio` text,
	`genre` varchar(100),
	`category` varchar(100) NOT NULL,
	`priceFrom` varchar(50),
	`city` varchar(100),
	`country` varchar(100),
	`avatarUrl` text,
	`coverUrl` text,
	`photo2` text,
	`photo3` text,
	`video1` text,
	`video2` text,
	`video3` text,
	`instagram` varchar(255),
	`spotify` varchar(255),
	`website` varchar(255),
	`subscriptionPlan` enum('free','standard','pro') NOT NULL DEFAULT 'free',
	`verified` boolean NOT NULL DEFAULT false,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventDate` varchar(50) NOT NULL,
	`eventTime` varchar(50),
	`venue` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`country` varchar(100) NOT NULL,
	`imageUrl` text,
	`ticketUrl` text,
	`price` varchar(50),
	`contactEmail` varchar(255) NOT NULL,
	`contactPhone` varchar(20),
	`submitterName` varchar(255),
	`published` boolean NOT NULL DEFAULT false,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`eventId` int,
	`senderName` varchar(255) NOT NULL,
	`senderEmail` varchar(255) NOT NULL,
	`senderPhone` varchar(20),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('pending','read','replied','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`billingPeriod` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`maxPhotos` int NOT NULL DEFAULT 1,
	`maxVideos` int NOT NULL DEFAULT 0,
	`maxEvents` int NOT NULL DEFAULT 5,
	`features` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isArtist` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `artists` ADD CONSTRAINT `artists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_artistId_artists_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_artistId_artists_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;