-- ================================================
-- SHAVO BITES - Phase 6 Sprint 1 Migration
-- Customer Authentication Schema Changes
-- Safe to run multiple times (idempotent)
-- ================================================

-- 1. Add missing columns to customers table
-- (IF NOT EXISTS is not supported for ALTER TABLE ADD COLUMN in PostgreSQL,
--  so we use DO blocks with conditional checks)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN user_id UUID REFERENCES auth.users(id) UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Make phone nullable (it was NOT NULL before, customers may not have phone at signup)
ALTER TABLE public.customers ALTER COLUMN phone DROP NOT NULL;

-- 3. Create or replace the trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (user_id, email, name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger (drop first to make idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Add index on user_id for fast lookups (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- 6. Add RLS policy for customers to read/update their own row
-- (Use DO block to check existence first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile"
            ON public.customers FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON public.customers FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Create profile-images storage bucket (IF NOT EXISTS via ON CONFLICT)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Add profile-images storage policies (check existence first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects' AND policyname = 'Allow public read access on profile-images'
    ) THEN
        CREATE POLICY "Allow public read access on profile-images"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'profile-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects' AND policyname = 'Allow users to upload own profile image'
    ) THEN
        CREATE POLICY "Allow users to upload own profile image"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'profile-images'
                AND auth.role() = 'authenticated'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects' AND policyname = 'Allow users to update own profile image'
    ) THEN
        CREATE POLICY "Allow users to update own profile image"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'profile-images'
                AND auth.role() = 'authenticated'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

-- ================================================
-- DONE. This migration is safe to run repeatedly.
-- ================================================
