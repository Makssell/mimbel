# Supabase Storage Setup for Flag Images

This guide will help you set up Supabase storage to handle flag image uploads in the admin panel.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter the following details:
   - **Name**: `flags`
   - **Public bucket**: ✅ Check this box (so images can be accessed publicly)
   - **File size limit**: `5 MB` (or adjust as needed)
   - **Allowed MIME types**: `image/*` (or specific types like `image/png,image/jpeg,image/webp`)

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

### Policy 1: Allow Public Read Access

```sql
-- Allow anyone to view flag images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'flags');
```

### Policy 2: Allow Authenticated Uploads

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'flags' AND auth.role() = 'authenticated');
```

### Policy 3: Allow Authenticated Deletes

```sql
-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'flags' AND auth.role() = 'authenticated');
```

## Step 3: Update Database Schema

You need to add a `fileName` column to your `flags` table to track uploaded images:

```sql
-- Add fileName column to flags table
ALTER TABLE flags ADD COLUMN fileName TEXT;
```

## Step 4: Environment Variables

Make sure your environment variables are properly set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the admin panel and try uploading a flag image
3. Check that the image appears in your Supabase storage bucket
4. Verify that the image URL is accessible publicly

## Troubleshooting

### Images not uploading

- Check that your Supabase key has the correct permissions
- Verify that the storage bucket exists and is public
- Check the browser console for any error messages

### Images not displaying

- Ensure the storage bucket is set to public
- Check that the RLS policies are correctly configured
- Verify the image URLs are being generated correctly

### Permission errors

- Make sure you're using the correct Supabase key
- Check that the storage policies allow the operations you're trying to perform
- Verify that your admin password is correct

## Security Considerations

- The current implementation uses a simple password system for admin access
- In production, consider implementing proper authentication
- The storage bucket is public, so anyone with the URL can access the images
- Consider implementing image optimization and compression
- Add file type validation on the frontend and backend

## File Management

The system automatically:

- Generates unique filenames using timestamps
- Deletes old images when flags are updated or deleted
- Tracks file names in the database for cleanup
- Handles image replacement during edits

## Supported Image Formats

The upload accepts all image types (`image/*`). For best results, use:

- PNG (recommended for flags)
- JPEG
- WebP
- SVG (for vector flags)

## File Size Limits

The default file size limit is 5MB. You can adjust this in your Supabase storage bucket settings.
