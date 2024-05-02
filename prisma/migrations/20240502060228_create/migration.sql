/*
  Warnings:

  - You are about to drop the column `prefixId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `prefixId`;

-- CreateTable
CREATE TABLE `Trigger` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `word` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Trigger_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Trigger` ADD CONSTRAINT `Trigger_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
