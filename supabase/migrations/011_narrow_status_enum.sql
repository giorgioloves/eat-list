-- Narrow restaurant status to the two values the app actually uses.
-- The initial schema allowed: want_to_try, booked, visited, favourite, never_again
-- The app only recognises: want_to_try, visited

UPDATE restaurants SET status = 'want_to_try' WHERE status = 'booked';
UPDATE restaurants SET status = 'visited'     WHERE status IN ('favourite', 'never_again');

ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_status_check;
ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_status_check
  CHECK (status IN ('want_to_try', 'visited'));
