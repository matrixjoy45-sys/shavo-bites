-- SHAVO BITES Database Setup Script (v2.0 Enterprise)
-- Paste this script into your Supabase SQL Editor and hit RUN.

-- 1. DROP EXISTING TABLES/VIEWS
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 2. CREATE SETTINGS TABLE (Scalable JSONB Store)
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE MENU ITEMS TABLE
CREATE TABLE public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    "spiceLevel" TEXT,
    ingredients JSONB,
    is_active BOOLEAN DEFAULT true NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE CUSTOMERS TABLE
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    house TEXT,
    street TEXT,
    city TEXT,
    pin TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create customer profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (user_id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. CREATE ORDERS TABLE
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    special_instructions TEXT,
    status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE ADMIN ROLES TABLE
CREATE TABLE public.admin_roles (
    user_id UUID PRIMARY KEY, -- References auth.users(id)
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read access for public
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu items" ON public.menu_items FOR SELECT USING (deleted_at IS NULL AND is_active = true);
CREATE POLICY "Allow anon insert to customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert to orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Admin Access Policies (Simple implementation assuming Admins use Supabase Client)
CREATE POLICY "Allow auth all on settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on menu items" ON public.menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on admin_roles" ON public.admin_roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on audit_logs" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- SUPABASE STORAGE BUCKET
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Allow public read access on menu-images" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "Allow authenticated insert to menu-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update to menu-images" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete from menu-images" ON storage.objects FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Allow users to insert own profile image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Allow users to update own profile image" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==========================================
-- INSERT DEFAULT MENU DATA
-- ==========================================
INSERT INTO public.menu_items (id, name, description, price, category, image, "spiceLevel", ingredients) VALUES
('p1', 'Chicken Shawarma', 'Juicy spiced chicken, fresh vegetables, garlic sauce wrapped in premium pita.', 12.99, 'shawarma', '/assets/images/hero.webp', 'medium', '["Chicken", "Garlic Sauce", "Pickles", "Fries inside", "Pita"]'),
('p2', 'Beef Shawarma', 'Tender beef slices, tahini sauce, parsley, and onions in fresh pita.', 14.99, 'shawarma', '/assets/images/beef.webp', 'mild', '["Beef", "Tahini", "Onions", "Parsley", "Tomatoes"]'),
('p3', 'Squid Shawarma', 'Crispy fried calamari and grilled squid rings with our signature garlic sauce.', 16.99, 'shawarma', '/assets/images/squid.webp', 'spicy', '["Squid", "Garlic Sauce", "Lettuce", "Spicy Mayo"]'),
('p4', 'Premium Dates Shake', 'Rich dates blended with premium milk, topped with whipped cream and nuts.', 8.99, 'drinks', '/assets/images/dates.webp', 'none', '["Dates", "Milk", "Cream", "Nuts"]'),
('p5', 'French Fries', 'Crispy golden fries seasoned with our special spice blend.', 4.99, 'sides', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80', 'mild', '["Potatoes", "Salt", "Spices"]');

INSERT INTO public.settings (key, value, type) VALUES
('store_status', '{"isOpen": true}', 'general'),
('delivery_fee', '{"fee": 2.99}', 'general'),
('contact', '{"phone": "+1 234 567 8900", "whatsapp": "+1 234 567 8900"}', 'general');
