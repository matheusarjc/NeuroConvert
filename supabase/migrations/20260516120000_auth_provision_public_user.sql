-- Ao criar conta em auth.users, garante linha em public.users com o mesmo id (créditos / laudos).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  v_email := coalesce(new.email, new.phone, new.id::text || '@auth.local');
  insert into public.users (id, email, plan, credits_remaining)
  values (new.id, v_email, 'free', 1)
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
