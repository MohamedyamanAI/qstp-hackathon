-- Enable UUID extension (standard for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM ('founder', 'team');
CREATE TYPE language_pref AS ENUM ('en', 'ar');
CREATE TYPE startup_stage AS ENUM ('idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth');
CREATE TYPE startup_tier AS ENUM ('spark', 'catalyst', 'trailblazer', 'pioneer', 'legend');
CREATE TYPE submission_status AS ENUM ('draft', 'submitted');
CREATE TYPE feedback_reaction AS ENUM ('kudos', 'flag', 'clarify', 'none');
CREATE TYPE opportunity_category AS ENUM ('grant', 'competition', 'investor', 'customer', 'talent', 'resource');
CREATE TYPE opportunity_status AS ENUM ('new', 'saved', 'applied', 'dismissed');
CREATE TYPE distribution_type AS ENUM ('investor_update', 'board_deck', 'pitch_deck', 'grant_report', 'internal_post', 'linkedin_post');
CREATE TYPE template_scope AS ENUM ('founder', 'team', 'system');

-- ==========================================
-- 2. CORE ENTITIES
-- ==========================================

-- Extends Supabase auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'founder',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    language_preference language_pref NOT NULL DEFAULT 'en',
    preferences JSONB NOT NULL DEFAULT '{"notifications": {"email": true, "push": true, "whatsapp": false}, "theme": "system"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The core entity representing a company
CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sector TEXT NOT NULL, -- e.g., HealthTech, E-Commerce, EdTech, etc.
    stage startup_stage NOT NULL,
    cohort TEXT,
    team_size INTEGER DEFAULT 1,
    is_software_product BOOLEAN, -- Is your product a software solution or digital product?
    health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
    points_balance INTEGER DEFAULT 0,
    tier startup_tier NOT NULL DEFAULT 'spark',
    investor_mode_enabled BOOLEAN DEFAULT false,
    investor_mode_password_hash TEXT, -- Optional password protection for the data room
    recipients JSONB NOT NULL DEFAULT '[]'::jsonb, -- Replaces recipient_profiles table
    connected_integrations JSONB NOT NULL DEFAULT '{"github": false, "stripe": false}'::jsonb, -- Replaces integrations table
    extended_profile JSONB NOT NULL DEFAULT '{}'::jsonb, -- Cap Table, Compliance, CR Number
    privacy_settings JSONB NOT NULL DEFAULT '{"cohort_benchmarking": true, "public_wins": true}'::jsonb,
    form_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Admin config: which weekly questions are enabled/disabled for this startup
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps team members to specific startups they oversee
CREATE TABLE team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_member_id, startup_id)
);

-- ==========================================
-- 3. KPI & REPORTING ENGINE
-- ==========================================

-- The unified report submitted by the founder
CREATE TABLE kpi_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    status submission_status NOT NULL DEFAULT 'draft',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb, -- Stores the weekly report answers (Revenue, MRR, Grants, etc.)
    verified_fields JSONB NOT NULL DEFAULT '{}'::jsonb, -- Tracks which fields were auto-pulled vs manual
    generated_outputs JSONB NOT NULL DEFAULT '{}'::jsonb, -- Replaces distributions table (stores drafted emails, posts)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Incubation team feedback on submissions
CREATE TABLE submission_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES kpi_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Team member leaving feedback
    content TEXT NOT NULL,
    reaction feedback_reaction DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates for Distribute and Reports pages
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE, -- Null if it's a team/system template
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type distribution_type NOT NULL, -- e.g., 'investor_update', 'grant_report'
    scope template_scope NOT NULL DEFAULT 'founder',
    content JSONB NOT NULL, -- The actual template structure/text
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. UNFAIR ADVANTAGE FINDER
-- ==========================================

-- Simplified opportunities table (combines global catalog and startup matches for MVP)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE, -- Null means it's a global opportunity, UUID means it's matched to a startup
    title TEXT NOT NULL,
    category opportunity_category NOT NULL,
    source TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    description TEXT NOT NULL,
    fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
    status opportunity_status NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. NOTIFICATIONS
-- ==========================================

-- Notifications inbox
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'submission_reminder', 'new_opportunity'
    content JSONB NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. TRIGGERS
-- ==========================================

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON startups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_submissions_updated_at BEFORE UPDATE ON kpi_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submission_feedback_updated_at BEFORE UPDATE ON submission_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();