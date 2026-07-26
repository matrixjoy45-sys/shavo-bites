import{createClient as Y}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const e of i.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&s(e)}).observe(document,{childList:!0,subtree:!0});function r(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(t){if(t.ep)return;t.ep=!0;const i=r(t);fetch(t.href,i)}})();const A="https://nrwufrmqzzdqzvoabtdo.supabase.co",G="sb_publishable_4vUpAuXve2HY4yGbGzAzPw_hw_Xpieh";let P=null;try{A!=="YOUR_SUPABASE_URL"&&(P=Y(A,G))}catch(n){console.error("Failed to initialize Supabase client:",n)}const d=P,S=[{id:"p1",name:"Chicken Shawarma",description:"Juicy spiced chicken, fresh vegetables, garlic sauce wrapped in premium pita.",price:12.99,category:"shawarma",image:"/assets/images/hero.webp",spiceLevel:"medium",ingredients:["Chicken","Garlic Sauce","Pickles","Fries inside","Pita"]},{id:"p2",name:"Beef Shawarma",description:"Tender beef slices, tahini sauce, parsley, and onions in fresh pita.",price:14.99,category:"shawarma",image:"/assets/images/beef.webp",spiceLevel:"mild",ingredients:["Beef","Tahini","Onions","Parsley","Tomatoes"]},{id:"p3",name:"Squid Shawarma",description:"Crispy fried calamari and grilled squid rings with our signature garlic sauce.",price:16.99,category:"shawarma",image:"/assets/images/squid.webp",spiceLevel:"spicy",ingredients:["Squid","Garlic Sauce","Lettuce","Spicy Mayo"]},{id:"p4",name:"Premium Dates Shake",description:"Rich dates blended with premium milk, topped with whipped cream and nuts.",price:8.99,category:"drinks",image:"/assets/images/dates.webp",spiceLevel:"none",ingredients:["Dates","Milk","Cream","Nuts"]},{id:"p5",name:"French Fries",description:"Crispy golden fries seasoned with our special spice blend.",price:4.99,category:"sides",image:"https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80",spiceLevel:"mild",ingredients:["Potatoes","Salt","Spices"]}],$=[{id:"e1",name:"Extra Cheese",price:1.5},{id:"e2",name:"Extra Chicken",price:3},{id:"e3",name:"Extra Beef",price:4},{id:"e4",name:"Extra Garlic Sauce",price:.5},{id:"e5",name:"Spicy Mayo",price:.5}],W=async()=>{if(!d)return S;try{const{data:n,error:a}=await d.from("menu_items").select("*").is("deleted_at",null).eq("is_active",!0).order("category",{ascending:!0});if(a)throw a;return n&&n.length>0?n.map(r=>({...r,ingredients:typeof r.ingredients=="string"?JSON.parse(r.ingredients):r.ingredients||[]})):S}catch(n){return console.error("Error fetching menu items:",n),S}},J=async()=>{if(!d)return $;try{const{data:n,error:a}=await d.from("settings").select("*").eq("type","extra");if(a)throw a;return n&&n.length>0?n:$}catch(n){return console.error("Error fetching extras:",n),$}};class Q{constructor(){this.state={cart:[],user:null,cartOpen:!1,products:[],extras:[],isLoaded:!1},this.listeners=[],this.loadState()}getState(){return this.state}setState(a){this.state={...this.state,...a},this.saveState(),this.notify()}subscribe(a){return this.listeners.push(a),()=>{this.listeners=this.listeners.filter(r=>r!==a)}}notify(){this.listeners.forEach(a=>a(this.state))}async initData(){try{const[a,r]=await Promise.all([W(),J()]);this.setState({products:a,extras:r,isLoaded:!0})}catch(a){console.error("Failed to init data:",a),this.setState({isLoaded:!0})}}loadState(){try{const a=localStorage.getItem("shavo_state");if(a){const r=JSON.parse(a);this.state.cart=r.cart||[],this.state.user=r.user||null}}catch(a){console.error("Failed to load state",a)}}saveState(){try{localStorage.setItem("shavo_state",JSON.stringify({cart:this.state.cart,user:this.state.user}))}catch(a){console.error("Failed to save state",a)}}toggleCart(a=!this.state.cartOpen){this.setState({cartOpen:a})}addToCart(a,r=1,s=[]){const t=[...this.state.cart],i=s.map(l=>l.id).sort().join("_"),e=`${a.id}_${i}`,o=t.findIndex(l=>l.cartItemId===e);o>=0?t[o].quantity+=r:t.push({cartItemId:e,product:a,quantity:r,extras:s}),this.setState({cart:t,cartOpen:!0})}removeFromCart(a){const r=this.state.cart.filter(s=>s.cartItemId!==a);this.setState({cart:r})}updateQuantity(a,r){const s=[...this.state.cart],t=s.findIndex(i=>i.cartItemId===a);t>=0&&(s[t].quantity+=r,s[t].quantity<=0&&s.splice(t,1),this.setState({cart:s}))}clearCart(){this.setState({cart:[]})}getCartTotal(){return this.state.cart.reduce((a,r)=>{const s=r.extras.reduce((i,e)=>i+e.price,0),t=(r.product.price+s)*r.quantity;return a+t},0)}getCartCount(){return this.state.cart.reduce((a,r)=>a+r.quantity,0)}}const b=new Q,v={Cart:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',Menu:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',Close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',Plus:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',Minus:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',Trash:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'},X=()=>`
        <div class="container flex justify-between items-center">
            <a href="/" data-link class="logo flex items-center">
                <picture>
                    <source srcset="/assets/images/logo-master.webp" type="image/webp">
                    <img src="/assets/images/logo-master.png" alt="SHAVO BITES Logo" style="height: 56px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                </picture>
            </a>
            
            <nav class="hidden md:flex gap-lg">
                <a href="/" data-link class="nav-link">Home</a>
                <a href="/menu" data-link class="nav-link">Menu</a>
                <a href="/profile" data-link class="nav-link">Profile</a>
            </nav>
            
            <div class="flex items-center gap-md">
                <button class="cart-btn" id="open-cart-btn">
                    ${v.Cart}
                    <span class="cart-badge" id="cart-count-badge">0</span>
                </button>
                <button class="btn-icon hidden" id="mobile-menu-btn">
                    ${v.Menu}
                </button>
            </div>
        </div>
    `,K=()=>`
        <div class="glass" style="margin-top: auto; padding: var(--space-xl) 0;">
            <div class="container grid md:grid-cols-4 gap-xl">
                <div>
                    <picture>
                        <source srcset="/assets/images/logo-master.webp" type="image/webp">
                        <img src="/assets/images/logo-master.png" alt="SHAVO BITES Logo" style="height: 64px; width: auto; object-fit: contain; margin-bottom: 1rem;">
                    </picture>
                    <p class="text-muted text-sm">Big Flavor. Every Bite.<br>Premium delivery-only shawarma.</p>
                </div>
                <div>
                    <h4 class="mb-md">Quick Links</h4>
                    <ul class="flex-col gap-sm flex">
                        <li><a href="/" data-link class="text-muted hover:text-white">Home</a></li>
                        <li><a href="/menu" data-link class="text-muted hover:text-white">Menu</a></li>
                        <li><a href="/profile" data-link class="text-muted hover:text-white">My Account</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="mb-md">Legal</h4>
                    <ul class="flex-col gap-sm flex">
                        <li><a href="#" class="text-muted">Privacy Policy</a></li>
                        <li><a href="#" class="text-muted">Terms & Conditions</a></li>
                        <li><a href="#" class="text-muted">Delivery Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="mb-md">Contact</h4>
                    <p class="text-muted text-sm mb-sm">Email: hello@shavobites.com</p>
                    <p class="text-muted text-sm mb-sm">Phone: +1 234 567 8900</p>
                    <div class="flex gap-sm mt-md">
                        <!-- Social Icons Placeholders -->
                        <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    </div>
                </div>
            </div>
            <div class="container mt-xl text-center text-sm text-muted" style="border-top: 1px solid var(--color-border); padding-top: var(--space-lg);">
                &copy; ${new Date().getFullYear()} SHAVO BITES. All rights reserved.
            </div>
        </div>
    `,Z=()=>{const a=b.getState().cart,r=b.getCartTotal();let s="";return a.length===0?s=`
            <div class="flex flex-col items-center justify-center h-100 text-center text-muted" style="height: 100%;">
                ${v.Cart}
                <p class="mt-md">Your cart is empty</p>
                <a href="/menu" data-link class="btn btn-primary mt-lg" id="cart-start-order">Start Ordering</a>
            </div>
        `:s=a.map(t=>`
            <div class="cart-item">
                <img src="${t.product.image}" alt="${t.product.name}" class="cart-item-img">
                <div class="flex-1">
                    <div class="flex justify-between">
                        <h4 class="text-sm font-bold">${t.product.name}</h4>
                        <button class="btn-icon" style="width:20px;height:20px;color:var(--color-error);" onclick="window.appActions.removeFromCart('${t.cartItemId}')">
                            ${v.Trash}
                        </button>
                    </div>
                    <div class="text-xs text-muted mb-sm">
                        ${t.extras.map(i=>`+ ${i.name}`).join(", ")}
                    </div>
                    <div class="flex justify-between items-center mt-sm">
                        <div class="text-primary font-bold">₹${(t.product.price+t.extras.reduce((i,e)=>i+e.price,0)).toFixed(2)}</div>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="window.appActions.updateQty('${t.cartItemId}', -1)">${v.Minus}</button>
                            <span class="qty-val">${t.quantity}</span>
                            <button class="qty-btn" onclick="window.appActions.updateQty('${t.cartItemId}', 1)">${v.Plus}</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join(""),`
        <div class="cart-overlay" id="cart-overlay"></div>
        <div class="cart-drawer" id="cart-drawer">
            <div class="cart-header">
                <h3>Your Order</h3>
                <button class="btn-icon" id="close-cart-btn">${v.Close}</button>
            </div>
            <div class="cart-body">
                ${s}
            </div>
            ${a.length>0?`
            <div class="cart-footer">
                <div class="flex justify-between items-center mb-sm">
                    <span class="text-muted">Subtotal</span>
                    <span>₹${r.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span class="text-muted">Delivery</span>
                    <span>₹2.99</span>
                </div>
                <div class="flex justify-between items-center mb-lg font-bold text-lg">
                    <span>Total</span>
                    <span class="text-primary">₹${(r+2.99).toFixed(2)}</span>
                </div>
                <a href="/checkout" data-link class="btn btn-primary" style="width:100%;" id="cart-checkout-btn">Proceed to Checkout</a>
            </div>
            `:""}
        </div>
    `},ee=async()=>{const{products:n}=b.getState();return`
        <div class="page-enter">
            <!-- Hero Section -->
            <section class="relative flex items-center" style="min-height: 90vh; padding-top: 80px;">
                <!-- Background Image & Gradient -->
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 100%); z-index:1;"></div>
                    <img src="/assets/images/hero.webp" style="width:100%; height:100%; object-fit:cover; transform:scale(1.05);" alt="Hero" fetchpriority="high" decoding="sync">
                </div>
                
                <div class="container slide-up">
                    <div style="max-width: 600px;">
                        <h1 class="mb-md" style="text-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                            <span class="text-primary">BIG FLAVOR.</span><br>
                            EVERY BITE.
                        </h1>
                        <p class="text-lg text-muted mb-lg">
                            Experience the most luxurious delivery-only shawarma in town. Premium ingredients, crafted to perfection.
                        </p>
                        <div class="flex gap-md">
                            <a href="/menu" data-link class="btn btn-primary">Order Now</a>
                            <a href="#popular" class="btn btn-outline">Explore Menu</a>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Popular Items -->
            <section id="popular" class="section">
                <div class="container">
                    <h2 class="section-title">Popular Items</h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
                        ${n.slice(0,3).map((s,t)=>`
        <div class="glass-card product-card fade-in stagger-${t+1}">
            <div class="product-img-wrapper">
                <img src="${s.image_url||s.image}" alt="${s.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <div class="flex justify-between items-center mb-xs">
                    <h3 class="product-title">${s.name}</h3>
                    ${s.spiceLevel==="spicy"||s.spice_level==="spicy"?'<span class="badge badge-primary">Spicy</span>':""}
                </div>
                <p class="product-desc">${s.description}</p>
                <div class="product-price-row">
                    <span class="product-price">₹${Number(s.price).toFixed(2)}</span>
                    <a href="/menu" data-link class="btn btn-outline btn-sm">Order</a>
                </div>
            </div>
        </div>
    `).join("")}
                    </div>
                </div>
            </section>
            
            <!-- Why Choose Us -->
            <section class="section" style="background: rgba(255,255,255,0.02);">
                <div class="container">
                    <h2 class="section-title">Why SHAVO BITES?</h2>
                    <div class="grid md:grid-cols-3 gap-lg text-center">
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <div class="text-primary mb-md flex justify-center" style="transform: scale(2);">${v.Cart}</div>
                            <h3 class="mb-sm">Fast Delivery</h3>
                            <p class="text-muted">20-30 minutes guaranteed delivery to your doorstep.</p>
                        </div>
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <div class="text-primary mb-md flex justify-center" style="transform: scale(2);">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            </div>
                            <h3 class="mb-sm">Premium Quality</h3>
                            <p class="text-muted">Michelin-star quality ingredients, freshly prepared daily.</p>
                        </div>
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <div class="text-primary mb-md flex justify-center" style="transform: scale(2);">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
                            </div>
                            <h3 class="mb-sm">24/7 Support</h3>
                            <p class="text-muted">Dedicated WhatsApp and live tracking for all orders.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `},D=async()=>{const{products:n}=b.getState(),a=["shawarma","sides","drinks"];let r="";return a.forEach(s=>{const t=n.filter(o=>o.category===s);if(t.length===0)return;const i=s.charAt(0).toUpperCase()+s.slice(1),e=t.map(o=>{const l=o.ingredients?(typeof o.ingredients=="string"?JSON.parse(o.ingredients):o.ingredients).join(", "):"";return`
            <div class="glass-card product-card">
                <div class="product-img-wrapper">
                    <img src="${o.image_url||o.image}" alt="${o.name}" class="product-img" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="flex justify-between items-center mb-sm">
                        <h3 class="product-title">${o.name}</h3>
                        ${o.spiceLevel==="spicy"||o.spice_level==="spicy"?'<span class="badge badge-primary">Spicy</span>':""}
                    </div>
                    <p class="text-xs text-muted mb-sm">Ingredients: ${l}</p>
                    <p class="product-desc">${o.description}</p>
                    <div class="product-price-row">
                        <span class="product-price">₹${Number(o.price).toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm" onclick="window.menuActions.openCustomizeModal('${o.id}')">Add</button>
                    </div>
                </div>
            </div>
            `}).join("");r+=`
            <div class="mb-xl">
                <h2 class="text-primary mb-lg uppercase" style="letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">${i}</h2>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
                    ${e}
                </div>
            </div>
        `}),`
        <div class="page-enter section">
            <div class="container">
                <div class="text-center mb-2xl">
                    <h1 class="mb-md">Our <span class="text-primary">Menu</span></h1>
                    <p class="text-muted max-w-lg mx-auto">Explore our premium selection of shawarmas, sides, and signature drinks.</p>
                </div>
                
                ${r}
            </div>
            
            <!-- Customize Modal Container -->
            <div id="customize-modal-container"></div>
        </div>
    `};D.mount=()=>{window.menuActions={openCustomizeModal:n=>{const{products:a,extras:r}=b.getState(),s=a.find(u=>String(u.id)===String(n));if(!s)return;const t=document.getElementById("customize-modal-container"),i=r.map(u=>`
                <label class="flex justify-between items-center p-sm glass mb-sm rounded" style="border-radius: var(--radius-sm); cursor: pointer;">
                    <div class="flex items-center gap-sm">
                        <input type="checkbox" value="${u.id}" class="extra-checkbox" data-price="${u.price}" data-name="${u.name}">
                        <span>${u.name}</span>
                    </div>
                    <span class="text-primary">+₹${Number(u.price).toFixed(2)}</span>
                </label>
            `).join("");t.innerHTML=`
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 300;" id="modal-overlay"></div>
                <div class="glass-card" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 301; width: 90%; max-width: 500px; padding: var(--space-lg); display: flex; flex-direction: column; max-height: 90vh; overflow-y: auto;">
                    <div class="flex justify-between items-center mb-md">
                        <h3>Customize ${s.name}</h3>
                        <button class="btn-icon" id="close-modal-btn">${v.Close}</button>
                    </div>
                    
                    <div class="mb-md">
                        <img src="${s.image_url||s.image}" alt="${s.name}" style="width:100%; height:200px; object-fit:cover; border-radius:var(--radius-sm);">
                    </div>
                    
                    <div class="mb-lg">
                        <h4 class="mb-sm text-primary">Extras & Add-ons</h4>
                        ${i}
                    </div>
                    
                    <div class="flex justify-between items-center mb-lg">
                        <span>Quantity</span>
                        <div class="qty-control">
                            <button class="qty-btn" id="modal-qty-minus">${v.Minus}</button>
                            <span class="qty-val" id="modal-qty-val">1</span>
                            <button class="qty-btn" id="modal-qty-plus">${v.Plus}</button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-full" id="add-to-cart-confirm" style="width:100%;">
                        Add to Cart - ₹<span id="modal-total-price">${Number(s.price).toFixed(2)}</span>
                    </button>
                </div>
            `;let e=1,o=Number(s.price),l=[];const m=()=>{const u=l.reduce((g,p)=>g+p.price,0),c=(o+u)*e;document.getElementById("modal-total-price").textContent=c.toFixed(2)};document.getElementById("close-modal-btn").onclick=()=>t.innerHTML="",document.getElementById("modal-overlay").onclick=()=>t.innerHTML="",document.getElementById("modal-qty-minus").onclick=()=>{e>1&&(e--,document.getElementById("modal-qty-val").textContent=e,m())},document.getElementById("modal-qty-plus").onclick=()=>{e++,document.getElementById("modal-qty-val").textContent=e,m()},document.querySelectorAll(".extra-checkbox").forEach(u=>{u.addEventListener("change",c=>{c.target.checked?l.push({id:c.target.value,name:c.target.getAttribute("data-name"),price:parseFloat(c.target.getAttribute("data-price"))}):l=l.filter(g=>g.id!==c.target.value),m()})}),document.getElementById("add-to-cart-confirm").onclick=()=>{b.addToCart(s,e,l),t.innerHTML=""}}}};const te="modulepreload",se=function(n){return"/"+n},T={},B=function(a,r,s){let t=Promise.resolve();if(r&&r.length>0){document.getElementsByTagName("link");const e=document.querySelector("meta[property=csp-nonce]"),o=(e==null?void 0:e.nonce)||(e==null?void 0:e.getAttribute("nonce"));t=Promise.allSettled(r.map(l=>{if(l=se(l),l in T)return;T[l]=!0;const m=l.endsWith(".css"),u=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${u}`))return;const c=document.createElement("link");if(c.rel=m?"stylesheet":te,m||(c.as="script"),c.crossOrigin="",c.href=l,o&&c.setAttribute("nonce",o),document.head.appendChild(c),m)return new Promise((g,p)=>{c.addEventListener("load",g),c.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${l}`)))})}))}function i(e){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=e,window.dispatchEvent(o),!o.defaultPrevented)throw e}return t.then(e=>{for(const o of e||[])o.status==="rejected"&&i(o.reason);return a().catch(i)})},j=async()=>{const a=b.getState().cart;if(a.length===0)return`
            <div class="page-enter section container flex flex-col items-center justify-center text-center" style="min-height: 60vh;">
                <div class="text-primary mb-md" style="transform: scale(2);">${v.Cart}</div>
                <h2 class="mb-sm">Your cart is empty</h2>
                <p class="text-muted mb-lg">Add some delicious items before proceeding to checkout.</p>
                <a href="/menu" data-link class="btn btn-primary">Go to Menu</a>
            </div>
        `;const r=b.getCartTotal(),s=2.99,t=r+s,i=a.map(e=>{const o=Number(e.product.price)+e.extras.reduce((l,m)=>l+Number(m.price),0);return`
        <div class="flex justify-between mb-sm text-sm">
            <span>${e.quantity}x ${e.product.name}</span>
            <span>$${(o*e.quantity).toFixed(2)}</span>
        </div>
        `}).join("");return`
        <div class="page-enter section">
            <div class="container">
                <h1 class="mb-xl text-center">Checkout</h1>
                
                <div class="grid md:grid-cols-3 gap-xl">
                    <div class="md:col-span-2">
                        <form id="checkout-form" class="glass-card" style="padding: var(--space-xl);">
                            
                            <h3 class="mb-md text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Contact & Address</h3>
                            
                            <div class="grid md:grid-cols-2 gap-md">
                                <div class="form-group">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" id="cust-name" class="form-input" required placeholder="John Doe">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone Number</label>
                                    <input type="tel" id="cust-phone" class="form-input" required placeholder="+1 234 567 8900">
                                </div>
                            </div>
                            
                            <div class="form-group flex justify-between items-center mb-md mt-sm">
                                <label class="form-label mb-0">Delivery Address</label>
                                <button type="button" class="btn btn-outline btn-sm" id="btn-use-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                                    Use Current Location
                                </button>
                            </div>
                            
                            <div class="grid md:grid-cols-2 gap-md">
                                <div class="form-group">
                                    <label class="form-label">House / Flat Number</label>
                                    <input type="text" id="cust-house" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Street / Area</label>
                                    <input type="text" id="cust-street" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">City</label>
                                    <input type="text" id="cust-city" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">PIN Code</label>
                                    <input type="text" id="cust-pin" class="form-input" required>
                                </div>
                            </div>
                            
                            <h3 class="mb-md mt-lg text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Payment Method</h3>
                            <div class="form-group">
                                <select class="form-select" id="payment-method">
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Credit / Debit Card</option>
                                </select>
                            </div>
                            
                            <h3 class="mb-md mt-lg text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Special Instructions</h3>
                            <div class="form-group">
                                <textarea class="form-input" id="cust-instructions" rows="3" placeholder="e.g. extra spicy, call on arrival..."></textarea>
                            </div>
                            
                            <button type="submit" id="submit-order-btn" class="btn btn-primary mt-lg" style="width: 100%; padding: 1rem; font-size: 1.125rem;">
                                Place Order - $${t.toFixed(2)}
                            </button>
                        </form>
                    </div>
                    
                    <div>
                        <div class="glass-card" style="padding: var(--space-xl); position: sticky; top: 100px;">
                            <h3 class="mb-md">Order Summary</h3>
                            <div class="mb-lg" style="max-height: 300px; overflow-y: auto;">
                                ${i}
                            </div>
                            
                            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-md);">
                                <div class="flex justify-between items-center mb-sm">
                            <span class="text-muted">Subtotal</span>
                            <span>₹${r.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="text-muted">Delivery</span>
                            <span>₹${s.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span class="text-primary font-bold">₹${t.toFixed(2)}</span>
                        </div>        </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Success Modal -->
            <div id="success-modal-container"></div>
        </div>
    `};j.mount=()=>{var a;const n=document.getElementById("checkout-form");n&&n.addEventListener("submit",async r=>{r.preventDefault();const s=document.getElementById("submit-order-btn");s.disabled=!0,s.textContent="Processing...";const i=b.getState().cart,e=b.getCartTotal(),o=2.99,l=e+o,m=()=>window.crypto&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(y){var h=Math.random()*16|0,x=y=="x"?h:h&3|8;return x.toString(16)}),u=m(),c={id:u,name:document.getElementById("cust-name").value,phone:document.getElementById("cust-phone").value,house:document.getElementById("cust-house").value,street:document.getElementById("cust-street").value,city:document.getElementById("cust-city").value,pin:document.getElementById("cust-pin").value},g=m();try{if(!d)throw console.error("Supabase client is not initialized."),new Error("Supabase client is not initialized. Check your config.");const{data:y,error:h}=await d.from("customers").insert([c]);if(h)throw console.error("Supabase Customer Error:",h),new Error(`Customer Insert Failed: ${h.message||JSON.stringify(h)}`);const x={id:g,customer_id:u,items:i,subtotal:e,delivery_fee:o,total:l,payment_method:document.getElementById("payment-method").value,special_instructions:document.getElementById("cust-instructions").value,status:"Pending"},{data:I,error:f}=await d.from("orders").insert([x]);if(f)throw console.error("Supabase Order Error:",f),new Error(`Order Insert Failed: ${f.message||JSON.stringify(f)}`)}catch(y){console.error("Order submission error:",y),s.disabled=!1,s.textContent="Place Order - $"+l.toFixed(2);return}const p=document.getElementById("success-modal-container");p.innerHTML=`
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 300;"></div>
                <div class="glass-card text-center" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 301; width: 90%; max-width: 450px; padding: var(--space-xl);">
                    <div class="text-success mb-md flex justify-center" style="transform: scale(3);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2 class="mb-sm text-primary">Order Confirmed!</h2>
                    <p class="text-muted mb-md">Your order has been received and is being prepared.</p>
                    
                    <div class="text-left bg-black p-md rounded mb-lg" style="background: rgba(0,0,0,0.5); padding: var(--space-md); border-radius: var(--radius-sm);">
                        <p class="mb-xs"><strong>Order ID:</strong> ${g}</p>
                        <p class="mb-xs"><strong>Est. Delivery:</strong> 20-30 Minutes</p>
                        <p class="mb-xs text-primary font-bold"><strong>Status:</strong> Preparing</p>
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.checkoutActions.finishOrder()">View My Orders</button>
                </div>
            `,b.clearCart()}),(a=document.getElementById("btn-use-location"))==null||a.addEventListener("click",()=>{navigator.geolocation&&navigator.geolocation.getCurrentPosition(r=>{},r=>{})}),window.checkoutActions={finishOrder:()=>{B(()=>Promise.resolve().then(()=>C),void 0).then(r=>{r.router.navigate("/profile")})}}};const ae=async()=>`
        <div class="page-enter section">
            <div class="container">
                <h1 class="mb-xl text-center">My Profile</h1>
                
                <div class="grid md:grid-cols-4 gap-xl">
                    <!-- Sidebar -->
                    <div class="glass-card" style="padding: var(--space-lg); height: fit-content;">
                        <div class="text-center mb-lg">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-primary); color: #000; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; margin: 0 auto mb-sm;">
                                JD
                            </div>
                            <h3>John Doe</h3>
                            <p class="text-muted text-sm">+1 234 567 8900</p>
                        </div>
                        
                        <nav class="flex flex-col gap-sm">
                            <a href="#" class="btn btn-outline text-left justify-start active" style="justify-content: flex-start;">My Orders</a>
                            <a href="#" class="btn btn-outline text-left justify-start" style="border-color: transparent; justify-content: flex-start;">Saved Addresses</a>
                            <a href="#" class="btn btn-outline text-left justify-start" style="border-color: transparent; justify-content: flex-start;">Account Settings</a>
                            <button class="btn btn-outline text-left justify-start text-error mt-lg" style="border-color: transparent; justify-content: flex-start; color: var(--color-error);">Logout</button>
                        </nav>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="md:col-span-3">
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <h2 class="mb-lg border-b pb-sm text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Recent Orders</h2>
                            
                            <!-- Mock Order 1 -->
                            <div class="glass p-md rounded mb-md" style="padding: var(--space-md); border-radius: var(--radius-sm);">
                                <div class="flex justify-between items-center mb-md border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                    <div>
                                        <span class="font-bold text-lg">Order #ORD-748921</span>
                                        <span class="text-muted text-sm ml-sm">Placed 2 days ago</span>
                                    </div>
                                    <span class="badge" style="background: rgba(46, 204, 113, 0.2); color: var(--color-success); border: 1px solid var(--color-success);">Delivered</span>
                                </div>
                                <div class="text-muted mb-md text-sm">
                                    2x Chicken Shawarma (Extra Garlic), 1x Premium Dates Shake
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-lg">$37.97</span>
                                    <button class="btn btn-outline btn-sm">Reorder</button>
                                </div>
                            </div>
                            
                            <!-- Mock Order 2 -->
                            <div class="glass p-md rounded" style="padding: var(--space-md); border-radius: var(--radius-sm);">
                                <div class="flex justify-between items-center mb-md border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                    <div>
                                        <span class="font-bold text-lg">Order #ORD-112344</span>
                                        <span class="text-muted text-sm ml-sm">Placed 1 week ago</span>
                                    </div>
                                    <span class="badge" style="background: rgba(46, 204, 113, 0.2); color: var(--color-success); border: 1px solid var(--color-success);">Delivered</span>
                                </div>
                                <div class="text-muted mb-md text-sm">
                                    1x Beef Shawarma, 1x French Fries, 1x Squid Shawarma
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-lg">$39.96</span>
                                    <button class="btn btn-outline btn-sm">Reorder</button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,q=async()=>`
        <div class="page-enter section flex justify-center items-center" style="min-height: 70vh;">
            <div class="glass-card" style="width: 100%; max-width: 420px; padding: var(--space-2xl);">
                <div class="text-center mb-xl">
                    <h2 class="text-primary mb-xs">Admin Login</h2>
                    <p class="text-muted text-sm">Secure CMS Access</p>
                </div>
                <form id="admin-login-form">
                    <div class="form-group mb-md">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="admin-email" class="form-input" required placeholder="admin@shavobites.com">
                    </div>
                    <div class="form-group mb-xl">
                        <label class="form-label">Password</label>
                        <input type="password" id="admin-password" class="form-input" required placeholder="••••••••">
                    </div>
                    <button type="submit" id="admin-login-btn" class="btn btn-primary" style="width:100%; padding: 1rem; font-size: 1.1rem;">Secure Sign In</button>
                    <div id="login-error" class="text-error text-center mt-md text-sm font-bold"></div>
                </form>
            </div>
        </div>
    `;q.mount=()=>{const n=document.getElementById("admin-login-form");n&&n.addEventListener("submit",async a=>{a.preventDefault();const r=document.getElementById("admin-login-btn"),s=document.getElementById("login-error");r.disabled=!0,r.textContent="Authenticating...",s.textContent="";const t=document.getElementById("admin-email").value,i=document.getElementById("admin-password").value;try{const{data:e,error:o}=await d.auth.signInWithPassword({email:t,password:i});if(o)throw o;const{data:l,error:m}=await d.from("admin_roles").select("role").eq("user_id",e.user.id).single();if(m||!l)throw await d.auth.signOut(),new Error("Unauthorized: Your account does not have admin privileges.");localStorage.setItem("adminRole",l.role),B(()=>Promise.resolve().then(()=>C),void 0).then(u=>{u.router.navigate("/admin/dashboard")})}catch(e){s.textContent=e.message,r.disabled=!1,r.textContent="Secure Sign In"}})};const k=(n,a)=>{const r=localStorage.getItem("adminRole")||"manager",s=[{path:"/admin/dashboard",name:"Dashboard"},{path:"/admin/menu",name:"Menu"}];r==="super_admin"&&(s.push({path:"/admin/settings",name:"Settings"}),s.push({path:"/admin/offers",name:"Offers"}),s.push({path:"/admin/banners",name:"Banners"}));const t=s.map(i=>`
        <a href="${i.path}" data-link class="admin-nav-link ${i.path===a?"active":""}" style="display:flex; align-items:center; gap:0.5rem; padding:1rem; color:${i.path===a?"var(--color-primary)":"var(--color-text-muted)"}; background:${i.path===a?"rgba(212,175,55,0.1)":"transparent"}; border-radius: var(--radius-sm); margin-bottom:0.5rem; text-decoration:none; transition: all 0.2s;">
            ${i.name}
        </a>
    `).join("");return`
        <div class="container page-enter">
            <div class="flex flex-col md:flex-row gap-xl" style="min-height: calc(100vh - 200px); margin: var(--space-xl) 0;">
                
                <!-- Sidebar -->
                <aside class="glass" style="width: 100%; md:width: 280px; min-width: 250px; padding: var(--space-lg); border-radius: var(--radius-md); display: flex; flex-direction: column;">
                    <div class="mb-lg pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3 class="text-white mb-xs">Admin Panel</h3>
                        <span class="badge badge-primary text-xs uppercase">${r.replace("_"," ")}</span>
                    </div>
                    <nav class="flex flex-col flex-1">
                        ${t}
                    </nav>
                    <div style="margin-top: 2rem; padding-top: var(--space-lg); border-top: 1px solid rgba(255,255,255,0.1);">
                        <button class="btn btn-outline w-full" id="admin-logout-btn" style="width:100%;">Logout</button>
                    </div>
                </aside>
                
                <!-- Main Content -->
                <main class="flex-1 glass" style="padding: var(--space-xl); border-radius: var(--radius-md); overflow-x: auto;">
                    ${n}
                </main>
            </div>
        </div>
    `},F=async()=>{const n=new Date;n.setHours(0,0,0,0);let a=0,r=0;try{const{data:t,error:i}=await d.from("orders").select("total, items").gte("created_at",n.toISOString());t&&(r=t.length,a=t.reduce((e,o)=>e+Number(o.total),0))}catch(t){console.error("Failed to fetch analytics:",t)}const s=`
        <div class="flex justify-between items-center mb-xl">
            <h2 class="text-white">Dashboard <span class="text-primary">Overview</span></h2>
            <div class="text-sm text-muted">Real-time Data</div>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-lg mb-2xl">
            <div class="glass-card p-lg" style="padding: var(--space-xl); display: flex; flex-direction: column; align-items: center; border-top: 3px solid var(--color-primary);">
                <h4 class="text-muted mb-sm text-sm uppercase" style="letter-spacing: 1px;">Today's Orders</h4>
                <div class="text-4xl font-bold text-white">${r}</div>
            </div>
            <div class="glass-card p-lg" style="padding: var(--space-xl); display: flex; flex-direction: column; align-items: center; border-top: 3px solid var(--color-primary);">
                <h4 class="text-muted mb-sm text-sm uppercase" style="letter-spacing: 1px;">Today's Revenue</h4>
                <div class="text-4xl font-bold text-primary">₹${a.toFixed(2)}</div>
            </div>
            <div class="glass-card p-lg" style="padding: var(--space-xl); display: flex; flex-direction: column; align-items: center; border-top: 3px solid rgba(255,255,255,0.2);">
                <h4 class="text-muted mb-sm text-sm uppercase" style="letter-spacing: 1px;">System Status</h4>
                <div class="text-lg font-bold text-success mt-sm flex items-center gap-sm">
                    <span style="width: 12px; height: 12px; background: #28a745; border-radius: 50%; display: inline-block;"></span> Online
                </div>
            </div>
        </div>
        
        <h3 class="mb-md text-white">Recent Audit Logs</h3>
        <div class="glass-card" style="padding: var(--space-lg); min-height: 250px;">
            <p class="text-muted text-center" style="margin-top: 80px;">Activity logs will appear here once module is fully connected.</p>
        </div>
    `;return k(s,"/admin/dashboard")};F.mount=()=>{const n=document.getElementById("admin-logout-btn");n&&n.addEventListener("click",async()=>{await d.auth.signOut(),localStorage.removeItem("adminRole"),B(()=>Promise.resolve().then(()=>C),void 0).then(a=>{a.router.navigate("/admin")})})};const H=async()=>{let n=[];try{const{data:s,error:t}=await d.from("menu_items").select("*").order("created_at",{ascending:!1});if(t)throw t;n=s||[],window.__ADMIN_MENU_ITEMS__=n}catch(s){console.error("Failed to fetch menu items:",s)}const a=n.map(s=>{const t=s.deleted_at!==null,i=t?'<span class="badge" style="background:var(--color-error); color:white;">Deleted</span>':s.is_active?'<span class="badge" style="background:var(--color-success); color:white;">Active</span>':'<span class="badge" style="background:#555; color:white;">Hidden</span>';return`
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${t?"opacity: 0.5;":""}">
                <td style="padding: 1rem;">
                    <img src="${s.image}" alt="${s.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                </td>
                <td style="padding: 1rem; font-weight: bold;">${s.name}</td>
                <td style="padding: 1rem;" class="capitalize">${s.category}</td>
                <td style="padding: 1rem;">₹${Number(s.price).toFixed(2)}</td>
                <td style="padding: 1rem;">${i}</td>
                <td style="padding: 1rem; text-align: right;">
                    <div class="flex gap-sm justify-end">
                        <button class="btn-icon text-primary" title="Edit" onclick="window.adminMenuActions.openModal('${s.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        ${t?`
                        <button class="btn-icon text-success" title="Restore" onclick="window.adminMenuActions.restoreItem('${s.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        </button>
                        `:`
                        <button class="btn-icon text-error" title="Delete" onclick="window.adminMenuActions.deleteItem('${s.id}', '${s.name.replace(/'/g,"\\'")}')">
                            ${v.Trash}
                        </button>
                        `}
                    </div>
                </td>
            </tr>
        `}).join(""),r=`
        <div class="flex justify-between items-center mb-xl">
            <div>
                <h2 class="text-white">Menu <span class="text-primary">Management</span></h2>
                <p class="text-sm text-muted">Create, edit, and manage your products</p>
            </div>
            <button class="btn btn-primary flex items-center gap-sm" onclick="window.adminMenuActions.openModal()">
                ${v.Plus} Add New Item
            </button>
        </div>
        
        <div class="glass-card" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--color-text-muted);">
                        <th style="padding: 1rem;">Image</th>
                        <th style="padding: 1rem;">Name</th>
                        <th style="padding: 1rem;">Category</th>
                        <th style="padding: 1rem;">Price</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${a.length>0?a:'<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">No menu items found.</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <!-- Toast Notification Container -->
        <div id="admin-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>
        
        <!-- Add/Edit Modal -->
        <div id="admin-modal-container"></div>
    `;return k(r,"/admin/menu")};H.mount=()=>{const n=async(s,t,i)=>{try{const{data:{user:e}}=await d.auth.getUser();await d.from("audit_logs").insert([{user_id:e==null?void 0:e.id,action:s,resource:t,details:i}])}catch(e){console.error("Audit log failed:",e)}},a=(s,t="success")=>{const i=document.getElementById("admin-toast-container");if(!i)return;const e=document.createElement("div");e.className="glass-card fade-in slide-up",e.style.padding="1rem 1.5rem",e.style.borderLeft=`4px solid ${t==="success"?"#28a745":"var(--color-error)"}`,e.style.display="flex",e.style.alignItems="center",e.style.gap="0.5rem",e.style.boxShadow="0 10px 30px rgba(0,0,0,0.5)",e.innerHTML=`
            <strong style="color: ${t==="success"?"#28a745":"var(--color-error)"}">${t==="success"?"Success":"Error"}</strong>
            <span>${s}</span>
        `,i.appendChild(e),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(20px)",setTimeout(()=>e.remove(),300)},4e3)},r=s=>new Promise((t,i)=>{const e=new FileReader;e.readAsDataURL(s),e.onload=o=>{const l=new Image;l.src=o.target.result,l.onload=()=>{const m=document.createElement("canvas"),u=1200,c=1200;let g=l.width,p=l.height;g>p?g>u&&(p*=u/g,g=u):p>c&&(g*=c/p,p=c),m.width=g,m.height=p,m.getContext("2d").drawImage(l,0,0,g,p),m.toBlob(h=>{h?t(new File([h],s.name.replace(/\.[^/.]+$/,"")+".webp",{type:"image/webp"})):i(new Error("Canvas to Blob failed"))},"image/webp",.85)},l.onerror=m=>i(m)},e.onerror=o=>i(o)});if(window.adminMenuActions={openModal:(s=null)=>{const t=s!==null,i=window.__ADMIN_MENU_ITEMS__||[],e=t?i.find(g=>g.id===s):null,o=e&&e.ingredients?Array.isArray(e.ingredients)?e.ingredients.join(", "):e.ingredients:"",l=(e==null?void 0:e.is_bestseller)||!1,m=(e==null?void 0:e.is_featured)||!1,u=document.getElementById("admin-modal-container");u.innerHTML=`
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 1000;" id="admin-modal-overlay"></div>
                <div class="glass-card" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1001; width: 95%; max-width: 600px; padding: var(--space-xl); max-height: 90vh; overflow-y: auto;">
                    <div class="flex justify-between items-center mb-lg pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3>${t?"Edit":"Add New"} Menu Item</h3>
                        <button class="btn-icon" id="admin-close-modal-btn">${v.Close}</button>
                    </div>
                    
                    <form id="admin-menu-form">
                        <input type="hidden" id="menu-id" value="${t?e.id:""}">
                        
                        <div class="grid md:grid-cols-2 gap-md mb-md">
                            <div class="form-group">
                                <label class="form-label">Name</label>
                                <input type="text" id="menu-name" class="form-input" required value="${(e==null?void 0:e.name)||""}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select id="menu-category" class="form-select" required>
                                    <option value="shawarma" ${(e==null?void 0:e.category)==="shawarma"?"selected":""}>Shawarma</option>
                                    <option value="sides" ${(e==null?void 0:e.category)==="sides"?"selected":""}>Sides</option>
                                    <option value="drinks" ${(e==null?void 0:e.category)==="drinks"?"selected":""}>Drinks</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-md mb-md">
                            <div class="form-group">
                                <label class="form-label">Price (₹)</label>
                                <input type="number" id="menu-price" class="form-input" step="0.01" required value="${(e==null?void 0:e.price)||""}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Spice Level</label>
                                <select id="menu-spice" class="form-select">
                                    <option value="none" ${(e==null?void 0:e.spiceLevel)==="none"?"selected":""}>None</option>
                                    <option value="mild" ${(e==null?void 0:e.spiceLevel)==="mild"?"selected":""}>Mild</option>
                                    <option value="medium" ${(e==null?void 0:e.spiceLevel)==="medium"?"selected":""}>Medium</option>
                                    <option value="spicy" ${(e==null?void 0:e.spiceLevel)==="spicy"?"selected":""}>Spicy</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group mb-md">
                            <label class="form-label">Description</label>
                            <textarea id="menu-desc" class="form-input" rows="2" required>${(e==null?void 0:e.description)||""}</textarea>
                        </div>
                        
                        <div class="form-group mb-md">
                            <label class="form-label">Ingredients (comma separated)</label>
                            <input type="text" id="menu-ingredients" class="form-input" value="${o}">
                        </div>
                        
                        <div class="form-group mb-lg">
                            <label class="form-label">Product Image</label>
                            ${t&&e.image?`<div class="mb-sm"><img src="${e.image}" style="width: 100px; border-radius: var(--radius-sm);"></div>`:""}
                            <input type="file" id="menu-image-upload" class="form-input" accept="image/png, image/jpeg, image/webp" ${t?"":"required"}>
                            <p class="text-xs text-muted mt-xs">Max 5MB. Will be automatically optimized to WebP.</p>
                        </div>
                        
                        <div class="grid md:grid-cols-3 gap-md mb-lg">
                            <label class="flex items-center gap-sm" style="cursor: pointer;">
                                <input type="checkbox" id="menu-active" ${!t||e!=null&&e.is_active?"checked":""}>
                                <span>Active (Visible)</span>
                            </label>
                            <label class="flex items-center gap-sm" style="cursor: pointer;">
                                <input type="checkbox" id="menu-bestseller" ${l?"checked":""}>
                                <span>Bestseller</span>
                            </label>
                            <label class="flex items-center gap-sm" style="cursor: pointer;">
                                <input type="checkbox" id="menu-featured" ${m?"checked":""}>
                                <span>Featured Item</span>
                            </label>
                        </div>
                        
                        <button type="submit" id="menu-save-btn" class="btn btn-primary w-full" style="width:100%;">${t?"Save Changes":"Create Item"}</button>
                    </form>
                </div>
            `;const c=()=>u.innerHTML="";document.getElementById("admin-close-modal-btn").onclick=c,document.getElementById("admin-modal-overlay").onclick=c,document.getElementById("admin-menu-form").onsubmit=async g=>{g.preventDefault();const p=document.getElementById("menu-save-btn");p.disabled=!0,p.innerHTML='<span class="loading-spinner" style="display:inline-block;width:1rem;height:1rem;border:2px solid #fff;border-bottom-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:0.5rem;"></span> Processing...';try{const y=document.getElementById("menu-id").value,h=y!=="",x=h?y:"p"+Date.now();let I=h?e.image:"";const f=document.getElementById("menu-image-upload");if(f.files&&f.files[0]){const E=f.files[0];if(E.size>5*1024*1024)throw new Error("Image exceeds 5MB limit.");p.innerHTML="Optimizing Image...";const R=await r(E);p.innerHTML="Uploading to Storage...";const M=`${x}_${Date.now()}.webp`,{data:ne,error:L}=await d.storage.from("menu-images").upload(M,R,{upsert:!0});if(L)throw new Error("Image Upload Failed: "+L.message);const{data:V}=d.storage.from("menu-images").getPublicUrl(M);I=V.publicUrl}p.innerHTML="Saving to Database...";const _={id:x,name:document.getElementById("menu-name").value,category:document.getElementById("menu-category").value,price:parseFloat(document.getElementById("menu-price").value),spiceLevel:document.getElementById("menu-spice").value,description:document.getElementById("menu-desc").value,ingredients:document.getElementById("menu-ingredients").value.split(",").map(E=>E.trim()).filter(Boolean),image:I,is_active:document.getElementById("menu-active").checked,is_bestseller:document.getElementById("menu-bestseller").checked,is_featured:document.getElementById("menu-featured").checked},{error:w}=await d.from("menu_items").upsert([_]);if(w)throw w.message&&w.message.includes("column")?new Error("Database schema missing columns. Please run the provided ALTER TABLE SQL."):w;await n(h?"UPDATE_MENU":"CREATE_MENU","menu_items",{id:x,name:_.name}),a(h?"Item updated successfully!":"Item created successfully!"),c(),setTimeout(()=>window.history.go(0),1e3)}catch(y){a(y.message,"error"),p.disabled=!1,p.innerHTML=t?"Save Changes":"Create Item"}}},deleteItem:async(s,t)=>{if(confirm(`Are you sure you want to soft-delete "${t}"? It will be hidden from the menu.`))try{const{error:i}=await d.from("menu_items").update({deleted_at:new Date().toISOString()}).eq("id",s);if(i)throw i;await n("SOFT_DELETE_MENU","menu_items",{id:s,name:t}),a(`${t} has been moved to trash.`),setTimeout(()=>window.history.go(0),1e3)}catch(i){a(i.message,"error")}},restoreItem:async s=>{try{const{error:t}=await d.from("menu_items").update({deleted_at:null}).eq("id",s);if(t)throw t;await n("RESTORE_MENU","menu_items",{id:s}),a("Item restored successfully."),setTimeout(()=>window.history.go(0),1e3)}catch(t){a(t.message,"error")}}},!document.getElementById("admin-spinner-styles")){const s=document.createElement("style");s.id="admin-spinner-styles",s.innerHTML=`
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `,document.head.appendChild(s)}};const N=async()=>{let n={};try{const{data:e,error:o}=await d.from("settings").select("*").eq("type","general");if(o)throw o;e&&e.forEach(l=>{n[l.key]=l.value})}catch(e){console.error("Failed to fetch settings:",e)}const a=n.store_status||{isOpen:!0},r=n.delivery_fee||{fee:2.99},s=n.contact||{phone:"+1 234 567 8900",whatsapp:"+1 234 567 8900"},t=n.min_order||{amount:15},i=`
        <div class="flex justify-between items-center mb-xl">
            <div>
                <h2 class="text-white">General <span class="text-primary">Settings</span></h2>
                <p class="text-sm text-muted">Manage restaurant status, delivery fees, and contact details</p>
            </div>
        </div>
        
        <form id="admin-settings-form" class="grid md:grid-cols-2 gap-xl">
            <!-- Store Status -->
            <div class="glass-card p-lg" style="padding: var(--space-xl);">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Store Status</h3>
                
                <div class="form-group mb-md">
                    <label class="flex justify-between items-center cursor-pointer">
                        <span class="text-lg">Accepting Orders</span>
                        <div style="position: relative; display: inline-block; width: 50px; height: 26px;">
                            <input type="checkbox" id="setting-is-open" ${a.isOpen?"checked":""} style="opacity: 0; width: 0; height: 0;">
                            <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${a.isOpen?"var(--color-primary)":"#555"}; transition: .4s; border-radius: 34px;">
                                <span style="position: absolute; content: ''; height: 18px; width: 18px; left: ${a.isOpen?"28px":"4px"}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </span>
                        </div>
                    </label>
                    <p class="text-xs text-muted mt-xs">Turning this off will prevent customers from placing checkout orders.</p>
                </div>
            </div>
            
            <!-- Delivery & Minimums -->
            <div class="glass-card p-lg" style="padding: var(--space-xl);">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Order Settings</h3>
                
                <div class="form-group mb-md">
                    <label class="form-label">Delivery Charge (₹)</label>
                    <input type="number" id="setting-delivery-fee" class="form-input" step="0.01" value="${r.fee}" required>
                </div>
                
                <div class="form-group mb-md">
                    <label class="form-label">Minimum Order Amount (₹)</label>
                    <input type="number" id="setting-min-order" class="form-input" step="0.01" value="${t.amount}" required>
                </div>
            </div>
            
            <!-- Contact Details -->
            <div class="glass-card p-lg" style="padding: var(--space-xl); grid-column: 1 / -1;">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Contact & Social</h3>
                
                <div class="grid md:grid-cols-2 gap-lg">
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="text" id="setting-phone" class="form-input" value="${s.phone}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">WhatsApp Number</label>
                        <input type="text" id="setting-whatsapp" class="form-input" value="${s.whatsapp}" required>
                    </div>
                </div>
            </div>
            
            <div class="grid-column: 1 / -1" style="grid-column: 1 / -1;">
                <button type="submit" id="save-settings-btn" class="btn btn-primary w-full" style="width:100%; padding: 1rem; font-size: 1.1rem;">Save All Settings</button>
            </div>
        </form>
        
        <div id="admin-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>
    `;return k(i,"/admin/settings")};N.mount=()=>{const n=document.getElementById("setting-is-open");n&&n.addEventListener("change",s=>{const t=s.target.nextElementSibling,i=t.firstElementChild;s.target.checked?(t.style.backgroundColor="var(--color-primary)",i.style.left="28px"):(t.style.backgroundColor="#555",i.style.left="4px")});const a=(s,t="success")=>{const i=document.getElementById("admin-toast-container");if(!i)return;const e=document.createElement("div");e.className="glass-card fade-in slide-up",e.style.padding="1rem 1.5rem",e.style.borderLeft=`4px solid ${t==="success"?"#28a745":"var(--color-error)"}`,e.style.display="flex",e.style.alignItems="center",e.style.gap="0.5rem",e.innerHTML=`
            <strong style="color: ${t==="success"?"#28a745":"var(--color-error)"}">${t==="success"?"Success":"Error"}</strong>
            <span>${s}</span>
        `,i.appendChild(e),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(20px)",setTimeout(()=>e.remove(),300)},4e3)},r=document.getElementById("admin-settings-form");r&&r.addEventListener("submit",async s=>{s.preventDefault();const t=document.getElementById("save-settings-btn");t.disabled=!0,t.textContent="Saving...";try{await d.from("settings").upsert({key:"store_status",type:"general",value:{isOpen:document.getElementById("setting-is-open").checked}},{onConflict:"key"}),await d.from("settings").upsert({key:"delivery_fee",type:"general",value:{fee:parseFloat(document.getElementById("setting-delivery-fee").value)}},{onConflict:"key"}),await d.from("settings").upsert({key:"min_order",type:"general",value:{amount:parseFloat(document.getElementById("setting-min-order").value)}},{onConflict:"key"}),await d.from("settings").upsert({key:"contact",type:"general",value:{phone:document.getElementById("setting-phone").value,whatsapp:document.getElementById("setting-whatsapp").value}},{onConflict:"key"});const{data:{user:i}}=await d.auth.getUser();await d.from("audit_logs").insert([{user_id:i==null?void 0:i.id,action:"UPDATE_SETTINGS",resource:"settings",details:{updated:["store_status","delivery_fee","min_order","contact"]}}]),a("Settings saved successfully!")}catch(i){console.error(i),a("Failed to save settings: "+i.message,"error")}t.disabled=!1,t.textContent="Save All Settings"})};const U=async()=>{let n=[];try{const{data:s,error:t}=await d.from("settings").select("*").eq("type","banner");if(t)throw t;n=s||[]}catch(s){console.error("Failed to fetch banners:",s)}const a=n.map(s=>{const t=s.value,i=t.is_active?'<span class="badge" style="background:var(--color-success); color:white;">Active</span>':'<span class="badge" style="background:#555; color:white;">Disabled</span>';return`
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 1rem;">
                    <img src="${t.image_url}" alt="Banner" style="width: 120px; height: 60px; border-radius: var(--radius-sm); object-fit: cover;">
                </td>
                <td style="padding: 1rem;">
                    <div style="font-weight: bold;">${t.title}</div>
                    <div class="text-xs text-muted">${t.subtitle}</div>
                </td>
                <td style="padding: 1rem;">${i}</td>
                <td style="padding: 1rem; text-align: right;">
                    <div class="flex gap-sm justify-end">
                        <button class="btn-icon text-error" title="Delete" onclick="window.adminBannerActions.deleteBanner('${s.key}')">
                            ${v.Trash}
                        </button>
                    </div>
                </td>
            </tr>
        `}).join(""),r=`
        <div class="flex justify-between items-center mb-xl">
            <div>
                <h2 class="text-white">Hero <span class="text-primary">Banners</span></h2>
                <p class="text-sm text-muted">Manage the large rotating images on the home page</p>
            </div>
            <button class="btn btn-primary flex items-center gap-sm" onclick="window.adminBannerActions.openModal()">
                ${v.Plus} Add Banner
            </button>
        </div>
        
        <div class="glass-card" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--color-text-muted);">
                        <th style="padding: 1rem;">Image</th>
                        <th style="padding: 1rem;">Text Content</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${a.length>0?a:'<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">No banners found. The default fallback will be used.</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <div id="admin-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>
        <div id="admin-modal-container"></div>
    `;return k(r,"/admin/banners")};U.mount=()=>{const n=(a,r="success")=>{const s=document.getElementById("admin-toast-container");if(!s)return;const t=document.createElement("div");t.className="glass-card fade-in slide-up",t.style.padding="1rem 1.5rem",t.style.borderLeft=`4px solid ${r==="success"?"#28a745":"var(--color-error)"}`,t.innerHTML=`<strong>${r==="success"?"Success":"Error"}</strong> <span style="margin-left: 0.5rem;">${a}</span>`,s.appendChild(t),setTimeout(()=>t.remove(),4e3)};window.adminBannerActions={openModal:()=>{const a=document.getElementById("admin-modal-container");a.innerHTML=`
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 1000;" id="admin-modal-overlay"></div>
                <div class="glass-card" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1001; width: 95%; max-width: 500px; padding: var(--space-xl);">
                    <div class="flex justify-between items-center mb-lg pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3>Upload Hero Banner</h3>
                        <button class="btn-icon" id="admin-close-modal-btn">${v.Close}</button>
                    </div>
                    
                    <form id="admin-banner-form">
                        <div class="form-group mb-md">
                            <label class="form-label">Headline (e.g. BIG FLAVOR.)</label>
                            <input type="text" id="banner-title" class="form-input" required>
                        </div>
                        <div class="form-group mb-md">
                            <label class="form-label">Sub-headline (e.g. EVERY BITE.)</label>
                            <input type="text" id="banner-subtitle" class="form-input" required>
                        </div>
                        <div class="form-group mb-md">
                            <label class="form-label">Description text</label>
                            <textarea id="banner-desc" class="form-input" rows="2" required></textarea>
                        </div>
                        <div class="form-group mb-lg">
                            <label class="form-label">High-Quality Background Image</label>
                            <input type="file" id="banner-image" class="form-input" accept="image/png, image/jpeg, image/webp" required>
                            <p class="text-xs text-muted mt-xs">Will be converted to WebP. Ideal ratio 16:9.</p>
                        </div>
                        <label class="flex items-center gap-sm mb-lg" style="cursor: pointer;">
                            <input type="checkbox" id="banner-active" checked>
                            <span>Enable immediately</span>
                        </label>
                        <button type="submit" id="banner-save-btn" class="btn btn-primary w-full" style="width:100%;">Upload & Save</button>
                    </form>
                </div>
            `;const r=()=>a.innerHTML="";document.getElementById("admin-close-modal-btn").onclick=r,document.getElementById("admin-modal-overlay").onclick=r,document.getElementById("admin-banner-form").onsubmit=async s=>{s.preventDefault();const t=document.getElementById("banner-save-btn");t.disabled=!0,t.innerHTML="Optimizing & Uploading...";try{const e=document.getElementById("banner-image").files[0];if(e.size>8*1024*1024)throw new Error("File too large. Max 8MB.");const o=`banner_${Date.now()}.${e.name.split(".").pop()}`,{data:l,error:m}=await d.storage.from("menu-images").upload("banners/"+o,e);if(m)throw m;const{data:u}=d.storage.from("menu-images").getPublicUrl("banners/"+o),c={title:document.getElementById("banner-title").value,subtitle:document.getElementById("banner-subtitle").value,desc:document.getElementById("banner-desc").value,image_url:u.publicUrl,is_active:document.getElementById("banner-active").checked},g="banner_"+Date.now(),{error:p}=await d.from("settings").insert([{key:g,type:"banner",value:c}]);if(p)throw p;n("Banner uploaded successfully!"),setTimeout(()=>window.history.go(0),1e3)}catch(i){n(i.message,"error"),t.disabled=!1,t.innerHTML="Upload & Save"}}},deleteBanner:async a=>{if(confirm("Delete this banner?"))try{await d.from("settings").delete().eq("key",a),n("Banner deleted."),setTimeout(()=>window.history.go(0),1e3)}catch(r){n(r.message,"error")}}}};class re{constructor(){this.routes={"/":ee,"/menu":D,"/checkout":j,"/profile":ae,"/admin":q,"/admin/dashboard":F,"/admin/menu":H,"/admin/settings":N,"/admin/banners":U},this.rootElement=document.getElementById("router-view"),window.addEventListener("popstate",()=>this.handleRoute()),document.body.addEventListener("click",a=>{a.target.matches("[data-link]")?(a.preventDefault(),this.navigate(a.target.getAttribute("href"))):a.target.closest("[data-link]")&&(a.preventDefault(),this.navigate(a.target.closest("[data-link]").getAttribute("href")))})}navigate(a){window.history.pushState(null,null,a),this.handleRoute()}async handleRoute(){let a=window.location.pathname;if(this.routes[a]||(a="/"),a.startsWith("/admin")){const{data:{session:s}}=await d.auth.getSession();if(a==="/admin"){if(s){this.navigate("/admin/dashboard");return}}else if(!s){this.navigate("/admin");return}}window.appActions&&typeof window.appActions.toggleCart=="function"&&window.appActions.toggleCart(!1);const r=this.routes[a];this.rootElement.style.opacity="0",setTimeout(async()=>{const s=await r();this.rootElement.innerHTML=s,r.mount&&r.mount(),this.rootElement.style.opacity="1",window.scrollTo(0,0),document.querySelectorAll(".nav-link").forEach(t=>{t.getAttribute("href")===a?t.classList.add("active"):t.classList.remove("active")})},150)}init(){this.rootElement.style.transition="opacity 0.15s ease",this.handleRoute()}}const z=new re,C=Object.freeze(Object.defineProperty({__proto__:null,router:z},Symbol.toStringTag,{value:"Module"}));window.appActions={updateQty:(n,a)=>b.updateQuantity(n,a),removeFromCart:n=>b.removeFromCart(n),toggleCart:()=>b.toggleCart()};const O=()=>{const n=document.getElementById("site-header");n.innerHTML||(n.innerHTML=X());const a=document.getElementById("site-footer");a.innerHTML||(a.innerHTML=K());const r=document.getElementById("cart-count-badge");r&&(r.textContent=b.getCartCount(),r.style.transform="scale(1.2)",setTimeout(()=>r.style.transform="scale(1)",200));const s=document.getElementById("cart-drawer-container"),t=b.getState();s.innerHTML=Z(),t.cartOpen?s.classList.add("cart-open"):s.classList.remove("cart-open");const i=document.getElementById("close-cart-btn");i&&i.addEventListener("click",()=>b.toggleCart(!1));const e=document.getElementById("cart-overlay");e&&e.addEventListener("click",()=>b.toggleCart(!1));const o=document.getElementById("open-cart-btn"),l=o.cloneNode(!0);o.parentNode.replaceChild(l,o),l.addEventListener("click",()=>b.toggleCart(!0)),window.addEventListener("scroll",()=>{window.scrollY>50?n.classList.add("scrolled"):n.classList.remove("scrolled")},{passive:!0})},ie=async()=>{await b.initData(),b.subscribe(()=>{O()}),O(),z.init()};document.addEventListener("DOMContentLoaded",ie);
