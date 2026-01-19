-- =============================================
-- Migration: Reactions and Replies
-- =============================================

-- =============================================
-- 1. ADD REPLY_TO COLUMN TO MESSAGES
-- =============================================

ALTER TABLE public.messages
ADD COLUMN reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX idx_messages_reply_to_id ON public.messages(reply_to_id);

-- =============================================
-- 2. CREATE REACTIONS TABLE
-- =============================================

CREATE TABLE public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Prevent duplicate reactions (same user, same message, same emoji)
  CONSTRAINT unique_reaction UNIQUE (message_id, user_id, emoji)
);

-- Indexes for faster lookups
CREATE INDEX idx_reactions_message_id ON public.reactions(message_id);
CREATE INDEX idx_reactions_user_id ON public.reactions(user_id);

-- =============================================
-- 3. ROW LEVEL SECURITY FOR REACTIONS
-- =============================================

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view reactions
CREATE POLICY "Reactions are viewable by authenticated users"
  ON public.reactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can add their own reactions
CREATE POLICY "Users can add their own reactions"
  ON public.reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
  ON public.reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 4. ENABLE REALTIME FOR REACTIONS
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
