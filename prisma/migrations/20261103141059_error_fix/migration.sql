/*
  Warnings:

  - You are about to drop the column `altNmae` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "altNmae",
ADD COLUMN     "altName" TEXT[] DEFAULT ARRAY[]::TEXT[];
