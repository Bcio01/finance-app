-- Rename AppSettings to settings so Prisma matches the application data proxy.
ALTER TABLE "AppSettings" RENAME TO "settings";

-- Keep the persisted security and onboarding fields aligned with the app model.
ALTER TABLE "settings" ADD COLUMN "pin" TEXT;
ALTER TABLE "settings" ADD COLUMN "isInitialized" BOOLEAN NOT NULL DEFAULT false;
