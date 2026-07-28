import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables for Service Role.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let updatedCount = 0;

    // 1. Fetch menu items
    const { data: items, error: fetchErr } = await supabase.from('menu_items').select('*');
    if (fetchErr) throw fetchErr;

    // 2. Update menu items with local paths
    for (const item of items) {
      if (item.image && item.image.startsWith('/assets/')) {
        let newImage = '';
        if (item.image.includes('hero.webp')) newImage = 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?auto=format&fit=crop&w=500&q=80';
        else if (item.image.includes('beef.webp')) newImage = 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=500&q=80';
        else if (item.image.includes('squid.webp')) newImage = 'https://images.unsplash.com/photo-1599487405705-8eb0db2e2e31?auto=format&fit=crop&w=500&q=80';
        else if (item.image.includes('dates.webp')) newImage = 'https://images.unsplash.com/photo-1572490122747-3968b75bf699?auto=format&fit=crop&w=500&q=80';
        else newImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';
        
        const { error: updateErr } = await supabase
          .from('menu_items')
          .update({ image: newImage })
          .eq('id', item.id);
          
        if (updateErr) throw updateErr;
        console.log(`Updated item ${item.id} to ${newImage}`);
        updatedCount++;
      }
    }

    // 3. Insert Settings
    const logoUrl = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80';
    const bannerUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

    // Insert logo
    const { error: logoErr } = await supabase.from('settings').insert({
      type: 'logo',
      key: 'logo_' + Date.now(),
      value: { image_url: logoUrl, is_active: true }
    });
    if (logoErr) throw logoErr;

    // Insert banner
    const { error: bannerErr } = await supabase.from('settings').insert({
      type: 'banner',
      key: 'banner_' + Date.now(),
      value: { image_url: bannerUrl, is_active: true }
    });
    if (bannerErr) throw bannerErr;

    return new Response(JSON.stringify({ 
      success: true, 
      updatedCount, 
      logoUrl, 
      bannerUrl 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
