# Page Testing Checklist

Server is running at: http://localhost:5173

## Core Pages to Test:

### 1. Home Page
- [ ] URL: http://localhost:5173/#home
- [ ] Check: Hero loads, navigation works, no console errors

### 2. About Page
- [ ] URL: http://localhost:5173/#about
- [ ] Check: About content displays, images load properly

### 3. Donate Page
- [ ] URL: http://localhost:5173/#donate
- [ ] Check: Donation form works, Stripe integration ready

### 4. Stories Page
- [ ] URL: http://localhost:5173/#stories
- [ ] Check: Stories/testimonials display correctly

### 5. Grants Page
- [ ] URL: http://localhost:5173/#grants
- [ ] Check: Grant forms render, submission ready

### 6. Contact Page
- [ ] URL: http://localhost:5173/#contact
- [ ] Check: Contact form displays, validation works

### 7. Articles Page
- [ ] URL: http://localhost:5173/#articles
- [ ] Check: Articles list loads from Supabase

### 8. Individual Article
- [ ] URL: http://localhost:5173/#articles/[any-slug]
- [ ] Check: Article content displays properly

### 9. Publish Page (Admin)
- [ ] URL: http://localhost:5173/#publish
- [ ] Check: Auth required, editor loads

### 10. Thank You Page
- [ ] URL: http://localhost:5173/#thankyou
- [ ] Check: Thank you message displays

### 11. Privacy Policy
- [ ] URL: http://localhost:5173/#privacy
- [ ] Check: Privacy policy content renders

### 12. Terms of Use
- [ ] URL: http://localhost:5173/#terms
- [ ] Check: Terms content renders

### 13. Auth Callback
- [ ] URL: http://localhost:5173/#auth-callback
- [ ] Check: Handles Supabase auth redirects

## Testing Notes:
- Check browser console for any errors
- Verify navigation between pages works
- Test mobile responsiveness if needed
- Check all images load
- Verify forms are functional
