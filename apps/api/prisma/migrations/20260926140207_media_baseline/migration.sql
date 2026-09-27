/*
  Warnings:

  - The primary key for the `ProductImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `mediaId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_pkey",
DROP COLUMN "id",
DROP COLUMN "key",
DROP COLUMN "provider",
DROP COLUMN "url",
ADD COLUMN     "mediaId" TEXT NOT NULL,
ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("productId", "mediaId");

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" "StorageProvider" NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_key_key" ON "Media"("key");

-- CreateIndex
CREATE INDEX "ProductImage_mediaId_idx" ON "ProductImage"("mediaId");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
