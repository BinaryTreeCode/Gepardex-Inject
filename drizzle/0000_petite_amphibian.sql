CREATE TABLE `chats` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`title` varchar(100) NOT NULL DEFAULT 'Nuevo Chat',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensajes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`chat_id` bigint unsigned NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mensajes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`price` bigint NOT NULL DEFAULT 0,
	`max_messages` bigint NOT NULL DEFAULT 100,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`admin` boolean NOT NULL DEFAULT false,
	`plan_id` bigint unsigned,
	`username` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `chats` ADD CONSTRAINT `chats_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE no action ON UPDATE no action;