-- Migration: Add delivery_address snapshot to orders table
-- Description: Adds a JSONB column to permanently store the address exactly as it was during checkout
-- Idempotent script

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address JSONB;
    END IF;
END $$;
