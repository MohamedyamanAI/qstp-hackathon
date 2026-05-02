-- Enable UUID extension (standard for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM ('founder', 'team');
CREATE TYPE language_pref_enum AS ENUM ('en', 'ar');
CREATE TYPE startup_stage_enum AS ENUM ('idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth');
CREATE TYPE startup_tier_enum AS ENUM ('spark', 'catalyst', 'trailblazer', 'pioneer', 'legend');
CREATE TYPE submission_status_enum AS ENUM ('draft', 'submitted');
CREATE TYPE feedback_reaction_enum AS ENUM ('kudos', 'flag', 'clarify', 'none');
CREATE TYPE opportunity_category_enum AS ENUM ('grant', 'competition', 'investor', 'customer', 'talent', 'resource');
CREATE TYPE opportunity_status_enum AS ENUM ('new', 'saved', 'applied', 'dismissed');
CREATE TYPE distribution_type_enum AS ENUM ('investor_update', 'board_deck', 'pitch_deck', 'grant_report', 'internal_post', 'linkedin_post');
CREATE TYPE template_scope_enum AS ENUM ('founder', 'team', 'system');
CREATE TYPE message_role_enum AS ENUM ('user', 'assistant', 'tool');
CREATE TYPE media_type_enum AS ENUM ('document', 'spreadsheet', 'image', 'video', 'audio', 'other');
CREATE TYPE media_related_type_enum AS ENUM ('startup', 'kpi_submission', 'opportunity', 'template', 'profile', 'ai_chat');

-- ============================================================================
-- 2. PROFILES (Extends auth.users)
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'founder',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    language_preference language_pref_enum NOT NULL DEFAULT 'en',
    
    -- Validated by Zod at application level
    preferences JSONB NOT NULL DEFAULT '{"notifications": {"email": true, "push": true, "whatsapp": false}, "theme": "system"}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_profiles_email UNIQUE (email)
);

-- ============================================================================
-- 3. STARTUPS
-- ============================================================================

CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    stage startup_stage_enum NOT NULL,
    cohort TEXT,
    team_size INTEGER DEFAULT 1,
    is_software_product BOOLEAN,
    health_score INTEGER DEFAULT 0,
    points_balance INTEGER DEFAULT 0,
    tier startup_tier_enum NOT NULL DEFAULT 'spark',
    investor_mode_enabled BOOLEAN DEFAULT false,
    investor_mode_password_hash TEXT,
    
    -- Validated by Zod at application level (Replaces recipient_profiles table)
    recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Validated by Zod at application level (Replaces integrations table)
    connected_integrations JSONB NOT NULL DEFAULT '{"github": false, "stripe": false}'::jsonb,
    
    -- Validated by Zod at application level (Cap Table, Compliance, CR Number)
    extended_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Validated by Zod at application level
    privacy_settings JSONB NOT NULL DEFAULT '{"cohort_benchmarking": true, "public_wins": true}'::jsonb,
    
    -- Validated by Zod at application level (Admin config: questions enabled/disabled)
    form_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_startups_health_score CHECK (health_score >= 0 AND health_score <= 100)
);

-- ============================================================================
-- 4. TEAM ASSIGNMENTS
-- ============================================================================

CREATE TABLE team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_team_assignments UNIQUE (team_member_id, startup_id)
);

-- ============================================================================
-- 5. KPI & REPORTING ENGINE
-- ============================================================================

CREATE TABLE kpi_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    status submission_status_enum NOT NULL DEFAULT 'draft',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Validated by Zod at application level (Stores the weekly report answers)
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Validated by Zod at application level (Tracks which fields were auto-pulled)
    verified_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Validated by Zod at application level (Stores drafted emails, posts)
    generated_outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

CREATE TABLE submission_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES kpi_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reaction feedback_reaction_enum DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type distribution_type_enum NOT NULL,
    scope template_scope_enum NOT NULL DEFAULT 'founder',
    
    -- Validated by Zod at application level (Template structure/text)
    content JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. UNFAIR ADVANTAGE FINDER
-- ============================================================================

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category opportunity_category_enum NOT NULL,
    source TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    description TEXT NOT NULL,
    fit_score INTEGER,
    status opportunity_status_enum NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_opportunities_fit_score CHECK (fit_score >= 0 AND fit_score <= 100)
);

-- ============================================================================
-- 7. NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    
    -- Validated by Zod at application level
    content JSONB NOT NULL,
    
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. AI CHATS
-- ============================================================================

CREATE TABLE ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
    role message_role_enum NOT NULL,
    content TEXT,
    
    -- Validated by Zod at application level (Assistant's tool call requests)
    tool_calls JSONB,
    tool_call_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_message_has_content_or_tool_call CHECK (content IS NOT NULL OR tool_calls IS NOT NULL)
);

