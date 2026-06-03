create table visit_ratings (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references restaurant_visits(id) on delete cascade,
  person_name text not null,
  rating numeric(3,1) not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default now()
);

alter table visit_ratings enable row level security;

create policy "List members can manage visit ratings" on visit_ratings
  for all using (
    exists (
      select 1 from restaurant_visits rv
      join restaurants r on r.id = rv.restaurant_id
      join shared_list_members slm on slm.list_id = r.list_id
      where rv.id = visit_ratings.visit_id
        and slm.user_id = auth.uid()
    )
  );

-- Migrate existing visit ratings into the per-person table
insert into visit_ratings (visit_id, person_name, rating)
select
  rv.id,
  coalesce(p.name, 'Me'),
  rv.rating
from restaurant_visits rv
left join profiles p on p.id = rv.visited_by
where rv.rating is not null;
