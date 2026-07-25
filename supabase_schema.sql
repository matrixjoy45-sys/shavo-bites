-- SHAVO BITES Database Setup Script
-- Paste this script into your Supabase SQL Editor and hit RUN.

-- 1. DROP EXISTING TABLES/VIEWS (If they exist) to avoid conflicts
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP VIEW IF EXISTS public.orders CASCADE;
DROP VIEW IF EXISTS public.customers CASCADE;
DROP VIEW IF EXISTS public.menu_items CASCADE;
DROP VIEW IF EXISTS public.settings CASCADE;

-- 2. CREATE SETTINGS TABLE
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE CUSTOMERS TABLE
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    house TEXT,
    street TEXT,
    city TEXT,
    pin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. READ POLICIES (Allow anyone to read the menu and settings)
CREATE POLICY "Allow public read access to settings" 
ON public.settings FOR SELECT USING (true);

CREATE POLICY "Allow public read access to menu items" 
ON public.menu_items FOR SELECT USING (true);

-- 7. INSERT POLICIES (Allow anonymous users to place orders)
-- This allows anyone (even users without an account) to insert a customer profile.
CREATE POLICY "Allow anon insert to customers" 
ON public.customers FOR INSERT 
WITH CHECK (true);

-- This allows anyone to insert an order.
CREATE POLICY "Allow anon insert to orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 8. READ POLICIES FOR CUSTOMERS/ORDERS (Optional)
-- This allows users to read ONLY their own orders if you implement auth later.
-- For anon checkouts, we restrict public reads so people can't scrape customer data.
-- (No public SELECT policy on customers/orders is provided for privacy).


-- ==========================================
-- INSERT DEFAULT MENU DATA
-- ==========================================
INSERT INTO public.menu_items (id, name, description, price, category, image, "spiceLevel", ingredients) VALUES
('p1', 'Chicken Shawarma', 'Juicy spiced chicken, fresh vegetables, garlic sauce wrapped in premium pita.', 12.99, 'shawarma', './assets/images/hero.jpg', 'medium', '["Chicken", "Garlic Sauce", "Pickles", "Fries inside", "Pita"]'),
('p2', 'Beef Shawarma', 'Tender beef slices, tahini sauce, parsley, and onions in fresh pita.', 14.99, 'shawarma', './assets/images/beef.jpg', 'mild', '["Beef", "Tahini", "Onions", "Parsley", "Tomatoes"]'),
('p3', 'Squid Shawarma', 'Crispy fried calamari and grilled squid rings with our signature garlic sauce.', 16.99, 'shawarma', './assets/images/squid.jpg', 'spicy', '["Squid", "Garlic Sauce", "Lettuce", "Spicy Mayo"]'),
('p4', 'Premium Dates Shake', 'Rich dates blended with premium milk, topped with whipped cream and nuts.', 8.99, 'drinks', './assets/images/dates.jpg', 'none', '["Dates", "Milk", "Cream", "Nuts"]'),
('p5', 'French Fries', 'Crispy golden fries seasoned with our special spice blend.', 4.99, 'sides', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80', 'mild', '["Potatoes", "Salt", "Spices"]');

INSERT INTO public.settings (key, value, type) VALUES
('store_status', '{"isOpen": true}', 'general'),
('delivery_fee', '{"fee": 2.99}', 'general');
