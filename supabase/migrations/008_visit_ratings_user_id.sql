-- Remove ratings where parent visit has no known user (can't backfill)
delete from visit_ratings
using restaurant_visits rv
where visit_ratings.visit_id = rv.id
  and rv.visited_by is null;

-- Add user_id (nullable first so we can backfill)
alter table visit_ratings add column user_id uuid references profiles(id) on delete cascade;

-- Backfill from the parent visit's owner
update visit_ratings vr
set user_id = rv.visited_by
from restaurant_visits rv
where vr.visit_id = rv.id;

-- Now enforce not null
alter table visit_ratings alter column user_id set not null;

-- Drop free-text name column
alter table visit_ratings drop column person_name;

-- One rating per user per visit
alter table visit_ratings add constraint visit_ratings_visit_user_unique unique (visit_id, user_id);
