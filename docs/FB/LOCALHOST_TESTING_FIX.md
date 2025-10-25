# 🔒 Fix: Secure Connection Required for Facebook Login

## The Error

```
Facebook has detected OceanCRM Lead Importv1 isn't using a secure connection to transfer information.
Until OceanCRM Lead Importv1 updates its security settings, you won't be able to use Facebook to log into it.
```

## ✅ Yes, You Can Test on Localhost!

Facebook **does allow** `localhost` for testing without HTTPS. The issue is with your OAuth configuration.

---

## 🛠️ Quick Fix (5 Minutes)

### Step 1: Check Your Facebook App Settings

Go to your Facebook App Dashboard:
**https://developers.facebook.com/apps/{YOUR_APP_ID}/settings/basic/**

### Step 2: Verify App Domains

In **"App Domains"** field, add:

```
localhost
```

**Important**: Do NOT include `http://` or port numbers here!

### Step 3: Configure OAuth Redirect URIs

Go to: **Facebook Login → Settings**

**URL**: https://developers.facebook.com/apps/{YOUR_APP_ID}/fb-login/settings/

Add these **Valid OAuth Redirect URIs**:

```
http://localhost:5173/
http://localhost:5173
http://127.0.0.1:5173/
http://127.0.0.1:5173
```

**Important Notes**:

- ✅ Use `http://` (not `https://`) for localhost
- ✅ Include trailing slash `/` as a separate entry
- ✅ Add both `localhost` and `127.0.0.1`
- ✅ Make sure port matches your dev server (default: 5173 for Vite)

### Step 4: Save Changes

Click **"Save Changes"** button at the bottom of the page.

### Step 5: Wait & Test

1. Wait 5 minutes for changes to propagate
2. Clear browser cache or use incognito mode
3. Restart your dev server:
   ```bash
   npm run dev
   ```
4. Try Facebook login again

---

## 📋 Complete Facebook App Configuration Checklist

### Basic Settings

- [x] **App Domains**: `localhost` (no protocol, no port)
- [x] **Privacy Policy URL**: Add any valid URL (can use placeholder for testing)
- [x] **App Icon**: Upload 1024x1024 icon (optional for testing)

### Facebook Login Settings

- [x] **Valid OAuth Redirect URIs**:
  ```
  http://localhost:5173/
  http://localhost:5173
  http://127.0.0.1:5173/
  http://127.0.0.1:5173
  ```
- [x] **Allowed Domains for JavaScript SDK**:
  ```
  localhost
  127.0.0.1
  ```

### App Mode

- [x] **Development Mode**: Should be ON for testing
- [x] **Your Facebook account**: Added as Admin/Developer

---

## 🔍 Finding Your App ID

If you don't know your App ID:

1. Go to: https://developers.facebook.com/apps/
2. Click on your app name
3. App ID is shown at the top of the dashboard
4. Or check your `index.html` file - it's in the `FB.init()` code

---

## 🖼️ Visual Guide: Where to Configure

### 1. App Domains Location

```
Facebook Developers Dashboard
└─ Your App
   └─ Settings
      └─ Basic
         └─ App Domains field
            └─ Enter: localhost
```

### 2. OAuth Redirect URIs Location

```
Facebook Developers Dashboard
└─ Your App
   └─ Products
      └─ Facebook Login
         └─ Settings
            └─ Valid OAuth Redirect URIs
               └─ Add: http://localhost:5173/
```

### 3. JavaScript SDK Domains Location

```
Facebook Developers Dashboard
└─ Your App
   └─ Products
      └─ Facebook Login
         └─ Settings
            └─ Allowed Domains for the JavaScript SDK
               └─ Add: localhost
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Given URL is not permitted by the application configuration"

**Cause**: OAuth redirect URI not configured correctly

**Solution**:

1. Check spelling of `localhost` (no spaces)
2. Make sure using `http://` not `https://`
3. Include trailing slash as separate entry
4. Match exact port number (5173 is Vite default)

### Issue 2: Still getting security error after configuration

**Solutions**:

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Use incognito mode**: Test without cache
3. **Wait 5-10 minutes**: Facebook needs time to propagate changes
4. **Restart dev server**: `Ctrl+C` then `npm run dev`
5. **Check you're using correct URL**: Verify `http://localhost:5173` in browser

### Issue 3: "App not setup: This app is still in development mode"

**This is NORMAL!** It means:

