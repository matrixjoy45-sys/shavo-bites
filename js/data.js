import { supabase } from './supabase.js';

// Fallback Mock Database (in case Supabase is not configured yet)
const mockProducts = [
    {
        id: 'p1',
        name: 'Chicken Shawarma',
        description: 'Juicy spiced chicken, fresh vegetables, garlic sauce wrapped in premium pita.',
        price: 12.99,
        category: 'shawarma',
        image: '/assets/images/hero.webp', 
        spiceLevel: 'medium',
        ingredients: ['Chicken', 'Garlic Sauce', 'Pickles', 'Fries inside', 'Pita']
    },
    {
        id: 'p2',
        name: 'Beef Shawarma',
        description: 'Tender beef slices, tahini sauce, parsley, and onions in fresh pita.',
        price: 14.99,
        category: 'shawarma',
        image: '/assets/images/beef.webp',
        spiceLevel: 'mild',
        ingredients: ['Beef', 'Tahini', 'Onions', 'Parsley', 'Tomatoes']
    },
    {
        id: 'p3',
        name: 'Squid Shawarma',
        description: 'Crispy fried calamari and grilled squid rings with our signature garlic sauce.',
        price: 16.99,
        category: 'shawarma',
        image: '/assets/images/squid.webp',
        spiceLevel: 'spicy',
        ingredients: ['Squid', 'Garlic Sauce', 'Lettuce', 'Spicy Mayo']
    },
    {
        id: 'p4',
        name: 'Premium Dates Shake',
        description: 'Rich dates blended with premium milk, topped with whipped cream and nuts.',
        price: 8.99,
        category: 'drinks',
        image: '/assets/images/dates.webp',
        spiceLevel: 'none',
        ingredients: ['Dates', 'Milk', 'Cream', 'Nuts']
    },
    {
        id: 'p5',
        name: 'French Fries',
        description: 'Crispy golden fries seasoned with our special spice blend.',
        price: 4.99,
        category: 'sides',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80',
        spiceLevel: 'mild',
        ingredients: ['Potatoes', 'Salt', 'Spices']
    }
];

const mockExtras = [
    { id: 'e1', name: 'Extra Cheese', price: 1.50 },
    { id: 'e2', name: 'Extra Chicken', price: 3.00 },
    { id: 'e3', name: 'Extra Beef', price: 4.00 },
    { id: 'e4', name: 'Extra Garlic Sauce', price: 0.50 },
    { id: 'e5', name: 'Spicy Mayo', price: 0.50 }
];

export const fetchMenuItems = async () => {
    if (!supabase) {
        return mockProducts;
    }

    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .is('deleted_at', null)
            .eq('is_active', true)
            .order('category', { ascending: true });
            
        if (error) throw error;
        
        if (data && data.length > 0) {
            // Ensure ingredients are parsed if stored as JSON/Array
            return data.map(item => ({
                ...item,
                ingredients: typeof item.ingredients === 'string' ? JSON.parse(item.ingredients) : item.ingredients || []
            }));
        }
        
        return mockProducts; // Fallback if table is empty
    } catch (e) {
        console.error('Error fetching menu items:', e);
        return mockProducts;
    }
};

export const fetchExtras = async () => {
    if (!supabase) return mockExtras;
    
    // We can assume extras might be in 'settings' or a separate 'extras' table
    // For now, checking a dedicated 'settings' table where type='extra'
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('type', 'extra');
            
        if (error) throw error;
        if (data && data.length > 0) return data;
        return mockExtras;
    } catch (e) {
        console.error('Error fetching extras:', e);
        return mockExtras;
    }
};
