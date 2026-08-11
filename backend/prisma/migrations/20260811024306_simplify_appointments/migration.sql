-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_businessId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "clientId",
DROP COLUMN "endTime",
DROP COLUMN "serviceId",
DROP COLUMN "startTime",
DROP COLUMN "status",
ADD COLUMN     "clientName" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL;

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Service";

-- DropEnum
DROP TYPE "AppointmentStatus";