-- ============================================================================
-- 9. MEDIA & UPLOADS
-- ============================================================================

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    original_name TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    type media_type_enum NOT NULL DEFAULT 'document',
    parsed_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    related_type media_related_type_enum NOT NULL,
    related_id UUID NOT NULL,
    
    CONSTRAINT uk_media_relationship UNIQUE(media_id, related_type, related_id)
);

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON startups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kpi_submissions_updated_at BEFORE UPDATE ON kpi_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submission_feedback_updated_at BEFORE UPDATE ON submission_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_chats_updated_at BEFORE UPDATE ON ai_chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 11. AUTH INTEGRATION (Auto-provision Profile)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 12. INDEXES
-- ============================================================================

-- Foreign keys
CREATE INDEX idx_startups_founder_id ON startups(founder_id);
CREATE INDEX idx_team_assignments_team_member_id ON team_assignments(team_member_id);
CREATE INDEX idx_team_assignments_startup_id ON team_assignments(startup_id);
CREATE INDEX idx_kpi_submissions_startup_id ON kpi_submissions(startup_id);
CREATE INDEX idx_kpi_submissions_submitted_by ON kpi_submissions(submitted_by);
CREATE INDEX idx_submission_feedback_submission_id ON submission_feedback(submission_id);
CREATE INDEX idx_submission_feedback_user_id ON submission_feedback(user_id);
CREATE INDEX idx_templates_startup_id ON templates(startup_id);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_opportunities_startup_id ON opportunities(startup_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX idx_ai_chat_messages_chat_id ON ai_chat_messages(chat_id);
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_relationships_media_id ON media_relationships(media_id);

-- Filter / Lookup columns
CREATE INDEX idx_startups_stage ON startups(stage);
CREATE INDEX idx_startups_tier ON startups(tier);
CREATE INDEX idx_kpi_submissions_status ON kpi_submissions(status);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_scope ON templates(scope);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_media_type ON media(type);

-- Composite / Polymorphic lookups
CREATE INDEX idx_media_relationships_related ON media_relationships(related_type, related_id);

-- ============================================================================
-- 13. STORAGE BUCKETS & POLICIES
-- ============================================================================

-- Note: The following requires the storage schema to exist (standard in Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', false) ON CONFLICT (id) DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('public', 'public', true) ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);
-- CREATE POLICY "Users can view own media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);
-- CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);
-- CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);

-- ============================================================================
-- 14. COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'Extended user profiles tied to Supabase auth.users';
COMMENT ON COLUMN profiles.preferences IS 'User app preferences, validated by Zod schema';

COMMENT ON TABLE startups IS 'Core startup entities representing companies';
COMMENT ON COLUMN startups.health_score IS 'Calculated health score out of 100';
COMMENT ON COLUMN startups.recipients IS 'Stored report recipients, validated by Zod at application level';

COMMENT ON TABLE team_assignments IS 'Junction table mapping team members to startups';

COMMENT ON TABLE kpi_submissions IS 'Unified weekly KPI reports submitted by founders';
COMMENT ON COLUMN kpi_submissions.metrics IS 'Weekly report answers, validated by Zod';

COMMENT ON TABLE submission_feedback IS 'Incubation team feedback on submissions';

COMMENT ON TABLE templates IS 'Reusable distribution templates';
COMMENT ON COLUMN templates.content IS 'Template configuration and text blocks, validated by Zod';

COMMENT ON TABLE opportunities IS 'Global catalog and matched opportunities';

COMMENT ON TABLE notifications IS 'User inbox for alerts and updates';

COMMENT ON TABLE ai_chats IS 'AI Chat sessions for the user';
COMMENT ON TABLE ai_chat_messages IS 'AI Chat messages modeling the OpenAI tool-calling protocol';
COMMENT ON COLUMN ai_chat_messages.tool_calls IS 'Assistant tool call requests, validated by Zod';

COMMENT ON TABLE media IS 'Dedicated media table with parsed content field';
COMMENT ON TABLE media_relationships IS 'Polymorphic association linking media to various entities';

-- ============================================================================
-- 15. EXAMPLE DATA
-- ============================================================================

-- INSERT INTO profiles (id, role, full_name, email)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000', 'founder', 'John Doe', 'john@example.com');

-- INSERT INTO startups (founder_id, name, sector, stage, cohort)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Acme Corp', 'HealthTech', 'pre_seed', 'Cohort 1');

-- INSERT INTO media (id, user_id, original_name, storage_path, type)
-- VALUES ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'pitch_deck.pdf', 'users/550e8400-e29b-41d4-a716-446655440000/pitch_deck.pdf', 'document');

-- INSERT INTO media_relationships (media_id, related_type, related_id)
-- VALUES ('660e8400-e29b-41d4-a716-446655440001', 'startup', '770e8400-e29b-41d4-a716-446655440002');
