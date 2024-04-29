-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `command_prefix` VARCHAR(191) NOT NULL,
    `script_prefix` VARCHAR(191) NOT NULL,
    `admin_prefix` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
