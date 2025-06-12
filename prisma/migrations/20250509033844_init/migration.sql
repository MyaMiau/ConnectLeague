/*
  Warnings:

  - You are about to drop the `avaliacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `candidaturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vagas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "avaliacoes" DROP CONSTRAINT "avaliacoes_avaliado_id_fkey";

-- DropForeignKey
ALTER TABLE "avaliacoes" DROP CONSTRAINT "avaliacoes_avaliador_id_fkey";

-- DropForeignKey
ALTER TABLE "candidaturas" DROP CONSTRAINT "candidaturas_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "candidaturas" DROP CONSTRAINT "candidaturas_vaga_id_fkey";

-- DropForeignKey
ALTER TABLE "vagas" DROP CONSTRAINT "vagas_organizacao_id_fkey";

-- DropTable
DROP TABLE "avaliacoes";

-- DropTable
DROP TABLE "candidaturas";

-- DropTable
DROP TABLE "usuarios";

-- DropTable
DROP TABLE "vagas";

-- CreateTable
CREATE TABLE "evaluations" (
    "id" SERIAL NOT NULL,
    "evaluator_id" INTEGER NOT NULL,
    "evaluated_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "vacancy_id" INTEGER NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacancies" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluated_id_fkey" FOREIGN KEY ("evaluated_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
