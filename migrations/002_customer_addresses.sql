-- Migration: Customer Addresses
-- Description: Creates the customer_addresses table and ensures only one default address per customer
-- Safe to run multiple times (idempotent without recreating)

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    house TEXT NOT NULL,
    street TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin TEXT NOT NULL,
    landmark TEXT,
    type TEXT NOT NULL DEFAULT 'Home',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically set other addresses to non-default when a new default is set
CREATE OR REPLACE FUNCTION public.handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.customer_addresses
    SET is_default = false
    WHERE customer_id = NEW.customer_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_single_default_address ON public.customer_addresses;
CREATE TRIGGER ensure_single_default_address
BEFORE INSERT OR UPDATE ON public.customer_addresses
FOR EACH ROW
EXECUTE FUNCTION public.handle_default_address();

-- Enable RLS
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies safely without recreating if they exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Customers can view their own addresses'
    ) THEN
        CREATE POLICY "Customers can view their own addresses" 
        ON public.customer_addresses FOR SELECT 
        USING (
          customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Customers can insert their own addresses'
    ) THEN
        CREATE POLICY "Customers can insert their own addresses" 
        ON public.customer_addresses FOR INSERT 
        WITH CHECK (
          customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Customers can update their own addresses'
    ) THEN
        CREATE POLICY "Customers can update their own addresses" 
        ON public.customer_addresses FOR UPDATE 
        USING (
          customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Customers can delete their own addresses'
    ) THEN
        CREATE POLICY "Customers can delete their own addresses" 
        ON public.customer_addresses FOR DELETE 
        USING (
          customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
          )
        );
    END IF;
END $$;
