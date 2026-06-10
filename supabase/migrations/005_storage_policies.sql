-- migration: 005_storage_policies.sql
-- Drop existing storage policies if any and recreate them for logos and themes buckets

DROP POLICY IF EXISTS "Allow public select on storage objects" ON storage.objects;
CREATE POLICY "Allow public select on storage objects" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id IN ('logos', 'themes'));

DROP POLICY IF EXISTS "Allow authenticated insert on storage objects" ON storage.objects;
CREATE POLICY "Allow authenticated insert on storage objects" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('logos', 'themes'));

DROP POLICY IF EXISTS "Allow authenticated update on storage objects" ON storage.objects;
CREATE POLICY "Allow authenticated update on storage objects" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('logos', 'themes'));

DROP POLICY IF EXISTS "Allow authenticated delete on storage objects" ON storage.objects;
CREATE POLICY "Allow authenticated delete on storage objects" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id IN ('logos', 'themes'));
