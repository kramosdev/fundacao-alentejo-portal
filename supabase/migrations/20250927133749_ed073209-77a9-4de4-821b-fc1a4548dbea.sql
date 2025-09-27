-- Allow users to update their own notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to insert their own request history
DROP POLICY IF EXISTS "Users can insert their own request history" ON public.request_history;
CREATE POLICY "Users can insert their own request history"
ON public.request_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);