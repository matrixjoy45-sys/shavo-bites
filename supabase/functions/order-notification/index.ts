import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// This edge function is triggered by a Supabase Database Webhook whenever a new order is inserted.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    // 1. Parse the Webhook payload from Supabase
    // Expected structure: { type: 'INSERT', table: 'orders', record: { ... } }
    const payload = await req.json();
    console.log("Received Webhook Payload:", payload);

    if (payload.type !== "INSERT" || payload.table !== "orders") {
      return new Response(JSON.stringify({ message: "Ignored: Not an order insertion" }), { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200 
      });
    }

    const order = payload.record;

    // 2. Initialize Supabase Client with Service Role Key to bypass RLS and fetch customer details
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables for Service Role.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch customer details
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", order.customer_id)
      .single();

    if (customerError || !customer) {
      console.error("Failed to fetch customer:", customerError);
      throw new Error("Customer not found for order.");
    }

    // 3. Format the Email HTML
    let itemsList = "";
    if (Array.isArray(order.items)) {
        itemsList = order.items.map((item: any) => {
            const price = item.product?.price || 0;
            return `<li>${item.quantity}x ${item.product?.name || 'Item'} - ₹${(price * item.quantity).toFixed(2)}</li>`;
        }).join("");
    }

    // Fetch full order to ensure we have the database-generated created_at timestamp
    const { data: dbOrder } = await supabase
        .from("orders")
        .select("created_at")
        .eq("id", order.id)
        .single();
        
    const orderCreatedAt = dbOrder?.created_at || order.created_at;

    let orderTimeStr = "N/A";
    if (orderCreatedAt) {
        const d = new Date(orderCreatedAt);
        if (!isNaN(d.getTime())) {
            // e.g. "27 Jul 2026, 03:43 AM"
            orderTimeStr = d.toLocaleString("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }).toUpperCase(); 
            // en-GB sometimes outputs 'am' / 'pm', uppercase makes it 'AM' / 'PM'
            // Format might be "27 Jul 2026, 03:43 am". Replace if needed.
            // Actually en-GB format is "27 Jul 2026, 03:43 am"
            orderTimeStr = orderTimeStr.replace(/ AM/i, ' AM').replace(/ PM/i, ' PM');
        }
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d4af37; text-align: center;">🍽️ New Order Received!</h2>
          <p style="text-align: center; color: #666;">A new order has been placed on SHAVO BITES.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <h3 style="margin-bottom: 5px;">Order Details</h3>
          <p style="margin: 2px 0;"><strong>Order ID:</strong> ${order.id}</p>
          <p style="margin: 2px 0;"><strong>Order Time:</strong> ${orderTimeStr}</p>
          <p style="margin: 2px 0;"><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
          
          <h3 style="margin-bottom: 5px; margin-top: 20px;">Customer Details</h3>
          <p style="margin: 2px 0;"><strong>Name:</strong> ${customer.name}</p>
          <p style="margin: 2px 0;"><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Address:</strong> ${customer.house}, ${customer.street}, ${customer.city} - ${customer.pin}</p>
          
          <h3 style="margin-bottom: 5px; margin-top: 20px;">Items</h3>
          <ul style="margin-top: 5px; padding-left: 20px;">
            ${itemsList}
          </ul>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 2px 0; display: flex; justify-content: space-between;"><span>Subtotal:</span> <strong>₹${order.subtotal}</strong></p>
              <p style="margin: 2px 0; display: flex; justify-content: space-between;"><span>Delivery Fee:</span> <strong>₹${order.delivery_fee}</strong></p>
              <h3 style="margin: 10px 0 0 0; display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 10px;"><span>Total Amount:</span> <span style="color: #d4af37;">₹${order.total}</span></h3>
          </div>
      </div>
    `;

    // 4. Send Email Notification via Resend API
    // Note: Outbound SMTP ports (25, 465, 587) are blocked on Deno Deploy / Edge Functions.
    // Therefore, using an HTTP API like Resend is the officially supported architecture.
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    // Hardcoded testing email as requested due to Resend sandbox limitations
    const myEmail = "matrixjoy45@gmail.com";

    if (!resendApiKey || !myEmail) {
      throw new Error("Missing RESEND_API_KEY secret.");
    }

    console.log(`Sending email to ${myEmail}...`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "SHAVO BITES <onboarding@resend.dev>", // Resend's testing domain allows sending without DNS setup
        to: myEmail,
        subject: "🍽️ New Order - SHAVO BITES",
        html: emailHtml
      })
    });

    if (!emailResponse.ok) {
      const errTxt = await emailResponse.text();
      throw new Error(`Email API failed: ${errTxt}`);
    }

    console.log("✅ Email delivered successfully!");

    return new Response(JSON.stringify({ success: true, message: "Notifications dispatched successfully." }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
