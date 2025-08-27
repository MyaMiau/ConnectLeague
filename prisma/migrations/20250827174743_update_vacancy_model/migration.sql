-- AlterTable
ALTER TABLE "public"."vacancies" ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "elos" TEXT[],
ADD COLUMN     "positions" TEXT[],
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Aberta',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "userTypes" TEXT[];

-- CreateTable
CREATE TABLE "public"."VacancyFavorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "vacancyId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VacancyFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VacancyFavorite_userId_vacancyId_key" ON "public"."VacancyFavorite"("userId", "vacancyId");

-- AddForeignKey
ALTER TABLE "public"."VacancyFavorite" ADD CONSTRAINT "VacancyFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VacancyFavorite" ADD CONSTRAINT "VacancyFavorite_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "public"."vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
