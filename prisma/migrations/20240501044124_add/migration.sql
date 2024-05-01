/*
  Warnings:

  - You are about to drop the column `admin_prefix` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `command_prefix` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `script_prefix` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[prefixId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `admin_prefix`,
    DROP COLUMN `command_prefix`,
    DROP COLUMN `script_prefix`,
    ADD COLUMN `prefixId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Prefix` (
    `id` INTEGER NOT NULL,
    `command` VARCHAR(191) NOT NULL DEFAULT '.н',
    `script` VARCHAR(191) NOT NULL DEFAULT '.нс',
    `admin` VARCHAR(191) NOT NULL DEFAULT '.на',
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Prefix_id_key`(`id`),
    UNIQUE INDEX `Prefix_userId_key`(`userId`),
    UNIQUE INDEX `Prefix_command_userId_key`(`command`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_prefixId_key` ON `User`(`prefixId`);

-- AddForeignKey
ALTER TABLE `Prefix` ADD CONSTRAINT `Prefix_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
