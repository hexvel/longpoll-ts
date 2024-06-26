-- AlterTable
ALTER TABLE `User` ADD COLUMN `cover_image` VARCHAR(191) NOT NULL DEFAULT 'photo-224389197_457239529',
    ADD COLUMN `list` JSON NOT NULL,
    ADD COLUMN `rank` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `squad` VARCHAR(191) NOT NULL DEFAULT 'hexvel',
    MODIFY `username` VARCHAR(191) NOT NULL DEFAULT 'UserName',
    MODIFY `command_prefix` VARCHAR(191) NOT NULL DEFAULT '.н',
    MODIFY `script_prefix` VARCHAR(191) NOT NULL DEFAULT '.нс',
    MODIFY `admin_prefix` VARCHAR(191) NOT NULL DEFAULT '.на';
