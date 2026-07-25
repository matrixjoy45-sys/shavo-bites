import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Initialize the Supabase client
// If the keys are still the placeholders, this will throw an error, 
// so we'll wrap it to prevent crashing if the user hasn't configured it yet.
let client = null;

try {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase credentials not configured. Please update js/config.js');
    }
} catch (e) {
    console.error('Failed to initialize Supabase client:', e);
}

export const supabase = client;
