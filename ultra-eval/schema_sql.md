# Ultra Eval Database Schema 🗄️

Run the following SQL in your **Supabase SQL Editor** to set up the database for production.

## 1. Main Tables

```sql
-- Create students table linked to Auth users
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  elo INTEGER DEFAULT 0,
  school VARCHAR(255),
  grade VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('accomplishment', 'todo', 'award', 'impact')),
  file_urls TEXT[],
  elo_awarded INTEGER NOT NULL,
  ai_feedback TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE
);
```

## 2. Automation & Triggers

```sql
-- Function to automatically create a student profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, email, name, avatar_url, elo)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 3. Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Students: Everyone can see profiles, only owner can edit
CREATE POLICY "Public students are viewable by everyone" 
ON public.students FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.students FOR UPDATE USING (auth.uid() = id);

-- Reports: Only owner can see/manage their reports
CREATE POLICY "Users can view own reports" 
ON public.reports FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = student_id);
```

## 4. Performance Indexes

```sql
CREATE INDEX idx_students_elo ON students(elo DESC);
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```
