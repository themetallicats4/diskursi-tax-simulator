# Admin Panel Security Setup

## What Was Changed

### 1. Created Netlify Functions

Two new serverless functions were created:

- `netlify/functions/admin-login.js` - Handles admin authentication
- `netlify/functions/save-config.js` - Securely saves configuration to Supabase

### 2. Updated Admin.jsx

- Removed insecure `prompt()` authentication
- Added proper login form with password input
- Token stored in `sessionStorage` for session persistence
- Added "Çıkış Yap" (Logout) button
- All saves now go through secure backend function
- No direct Supabase writes from frontend

### 3. Security Features

- Password verification happens server-side
- Token-based authentication with expiration (24 hours)
- Authorization header required for all config updates
- Service role key only used in backend functions (never exposed to frontend)

## Required Netlify Environment Variables

You need to add these environment variables in your Netlify dashboard:

### Go to: Site Settings → Environment Variables → Add Variable

1. **VER_KENN**
   - Value: Your secure admin password
   - ⚠️ IMPORTANT: This must be set in Netlify environment variables
   - This is your admin login password

2. **SUPABASE_URL**
   - Value: `https://dixwmxaismhucrynflkk.supabase.co`
   - (Already in your .env file)

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (NOT the anon key!)
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ IMPORTANT: This is different from VITE_SUPABASE_ANON_KEY
   - ⚠️ Keep this secret! Never commit to git!

4. **VITE_SUPABASE_URL** (for frontend)
   - Value: `https://dixwmxaismhucrynflkk.supabase.co`

5. **VITE_SUPABASE_ANON_KEY** (for frontend)
   - Value: Your anon key (already in .env)

## How to Deploy

1. Commit and push all changes to your repository
2. Add the environment variables in Netlify (see above)
3. Redeploy your site
4. Visit `/admin` route
5. Login with your ADMIN_PASSWORD

## How It Works

### Login Flow:
1. User visits `/admin`
2. Sees login form (password input)
3. Enters password and clicks "Giriş Yap"
4. Frontend calls `/.netlify/functions/admin-login`
5. Backend verifies password against `ADMIN_PASSWORD` env var
6. If valid, returns token
7. Token stored in sessionStorage
8. Admin panel loads

### Save Flow:
1. User modifies config values
2. Clicks "💾 Kaydet"
3. Frontend calls `/.netlify/functions/save-config` with token
4. Backend validates token
5. Backend uses service role key to update Supabase
6. Returns success/error

### Logout:
- Click "Çıkış Yap" button
- Token removed from sessionStorage
- Redirected to login form

## Security Notes

- ✅ Password verification is server-side only
- ✅ Service role key never exposed to frontend
- ✅ Token expires after 24 hours
- ✅ All database writes go through authenticated backend
- ✅ No direct Supabase access from frontend admin panel

## Testing Locally

To test locally with Netlify Dev:

```bash
npm install -g netlify-cli
netlify dev
```

Make sure to create a `.env` file with:
```
VER_KENN=your_password_here
SUPABASE_URL=https://dixwmxaismhucrynflkk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_SUPABASE_URL=https://dixwmxaismhucrynflkk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### "Unauthorized" error when saving
- Check that VER_KENN is set in Netlify
- Check that token hasn't expired (24 hours)
- Try logging out and logging back in

### "Server configuration error"
- Check that SUPABASE_URL is set in Netlify
- Check that SUPABASE_SERVICE_ROLE_KEY is set in Netlify
- Check that VER_KENN is set in Netlify
- Make sure you're using the SERVICE ROLE key, not the anon key

### Login not working
- Check that VER_KENN is set in Netlify environment variables
- Check that the password you're entering matches VER_KENN value
- Check browser console for network errors
- Verify Netlify functions are deployed
