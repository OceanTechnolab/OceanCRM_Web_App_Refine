# Facebook App Setup Guide for CRM Lead Import

## 📋 Overview

This guide will walk you through creating a Facebook App from scratch to import leads from Facebook Lead Ads into your CRM system.

## 🎯 Required Permissions

Based on your requirements, you'll need these permissions:

- ✅ **email** - Receive your email address
- ✅ **business_management** - Manage your business
- ✅ **leads_retrieval** - Access leads for your Pages
- ✅ **pages_show_list** - Show a list of the Pages you manage
- ✅ **pages_read_engagement** - Read content posted on the Page
- ✅ **pages_manage_ads** - Create and manage ads for your Page
- ✅ **pages_manage_metadata** - Manage accounts, settings, and webhooks for a Page

---

## 📝 Step 1: Create a Facebook App

### 1.1 Go to Meta for Developers

1. Visit: https://developers.facebook.com/
2. Click **"My Apps"** in the top right corner
3. Click **"Create App"**

### 1.2 Choose App Type

Select **"Business"** as your app type (this is best for CRM integrations)

### 1.3 Basic App Information

Fill in the following:

- **App Name**: `OceanCRM Lead Import` (or your preferred name)
- **App Contact Email**: Your business email
- **Business Account**: Select your business account (or create one)
- Click **"Create App"**

### 1.4 Note Your App ID

After creation, you'll see your **App ID** on the dashboard. Save this - you'll need it!

---

## 🔧 Step 2: Configure Facebook Login

### 2.1 Add Facebook Login Product

1. In your app dashboard, scroll to **"Add Products"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** as your platform

### 2.2 Configure OAuth Settings

1. Go to **Settings > Basic**
2. Add your **App Domains**:

   ```
   localhost
   your-domain.com
   ```

3. Go to **Facebook Login > Settings**
4. Add **Valid OAuth Redirect URIs**:

   ```
   http://localhost:5173/
   https://your-domain.com/
   https://your-domain.netlify.app/
   ```

5. Add **Allowed Domains for the JavaScript SDK**:
   ```
   localhost
   your-domain.com
   your-domain.netlify.app
   ```

---

## 🔐 Step 3: Request Advanced Permissions

### 3.1 Understand Permission Levels

- **Basic permissions** (email): Automatically approved
- **Advanced permissions** (pages, leads): Require approval through App Review
- **Standard permissions**: Need business verification

### 3.2 Add Required Permissions

1. Go to **App Review > Permissions and Features**
2. Request these permissions:

#### Email (Already Available)

- No review needed ✅

#### Business Management

- Click **"Request Advanced Access"**
- Permission: `business_management`
- Use case: "Manage business accounts for CRM integration"

#### Leads Retrieval

- Click **"Request Advanced Access"**
- Permission: `leads_retrieval`
- Use case: "Import lead form submissions from Facebook Lead Ads into CRM"

#### Pages Show List

- Click **"Request Advanced Access"**
- Permission: `pages_show_list`
- Use case: "Allow users to select which Facebook Page to connect"

#### Pages Read Engagement

- Click **"Request Advanced Access"**
- Permission: `pages_read_engagement`
- Use case: "Read lead ad forms and engagement data"

#### Pages Manage Ads

- Click **"Request Advanced Access"**
- Permission: `pages_manage_ads`
- Use case: "Access lead generation forms from ad campaigns"

#### Pages Manage Metadata

- Click **"Request Advanced Access"**
- Permission: `pages_manage_metadata`
- Use case: "Configure webhooks for real-time lead notifications"

### 3.3 Prepare for App Review

You'll need to provide:

1. **Video demonstration** showing how your app uses each permission
2. **Detailed use case description**
3. **Privacy Policy URL**
4. **Terms of Service URL**
5. **App Icon** (1024x1024px)

---

## 🧪 Step 4: Testing Before App Review

### 4.1 Use Development Mode

While in development mode, you can test with:

- App admins
- App developers
- App testers

### 4.2 Add Test Users

1. Go to **Roles > Test Users**
2. Click **"Add Test Users"**
3. Create test users with access to test Pages

### 4.3 Add Yourself as Developer/Admin

1. Go to **Roles > Roles**
2. Add your Facebook account as **Administrator** or **Developer**

---

## 💻 Step 5: Update Your Code

### 5.1 Update App ID in index.html

Current App ID in your `index.html`: `1148870030057645`

Replace it with your new App ID:

```html
<script>
  window.fbAsyncInit = function () {
    FB.init({
      appId: "YOUR_NEW_APP_ID", // Replace this
      cookie: true,
      xfbml: true,
      version: "v24.0",
    });
  };
</script>
```

### 5.2 Update Permissions Scope

Update the scope in your component to include all permissions:

```typescript
scope: "email,business_management,leads_retrieval,pages_show_list,pages_read_engagement,pages_manage_ads,pages_manage_metadata";
```

---

## 🔍 Step 6: Testing Strategy

### Phase 1: Basic Authentication (Current Status ✅)

- Test Facebook Login with **email** permission
- Verify SDK loads correctly
- Confirm user data retrieval works

### Phase 2: Pages Access (After Approval)

- Test fetching user's Pages list
- Verify Page access tokens

### Phase 3: Lead Forms (After Approval)

- Test fetching lead forms for a Page
- Verify lead form IDs

### Phase 4: Lead Data (After Approval)

- Test fetching actual lead submissions
- Verify data mapping to CRM

### Phase 5: Webhooks (Optional)

- Set up real-time lead notifications
- Test webhook delivery

---

