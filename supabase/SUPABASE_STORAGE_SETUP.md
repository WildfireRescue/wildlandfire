Supabase Storage setup for article images

- Create a bucket named `article-images` in Supabase Storage.
- Set the bucket to public if you want direct public URLs. For private buckets, generate signed URLs on the server when rendering.
- Recommended folder structure: `article-images/{year}/{month}/{uuid}-{originalFilename}`
- Configure CORS and URL rewrite on Netlify if serving via signed URLs or proxies.

Upload notes:
- Use the client upload helper `uploadArticleImage(file)` (added to `src/lib/articleImage.ts`) to store files and return a public URL.
- Store `src`, `alt`, and `caption` in the article block object.

Security:
- Prefer public bucket for static hero and inline images. If using private bucket, implement server-side signed URL fetches to avoid leaking keys.