- ✅ Your configuration is correct
- ✅ You can test with your account (if you're an admin)
- ⚠️ Other users can't use it until you submit for App Review

**Solution**: Make sure your Facebook account is added as Admin/Developer in the app.

### Issue 4: Different port number

If your app runs on a different port (e.g., 3000, 8080):

**Find your port**:

```bash
# Look at terminal output when running:
npm run dev

# You'll see something like:
# Local: http://localhost:5173/
```

**Update OAuth settings** with your actual port:

```
http://localhost:YOUR_PORT/
```

---

## 🔐 Why Localhost Works Without HTTPS

Facebook makes a **special exception** for localhost:

- ✅ `http://localhost` is allowed for testing
- ✅ `http://127.0.0.1` is allowed for testing
- ❌ `http://your-domain.com` requires HTTPS
- ❌ Production apps MUST use HTTPS

**This is by design** to make local development easier!

---

## 📝 Step-by-Step Configuration Script

Copy these URLs and configure them in Facebook:

### 1. Go to Basic Settings

```
https://developers.facebook.com/apps/{YOUR_APP_ID}/settings/basic/
```

**Add to "App Domains"**:

```
localhost
```

### 2. Go to Facebook Login Settings

```
https://developers.facebook.com/apps/{YOUR_APP_ID}/fb-login/settings/
```

**Add to "Valid OAuth Redirect URIs"** (click "Add URI" for each):

```
http://localhost:5173/
http://localhost:5173
http://127.0.0.1:5173/
http://127.0.0.1:5173
```

**Add to "Allowed Domains for the JavaScript SDK"**:

```
localhost
127.0.0.1
```

### 3. Save All Changes

Click **"Save Changes"** at the bottom.

---

## 🧪 Test Your Configuration

### Method 1: Quick Test

1. Open: http://localhost:5173
2. Go to Leads page
3. Click "Import from Facebook"
4. Click "Log in With Facebook"
5. Should see Facebook login popup ✅

### Method 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any Facebook SDK errors
4. Should see: `FB.init` success message

### Method 3: Use Facebook Debugger

1. Go to: https://developers.facebook.com/tools/debug/accesstoken/
2. Try to generate a test token
3. If token generates, configuration is correct

---

## 💻 Update Your Code (Optional)

Your current setup should work, but to be extra safe, verify your `index.html`:

### Check index.html

```html
<script>
  window.fbAsyncInit = function () {
    FB.init({
      appId: "YOUR_APP_ID", // Make sure this matches your Facebook App
      cookie: true,
      xfbml: true,
      version: "v24.0",
    });
  };

  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
</script>
```

**Important**: Make sure `appId` matches your Facebook App ID exactly!

---

## 🚀 Production Deployment (Later)

When deploying to production, you'll need:

### 1. HTTPS Certificate

- Use Netlify (free HTTPS)
- Use Vercel (free HTTPS)
- Use Let's Encrypt (free certificate)
- Or your hosting provider's SSL

### 2. Update Facebook App Settings

Add your production URLs:

**App Domains**:

```
yourdomain.com
```

**OAuth Redirect URIs**:

```
https://yourdomain.com/
https://yourdomain.com
```

**JavaScript SDK Domains**:

```
yourdomain.com
```

### 3. Keep Localhost Settings

You can keep both localhost AND production URLs configured at the same time!

---

## 🎯 Current Configuration Template

Here's what your Facebook App settings should look like:

```yaml
App ID: [Your App ID]

Basic Settings:
  App Domains:
    - localhost
    - yourdomain.com (for production later)

  Privacy Policy URL:
    - https://yourdomain.com/privacy (or any valid URL)

Facebook Login Settings:
  Valid OAuth Redirect URIs:
    - http://localhost:5173/
    - http://localhost:5173
    - http://127.0.0.1:5173/
    - http://127.0.0.1:5173
    - https://yourdomain.com/ (for production later)

  Allowed Domains for JavaScript SDK:
    - localhost
    - 127.0.0.1
    - yourdomain.com (for production later)

App Mode: Development (for testing)

Roles:
  Admins: [Your Facebook Account]
```

---

## ✅ Verification Checklist

After configuration, verify:

- [ ] App ID in `index.html` matches Facebook App
- [ ] `localhost` added to App Domains (no protocol, no port)
- [ ] OAuth redirect URIs include `http://localhost:5173/`
- [ ] JavaScript SDK domains include `localhost`
- [ ] Changes saved in Facebook
- [ ] Waited 5 minutes for propagation
- [ ] Dev server restarted
- [ ] Browser cache cleared or using incognito
- [ ] Your account is Admin/Developer of the app
- [ ] App is in Development mode

---

## 🆘 Still Not Working?

### Check These:

1. **Exact Port Match**:

   ```bash
   # Check what port your app actually uses:
   npm run dev
   # Look for: Local: http://localhost:XXXX/
   ```

2. **Browser Console Errors**:
   - Open DevTools (F12)
   - Look for red error messages
   - Copy error message and search it

3. **Facebook App Status**:
   - Check app isn't restricted
   - Check app is in Development mode
   - Check you're logged into correct Facebook account

4. **Try Different Browser**:
   - Chrome incognito
   - Firefox private window
   - Edge private window

5. **Check Internet Connection**:
   - Facebook SDK needs to load
   - Check no firewall blocking Facebook

---

## 📚 Additional Resources

### Facebook Documentation

- **OAuth Settings**: https://developers.facebook.com/docs/facebook-login/web
- **Localhost Testing**: https://developers.facebook.com/docs/development/create-an-app/
- **Troubleshooting**: https://developers.facebook.com/docs/facebook-login/web/troubleshooting

### Your Project Documentation

- **Quick Start**: QUICK_START.md
- **Facebook Setup**: FACEBOOK_APP_SETUP_GUIDE.md
- **Testing Guide**: TESTING_GUIDE.md

---

## 🎉 Success!

Once configured correctly, you should see:

1. ✅ Facebook login popup appears
2. ✅ Can grant permissions
3. ✅ Returns to your app with token
4. ✅ Console shows success logs
5. ✅ No security errors

**You're ready to test locally!** 🚀

---

## 💡 Pro Tips

1. **Keep localhost settings**: Even after going to production
2. **Use incognito mode**: Faster testing without cache issues
3. **Check console logs**: Your updated component logs everything
4. **Test multiple browsers**: Catch browser-specific issues early

---

_Last Updated: October 25, 2025_  
_Part of OceanCRM Facebook Integration Documentation_
