-- Separate, authenticated SubVault namespace. No existing tables are modified.
create table public.subvault_vaults (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{"services":[],"accounts":[],"recentPlatforms":[]}'::jsonb,
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint vault_shape check (jsonb_typeof(payload->'services') = 'array' and jsonb_typeof(payload->'accounts') = 'array' and jsonb_typeof(payload->'recentPlatforms') = 'array')
);
alter table public.subvault_vaults enable row level security;
revoke all on public.subvault_vaults from anon, authenticated;
grant select on public.subvault_vaults to authenticated;
create policy "Read only your own vault" on public.subvault_vaults for select to authenticated using ((select auth.uid()) = user_id);
-- All writes use an atomic revision check. Stale tabs cannot overwrite newer data.
create or replace function public.subvault_save(vault_payload jsonb, expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare next_revision bigint; current_user_id uuid := auth.uid();
begin
 if current_user_id is null then raise exception 'Authentication required'; end if;
 if expected_revision = 0 then
   insert into public.subvault_vaults(user_id,payload,revision) values(current_user_id,vault_payload,1)
   on conflict(user_id) do nothing returning revision into next_revision;
 else
   update public.subvault_vaults set payload=vault_payload, revision=revision+1, updated_at=now()
   where user_id=current_user_id and revision=expected_revision returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'Revision conflict: reload vault'; end if;
 return next_revision;
end;
$$;
revoke all on function public.subvault_save(jsonb,bigint) from public, anon;
grant execute on function public.subvault_save(jsonb,bigint) to authenticated;
