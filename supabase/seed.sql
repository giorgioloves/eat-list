-- Seed data for development / demo purposes
-- Run this AFTER creating a user and a shared list via the app.
-- Replace the UUIDs below with real values from your database.

-- Example: Insert sample restaurants into an existing list
-- Replace 'YOUR_LIST_ID' and 'YOUR_USER_ID' with actual values.

/*
INSERT INTO restaurants (list_id, name, cuisine, address, suburb, city, status, visit_count, tier, rating, would_go_again, tags, latitude, longitude, created_by) VALUES

('YOUR_LIST_ID', 'Ester', 'Modern Australian', '46 Meagher St', 'Chippendale', 'Sydney', 'favourite', 4, 'S', 9.5, 'definitely', ARRAY['Date Night', 'Fine Dining'], -33.8907, 151.1970, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Momofuku Seiōbo', 'Japanese', 'Star City, 80 Pyrmont St', 'Pyrmont', 'Sydney', 'visited', 2, 'S', 9.2, 'definitely', ARRAY['Fine Dining', 'Date Night'], -33.8695, 151.1942, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Chin Chin', 'Thai', '69 Flinders Ln', 'Melbourne CBD', 'Melbourne', 'visited', 6, 'A', 8.5, 'definitely', ARRAY['Cocktails', 'Date Night'], -37.8140, 144.9680, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Lune Croissanterie', 'Bakery', '119 Rose St', 'Fitzroy', 'Melbourne', 'favourite', 10, 'S', 9.8, 'definitely', ARRAY['Brunch', 'Cheap Eats'], -37.8006, 144.9779, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Rockpool Bar & Grill', 'Steakhouse', '66 Hunter St', 'Sydney CBD', 'Sydney', 'booked', 0, NULL, NULL, NULL, ARRAY['Fine Dining', 'Business Lunch'], -33.8671, 151.2104, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'The Apollo', 'Greek', '44 Macleay St', 'Potts Point', 'Sydney', 'want_to_try', 0, NULL, NULL, NULL, ARRAY['Date Night'], -33.8693, 151.2225, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Ramen Danbo', 'Ramen', '116 Goulburn St', 'Sydney CBD', 'Sydney', 'visited', 8, 'A', 8.0, 'definitely', ARRAY['Cheap Eats', 'Quick Bite'], -33.8790, 151.2075, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Tottis', 'Italian', '283 Crown St', 'Surry Hills', 'Sydney', 'visited', 3, 'B', 7.5, 'maybe', ARRAY['Date Night', 'Cocktails'], -33.8850, 151.2100, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'LP''s Quality Meats', 'BBQ', '16 Temperance Ln', 'Sydney CBD', 'Sydney', 'want_to_try', 0, NULL, NULL, NULL, ARRAY['Cheap Eats'], -33.8674, 151.2096, 'YOUR_USER_ID'),

('YOUR_LIST_ID', 'Attica', 'Modern Australian', '74 Glen Eira Rd', 'Ripponlea', 'Melbourne', 'want_to_try', 0, NULL, NULL, NULL, ARRAY['Fine Dining', 'Date Night'], -37.8747, 144.9989, 'YOUR_USER_ID');

-- Seed visits for visited restaurants
INSERT INTO restaurant_visits (restaurant_id, visited_by, visited_at, rating)
SELECT id, 'YOUR_USER_ID', NOW() - INTERVAL '30 days', rating
FROM restaurants
WHERE status IN ('visited', 'favourite') AND rating IS NOT NULL;
*/

-- Note: The above is commented out. Uncomment and replace placeholder IDs to use.
-- The app will work without seed data — just sign up and add restaurants!
