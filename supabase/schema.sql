-- ============================================================
-- PERSONAL FINANCE TRACKER — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  full_name            TEXT,
  avatar_url           TEXT,
  currency             TEXT DEFAULT '₹',
  monthly_income_target NUMERIC(12,2) DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount           NUMERIC(12,2) NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category         TEXT NOT NULL,
  tags             TEXT[] DEFAULT '{}',
  payment_mode     TEXT CHECK (payment_mode IN ('UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Other')),
  notes            TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  is_recurring     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON public.transactions(user_id, transaction_date DESC);

-- ============================================================
-- TABLE: emis (Recurring Payments & Subscriptions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emis (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  lender_or_source    TEXT,
  monthly_amount      NUMERIC(12,2) NOT NULL,
  total_tenure_months INT, -- Nullable for open-ended subscriptions like Netflix/Prime
  paid_tenure_months  INT DEFAULT 0,
  due_day             INT CHECK (due_day BETWEEN 1 AND 31),
  interest_rate       NUMERIC(5,2),
  recurring_type      TEXT DEFAULT 'emi' CHECK (recurring_type IN ('emi', 'subscription')),
  category            TEXT DEFAULT 'EMI & Loans',
  start_date          DATE,
  end_date            DATE, -- NULL for subscriptions (no end date)
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Migration query if table already exists in Supabase:
-- ALTER TABLE public.emis ADD COLUMN IF NOT EXISTS recurring_type TEXT DEFAULT 'emi' CHECK (recurring_type IN ('emi', 'subscription'));
-- ALTER TABLE public.emis ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'EMI & Loans';
-- ALTER TABLE public.emis ADD COLUMN IF NOT EXISTS start_date DATE;
-- ALTER TABLE public.emis ADD COLUMN IF NOT EXISTS end_date DATE;
-- ALTER TABLE public.emis ALTER COLUMN total_tenure_months DROP NOT NULL;

ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emis"
  ON public.emis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emis"
  ON public.emis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emis"
  ON public.emis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emis"
  ON public.emis FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year   TEXT NOT NULL,
  category     TEXT NOT NULL,
  budget_limit NUMERIC(12,2) NOT NULL,
  UNIQUE (user_id, month_year, category)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: presets (Quick-Add Presets)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.presets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  amount       NUMERIC(12,2) NOT NULL,
  category     TEXT NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  payment_mode TEXT,
  type         TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own presets"
  ON public.presets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DONE! Now configure Google OAuth:
-- 1. Go to Supabase Dashboard → Authentication → Providers → Google
-- 2. Enable Google, add your Client ID and Secret from Google Cloud Console
-- 3. Add redirect URL: https://your-project-ref.supabase.co/auth/v1/callback
-- ============================================================
