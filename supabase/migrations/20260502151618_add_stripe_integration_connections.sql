create table public.startup_integration_connections (
    id uuid primary key default uuid_generate_v4(),
    startup_id uuid not null references public.startups(id) on delete cascade,
    provider text not null,
    status text not null default 'connected',
    access_token text,
    refresh_token text,
    external_account_id text,
    livemode boolean not null default false,
    scopes text[] not null default '{}',
    token_expires_at timestamptz,
    last_synced_at timestamptz,
    last_sync_error text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_startup_integration_connections_provider
        check (provider in ('stripe', 'google_workspace', 'google_drive', 'google_calendar', 'linkedin')),
    constraint chk_startup_integration_connections_status
        check (status in ('pending', 'connected', 'error', 'revoked'))
);

create unique index uk_startup_integration_connections_provider
    on public.startup_integration_connections(startup_id, provider);

create index idx_startup_integration_connections_startup_id
    on public.startup_integration_connections(startup_id);

create trigger update_startup_integration_connections_updated_at
    before update on public.startup_integration_connections
    for each row execute function public.update_updated_at_column();

alter table public.startup_integration_connections enable row level security;

comment on table public.startup_integration_connections is
    'Server-only integration credentials and sync state. Access through audited server routes/actions.';
comment on column public.startup_integration_connections.access_token is
    'Provider OAuth access token. Never expose to browser clients.';
comment on column public.startup_integration_connections.refresh_token is
    'Provider OAuth refresh token. Never expose to browser clients.';
