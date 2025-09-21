-- Add bank transfer fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS "bankTransferReceipt" TEXT,
ADD COLUMN IF NOT EXISTS "bankTransferStatus" TEXT,
ADD COLUMN IF NOT EXISTS "adminNotes" TEXT,
ADD COLUMN IF NOT EXISTS "adminApprovedBy" TEXT,
ADD COLUMN IF NOT EXISTS "adminApprovedAt" TIMESTAMP;

-- Update existing orders to have default values
UPDATE orders 
SET "bankTransferStatus" = NULL,
    "adminNotes" = NULL,
    "adminApprovedBy" = NULL,
    "adminApprovedAt" = NULL
WHERE "bankTransferStatus" IS NULL;