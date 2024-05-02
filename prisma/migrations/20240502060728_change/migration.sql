/*
  Warnings:

  - You are about to drop the column `userId` on the `Trigger` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Trigger` DROP FOREIGN KEY `Trigger_userId_fkey`;

-- AlterTable
ALTER TABLE `Trigger` DROP COLUMN `userId`;