## 🚀 Step 7: App Review Submission

### 7.1 Business Verification

1. Go to **Settings > Business Verification**
2. Submit required documents:
   - Business registration documents
   - Tax ID or EIN
   - Business address proof

### 7.2 Create App Review Request

1. Go to **App Review > Permissions and Features**
2. For each permission, click **"Request"**
3. Fill out the questionnaire:
   - How will you use this permission?
   - What user value does it provide?
   - Screenshots/video of the feature

### 7.3 Required Assets

Create and provide:

1. **Demo Video** (1-5 minutes):
   - Show user clicking "Import from Facebook"
   - Show Facebook login
   - Show Page selection
   - Show lead form selection
   - Show leads imported into CRM

2. **Privacy Policy**: Must include:
   - What data you collect
   - How you use it
   - How users can delete their data
   - Contact information

3. **Terms of Service**: Standard terms

### 7.4 Review Timeline

- Typical review time: 3-7 business days
- May request additional information
- Can take up to 14 days for complex apps

---

## 🧰 Step 8: Development Tips

### Use Test Pages

1. Create a test Facebook Page
2. Create test Lead Ads
3. Submit test lead forms yourself

### Error Handling

Common errors during testing:

- **Error 200**: Permission denied - User hasn't granted permission
- **Error 190**: Access token expired - Refresh the token
- **Error 100**: Invalid parameter - Check API version compatibility
- **Error 10**: Permission not granted - User or app lacks permission

### Token Management

- **User Access Token**: Short-lived (1-2 hours)
- **Page Access Token**: Can be long-lived (60 days+)
- **Never commit tokens** to your repository

---

## 📊 Step 9: Monitoring & Maintenance

### Set Up Webhooks (Optional)

For real-time lead notifications:

1. Go to **Products > Webhooks**
2. Subscribe to `leadgen` events
3. Configure callback URL
4. Implement webhook handler in your backend

### Monitor API Usage

1. Check **Analytics** dashboard
2. Monitor rate limits
3. Track errors in **Error Reports**

---

## 🔒 Security Best Practices

### 1. Never Expose App Secret

- Keep it in environment variables
- Never commit to Git
- Use server-side authentication when possible

### 2. Validate Tokens

- Always verify tokens server-side
- Check token expiration
- Validate permissions match expected scope

### 3. Handle User Data Responsibly

- Store only necessary data
- Encrypt sensitive information
- Implement data deletion on user request
- Comply with GDPR/privacy regulations

---

## 📱 Testing Checklist

### Before App Review

- [ ] App ID configured correctly
- [ ] OAuth redirect URIs set up
- [ ] Test with admin account
- [ ] Basic email login works
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] App icon uploaded (1024x1024)
- [ ] Demo video recorded

### During Testing (Dev Mode)

- [ ] Login flow works
- [ ] Pages list displays (admin/tester only)
- [ ] Lead forms fetch correctly
- [ ] Lead data retrieves successfully
- [ ] Error handling works
- [ ] Loading states display
- [ ] User can disconnect/logout

### After Approval

- [ ] Test with non-admin users
- [ ] Verify all permissions granted
- [ ] Test full lead import flow
- [ ] Monitor error rates
- [ ] Set up webhooks (optional)

---

## 🆘 Troubleshooting

### Issue: "Facebook SDK not loaded"

**Solution**: Check if index.html includes the SDK script and FB.init is called

### Issue: "Permission denied" errors

**Solution**:

- Verify permissions are requested in scope
- Check if permissions are approved in App Review
- Ensure user is admin/developer/tester in dev mode

### Issue: No pages returned

**Solution**:

- User must be admin of at least one Page
- `pages_show_list` permission required
- Check token validity

### Issue: No lead forms found

**Solution**:

- Page must have lead generation forms
- `leads_retrieval` permission required
- Forms must be published (not draft)

---

## 📚 Resources

### Official Documentation

- Meta for Developers: https://developers.facebook.com/
- Facebook Login: https://developers.facebook.com/docs/facebook-login
- Lead Ads API: https://developers.facebook.com/docs/marketing-api/guides/lead-ads
- Graph API Reference: https://developers.facebook.com/docs/graph-api

### Testing Tools

- Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Access Token Debugger: https://developers.facebook.com/tools/debug/accesstoken/

### Your Current Setup

- App ID: `1148870030057645`
- Graph API Version: `v24.0`
- SDK Language: JavaScript
- Integration Type: Client-side OAuth

---

## 🎯 Next Steps

1. **Immediate** (Before App Review):
   - ✅ Update App ID if you created a new app
   - ✅ Test basic email authentication (already working!)
   - Create privacy policy
   - Create terms of service
   - Record demo video

2. **Short Term** (Submit for Review):
   - Complete business verification
   - Submit permission requests with documentation
   - Wait for approval (3-7 days)

3. **After Approval**:
   - Update permissions scope in code
   - Test with real users
   - Implement full lead import flow
   - Set up webhooks for real-time sync
   - Monitor and optimize

---

## 💡 Pro Tips

1. **Start with Standard Access**: Begin testing with your own account before requesting advanced permissions

2. **Document Everything**: Keep screenshots and notes of your implementation for the App Review

3. **Use Webhooks**: For production, implement webhooks instead of polling for new leads

4. **Cache Page Tokens**: Store long-lived Page access tokens to avoid re-authentication

5. **Handle Revocations**: Users can revoke permissions - handle gracefully

6. **Test Edge Cases**:
   - User with no Pages
   - Page with no lead forms
   - Expired tokens
   - Network failures

---

Good luck with your Facebook App setup! 🚀
