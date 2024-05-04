-- CreateTable
CREATE TABLE `Template` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cmid` INTEGER NOT NULL,
    `attachment` VARCHAR(191) NULL,

    UNIQUE INDEX `Template_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
