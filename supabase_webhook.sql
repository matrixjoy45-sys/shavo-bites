-- Enable the pg_net extension (Required for making outbound HTTP requests from Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.invoke_order_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Construct the exact same payload format that Edge Functions expect from native webhooks
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_RELNAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', null
  );

  -- Dispatch the async HTTP POST request using pg_net
  SELECT net.http_post(
    url := 'https://nrwufrmqzzdqzvoabtdo.supabase.co/functions/v1/order-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$;

-- Attach the trigger to the orders table
DROP TRIGGER IF EXISTS on_order_inserted ON public.orders;
CREATE TRIGGER on_order_inserted
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.invoke_order_webhook();
