# Quick Start Guide: Enhanced Blog Editor

## Getting Started

1. **Navigate to Editor**: Go to `/#publish` or click "Publish" in admin menu
2. **Login**: Enter your authorized email to receive magic link
3. **Access Editor**: Click the link in your email to authenticate

## Publishing Your First Post

### Step 1: Core Content (Required)
```
✓ Title: "Wildfire Recovery: How We Help Communities Rebuild"
✓ URL Slug: Auto-generated (editable)
✓ Excerpt: Brief 1-2 sentence summary
✓ Content: Write in Markdown format
✓ Featured Image: Full URL to image
✓ Alt Text: "Firefighters helping rebuild community after wildfire"
```

### Step 2: SEO Optimization (Highly Recommended)
```
✓ Meta Title (≤60 chars): "Wildfire Recovery Support | WFRF"
✓ Meta Description (≤160 chars): "Learn how the Wildland Fire Recovery Fund helps communities rebuild after devastating wildfires through direct aid..."
✓ Focus Keyword: "wildfire recovery"
✓ Secondary Keywords: "disaster relief, fire aid, community support"
```

### Step 3: Author & Trust (E-E-A-T)
```
✓ Author Name: "The Wildland Fire Recovery Fund"
✓ Author Role: "Nonprofit Disaster Relief Organization"
✓ Author Bio: "Established in 2023, we provide direct aid to wildfire survivors..."
✓ Reviewed By: "Jane Smith, Disaster Relief Specialist" (optional)
☑ Fact-Checked: Check if content has been verified
```

### Step 4: Publishing Settings
```
✓ Category: Select from dropdown
✓ Tags: wildfire, recovery, story (comma-separated)
✓ Status: Draft / Scheduled / Published
☑ Featured Post: Check to feature on homepage
☑ Allow Indexing: Almost always checked (for SEO)
☑ Allow Follow: Almost always checked (for SEO)
```

### Step 5: Sources & Citations (Optional but Recommended)
```
Add Source:
  Label: "FEMA Wildfire Statistics 2024"
  URL: https://www.fema.gov/...

☑ Outbound Links Verified: Check when all links tested
```

## SEO Best Practices

### Title Optimization
- **Length**: 50-60 characters ideal
- **Format**: "Primary Keyword | Brand Name"
- **Example**: "Wildfire Recovery Guide | WFRF"

### Description Optimization
- **Length**: 150-160 characters ideal
- **Format**: Brief, compelling summary with keywords
- **Call-to-Action**: End with action word
- **Example**: "Discover how we help wildfire survivors rebuild their lives through direct aid, housing support, and community resources. Learn more today."

### Image Requirements
- **Required**: Alt text (accessibility & SEO)
- **Format**: Descriptive, not keyword-stuffed
- **Good**: "Firefighter helping family after wildfire"
- **Bad**: "wildfire recovery aid help support"

### Keyword Strategy
- **Focus**: One primary keyword per post
- **Secondary**: 2-5 related keywords
- **Natural**: Use naturally in content
- **Avoid**: Keyword stuffing

## Common Workflows

### Publishing Immediately
1. Set Status: "Published"
2. All required fields filled
3. Click "Save Post"
4. Post goes live instantly

### Scheduling for Later
1. Set Status: "Scheduled"
2. Set "Scheduled For" date/time
3. Click "Save Post"
4. Post auto-publishes at scheduled time

### Saving as Draft
1. Set Status: "Draft"
2. Click "Save Post"
3. Not visible to public
4. Can edit later

## Field Validations

### Required Fields
- Title
- Content (markdown)
- Featured Image Alt Text (if image provided)

### Character Limits (Soft)
- Meta Title: 60 (shows counter, warns if over)
- Meta Description: 160 (shows counter, warns if over)

### Character Limits (Hard)
- Meta Title: 70 max
- Meta Description: 180 max

## Fallback System

Don't worry if you skip optional SEO fields! The system auto-generates:

- **Missing Meta Title?** → Uses post title
- **Missing Meta Description?** → Uses excerpt or content preview
- **Missing OG Title?** → Uses meta title → post title
- **Missing OG Image?** → Uses featured image
- **Missing Robots?** → Generates from checkboxes

## Tips for E-E-A-T

### Show Expertise
- Fill in Author Role with credentials
- Add Author Bio highlighting experience
- Be specific: "10+ years in disaster relief"

### Build Authority
- Add credible sources
- Link to authoritative sites (.gov, .edu)
- Include reviewed_by for important posts

### Demonstrate Trust
- Check "Fact-Checked" for verified content
- Add citation sources
- Keep content updated (shows last_updated_at)

## Markdown Cheat Sheet

```markdown
# H1 Heading (avoid - title already H1)
## H2 Section Heading
### H3 Sub-heading

**Bold text**
*Italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item

[Link text](https://example.com)

![Image alt text](https://example.com/image.jpg)

> Blockquote for emphasis

`inline code`

---
Horizontal rule
```

## Troubleshooting

### "Saving..." Never Finishes
- Check browser console (F12) for errors
- Verify all required fields filled
- Check featured image has alt text
- Try refreshing and re-entering data

### Can't See "Save" Button
- Scroll down - it's at the bottom
- Try expanding all sections

### Post Not Showing on Blog
- Check Status is "Published"
- Check "Allow Indexing" is checked
- Verify published_at date is not in future
- Clear browser cache

### Meta Tags Not Appearing
- Wait 1-2 minutes for update
- Hard refresh browser (Ctrl+Shift+R)
- Check with Facebook Debugger or Twitter Validator

## Testing Your Post

### Before Publishing
1. Preview markdown in external tool
2. Verify all links work
3. Check image loads
4. Run spell check
5. Read aloud for flow

### After Publishing
1. View on site: `/#blog/your-slug`
2. Test social sharing
3. Check mobile display
4. Verify meta tags (View Source)
5. Test with Google Rich Results

## Advanced Features

### Scheduling Posts
- Perfect for campaigns
- Set exact publish time
- Auto-publishes without manual action

### Featured Posts
- Appears prominently on blog index
- Use sparingly (1-3 at a time)
- Best for important announcements

### Custom Robots Directives
- Default: "index,follow" (recommended)
- "noindex,follow" - Don't index, but follow links
- "index,nofollow" - Index, but don't follow links
- Rarely need to change from default

### Sitemap Priority
- 0.0 (lowest) to 1.0 (highest)
- Default: 0.7 (good for most posts)
- 1.0: Homepage/critical pages only
- 0.5-0.7: Regular blog posts
- 0.3-0.4: Archive/old content

## Getting Help

### Check Console Logs
Open browser DevTools (F12) → Console tab
Look for red errors after clicking "Save Post"

### Verify Field Values
Console shows attempted save data
Check for missing required fields

### Contact Support
Include:
- Error message from console
- Screenshot of form
- Steps to reproduce issue

## Best Practices Summary

✅ **DO:**
- Fill in all core content fields
- Add descriptive alt text to images
- Use natural, readable titles and descriptions
- Include credible sources for claims
- Keep content fresh and updated
- Use proper Markdown formatting
- Test posts before sharing publicly

❌ **DON'T:**
- Keyword stuff titles/descriptions
- Skip image alt text
- Use all caps in titles
- Ignore character count warnings
- Forget to set publication status
- Leave broken links
- Publish without proofreading

## Keyboard Shortcuts

- `Tab` - Navigate between fields
- `Shift+Tab` - Navigate backward
- `Enter` - Submit when in text input (NOT in textarea)
- `Ctrl/Cmd + S` - Browser save (not form save)

---

**Pro Tip**: Save drafts frequently! The browser won't auto-save your work.
