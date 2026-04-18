-- =============================================
-- OnCall Clinic - Post-Consultation Chat Messages
-- 48h chat window after consultation completion
-- =============================================

CREATE TABLE consultation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_role TEXT CHECK (sender_role IN ('patient', 'doctor')),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_consultation ON consultation_messages(consultation_id, created_at);
CREATE INDEX idx_messages_unread ON consultation_messages(consultation_id) WHERE read_at IS NULL;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read messages" ON consultation_messages FOR SELECT
  USING (sender_id = auth.uid() OR consultation_id IN (
    SELECT id FROM consultations WHERE patient_id = auth.uid() OR doctor_id IN (
      SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Participants send messages" ON consultation_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND consultation_id IN (
    SELECT id FROM consultations
    WHERE (patient_id = auth.uid() OR doctor_id IN (
      SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
    ))
    AND status = 'completed'
    AND completed_at > NOW() - INTERVAL '48 hours'
  ));

CREATE POLICY "Participants mark read" ON consultation_messages FOR UPDATE
  USING (consultation_id IN (
    SELECT id FROM consultations WHERE patient_id = auth.uid() OR doctor_id IN (
      SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
    )
  ));

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE consultation_messages;
