# Debug Blog Issue

If you're still seeing React error #310, open browser DevTools console and look for these logs:

## What to check:

1. **Navigate to http://localhost:5173/#/blog**
   - Look for: `[BlogIndex] Posts loaded successfully`
   - Check the logged post objects - do they have `cover_image_url`?

2. **Click "Read More" on a post**
   - Look for: `[BlogPostPage] Post loaded successfully`
   - **CRITICAL**: Check the `contentType` in the log
   - If it says `"object"` instead of `"string"`, that's your issue!

3. **If content_markdown is an object:**
   ```
   The issue is in your Supabase database - the content_markdown field 
   is storing JSON/objects instead of plain markdown strings.
   ```

## Quick Fix if content is object:

Check your Supabase table column type:
- Go to Supabase Dashboard → Table Editor → posts table
- Check `content_markdown` column type
- Should be: `text` or `varchar`
- If it's `json` or `jsonb`, that's the problem!

## Verify the fix is working:

Open console and you should see:
```
[BlogPostPage] Post loaded successfully: {
  title: "Your Post Title",
  slug: "your-slug",
  hasContent: true,
  contentType: "string"  ← SHOULD BE "string"!
}
```

If contentType is "object", you'll also see:
```
[safeMarkdownContent] Content appears to be JSON/object, not markdown: {...}
```

The fix handles this gracefully by stringifying it, but you should fix the data source.
