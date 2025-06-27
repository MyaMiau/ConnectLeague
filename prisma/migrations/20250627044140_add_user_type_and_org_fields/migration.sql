/*
  Warnings:

  - Added the required column `type` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cnpj" VARCHAR(30),
ADD COLUMN     "orgDesc" TEXT,
ADD COLUMN     "orgName" VARCHAR(100),
ADD COLUMN     "type" VARCHAR(50) NOT NULL,
ALTER COLUMN "role" DROP NOT NULL;
