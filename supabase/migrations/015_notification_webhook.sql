-- migration: 015_notification_webhook.sql
-- Configure database webhook trigger to fire FCM push notification edge function on new notification logs

-- Ensure extensions schema has pg_net enabled
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.notify_push_notification_webhook()
RETURNS TRIGGER AS $$
DECLARE
  v_payload JSONB;
  v_url TEXT;
BEGIN
  -- Construct payload matching standard database webhook structure
  v_payload := jsonb_build_object(
    'record', row_to_json(NEW),
    'type', 'INSERT',
    'table', 'notification_log',
    'schema', 'public'
  );

  -- Target push-notifications edge function URL
  v_url := 'https://oeringgdbxmmihgvuyfa.supabase.co/functions/v1/push-notifications';
  
  -- Invoke pg_net HTTP POST asynchronously to avoid blocking transactional writes
  PERFORM extensions.http_post(
    v_url,
    v_payload,
    '{}'::jsonb,
    '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to notification_log table
DROP TRIGGER IF EXISTS notification_log_webhook_trig ON public.notification_log;
CREATE TRIGGER notification_log_webhook_trig
AFTER INSERT ON public.notification_log
FOR EACH ROW EXECUTE FUNCTION public.notify_push_notification_webhook();
