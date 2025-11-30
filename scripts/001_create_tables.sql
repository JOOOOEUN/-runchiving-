-- Create races table for marathon event information
CREATE TABLE IF NOT EXISTS races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  distance TEXT NOT NULL, -- e.g., '5K', '10K', 'Half', 'Full'
  course_description TEXT,
  elevation_gain INTEGER, -- in meters
  difficulty TEXT, -- 'Easy', 'Moderate', 'Hard'
  registration_url TEXT,
  registration_deadline DATE,
  max_participants INTEGER,
  weather_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registrations table for tracking user race registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  bib_number TEXT,
  status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'completed', 'cancelled'
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

-- Create records table for storing race results
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  finish_time INTERVAL NOT NULL, -- stored as PostgreSQL interval
  pace INTERVAL, -- average pace per km
  position INTEGER, -- overall position
  photo_url TEXT,
  medal_photo_url TEXT,
  notes TEXT,
  completed_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for races (public read, no write from users)
CREATE POLICY "races_select_all" ON races FOR SELECT USING (true);

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for registrations
CREATE POLICY "registrations_select_own" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "registrations_insert_own" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "registrations_update_own" ON registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "registrations_delete_own" ON registrations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for records
CREATE POLICY "records_select_own" ON records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "records_insert_own" ON records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "records_update_own" ON records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "records_delete_own" ON records FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', SPLIT_PART(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
