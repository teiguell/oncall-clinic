CREATE TABLE consultation_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) UNIQUE,
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES doctor_profiles(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_doctor ON consultation_reviews(doctor_id);
ALTER TABLE consultation_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients create reviews" ON consultation_reviews FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Public reviews visible" ON consultation_reviews FOR SELECT USING (is_public = true OR patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE OR REPLACE FUNCTION update_doctor_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE doctor_profiles SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM consultation_reviews WHERE doctor_id = NEW.doctor_id),
    total_reviews = (SELECT COUNT(*) FROM consultation_reviews WHERE doctor_id = NEW.doctor_id)
  WHERE id = NEW.doctor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating AFTER INSERT ON consultation_reviews
FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();
