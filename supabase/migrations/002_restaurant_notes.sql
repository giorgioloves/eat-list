CREATE TABLE restaurant_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_restaurant_notes_restaurant_id ON restaurant_notes(restaurant_id);

ALTER TABLE restaurant_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "List members can view notes"
  ON restaurant_notes FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE list_id IN (
        SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "List members can add notes"
  ON restaurant_notes FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE list_id IN (
        SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Note author can delete their own notes"
  ON restaurant_notes FOR DELETE
  USING (added_by = auth.uid());
