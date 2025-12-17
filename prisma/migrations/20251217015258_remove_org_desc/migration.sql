/*
  Warnings:

  - You are about to drop the column `cnpj` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `orgDesc` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "cnpj",
DROP COLUMN "orgDesc";
