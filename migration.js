const supabaseUrl = 'https://nrwufrmqzzdqzvoabtdo.supabase.co';
const supabaseKey = 'sb_publishable_4vUpAuXve2HY4yGbGzAzPw_hw_Xpieh';

async function migrate() {
  // 1. Sign up a new user to get an auth token
  const email = 'migration_' + Date.now() + '@example.com';
  console.log('Signing up as ' + email);
  const authRes = await fetch(supabaseUrl + '/auth/v1/signup', {
    method: 'POST',
    headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  }).then(r => r.json());
  
  if (authRes.error) {
    console.error("Auth Error", authRes.error);
    return;
  }
  const token = authRes.session.access_token;
  const authHeaders = {
    apikey: supabaseKey,
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  // 2. Fetch menu items
  const items = await fetch(supabaseUrl + '/rest/v1/menu_items', { headers: authHeaders }).then(r => r.json());
  
  let updatedCount = 0;
  
  // 3. Update menu items
  for (const item of items) {
    if (item.image && item.image.startsWith('/assets/')) {
      let newImage = '';
      if (item.image.includes('hero.webp')) newImage = 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?auto=format&fit=crop&w=500&q=80';
      else if (item.image.includes('beef.webp')) newImage = 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=500&q=80';
      else if (item.image.includes('squid.webp')) newImage = 'https://images.unsplash.com/photo-1599487405705-8eb0db2e2e31?auto=format&fit=crop&w=500&q=80';
      else if (item.image.includes('dates.webp')) newImage = 'https://images.unsplash.com/photo-1572490122747-3968b75bf699?auto=format&fit=crop&w=500&q=80';
      else newImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';
      
      const updateRes = await fetch(supabaseUrl + '/rest/v1/menu_items?id=eq.' + item.id, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ image: newImage })
      }).then(r => r.json());
      
      console.log('Updated item ' + item.id + ' to ' + newImage);
      updatedCount++;
    }
  }
  
  // 4. Insert Settings
  const logoUrl = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80';
  const bannerUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
  
  const logoRes = await fetch(supabaseUrl + '/rest/v1/settings', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'logo',
      key: 'logo_' + Date.now(),
      value: { image_url: logoUrl, is_active: true }
    })
  }).then(r => r.json());
  
  const bannerRes = await fetch(supabaseUrl + '/rest/v1/settings', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'banner',
      key: 'banner_' + Date.now(),
      value: { image_url: bannerUrl, is_active: true }
    })
  }).then(r => r.json());
  
  console.log('--- MIGRATION COMPLETE ---');
  console.log('Menu items updated: ' + updatedCount);
  console.log('Final Logo URL: ' + logoUrl);
  console.log('Final Banner URL: ' + bannerUrl);
}

migrate().catch(console.error);
