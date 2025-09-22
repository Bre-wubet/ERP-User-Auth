-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
