# Facebook Lead Import - Testing Guide

## 🧪 Testing Phases

### Phase 1: Basic Setup Verification ✅

#### Test 1: SDK Loading

**Objective**: Verify Facebook SDK loads correctly

**Steps**:

1. Start your dev server: `npm run dev`
2. Open browser console (F12)
3. Check for Facebook SDK initialization
4. Type `window.FB` in console - should return an object

**Expected Result**:

- No errors in console
- `window.FB` object exists
- SDK version shows v24.0

**Troubleshooting**:

- If SDK doesn't load, check `index.html` for SDK script
- Clear browser cache and reload
- Check for ad blockers blocking Facebook scripts

---

#### Test 2: Basic Authentication (Email Permission)

**Objective**: Test Facebook login with basic email permission

**Prerequisites**:

- You must be added as Admin/Developer in the Facebook App

**Steps**:

1. Navigate to Leads page
2. Click "Import from Facebook" button
3. Click "Log in With Facebook"
4. Grant email permission
5. Verify user info displays

**Expected Result**:

- Login popup appears
- After approval, shows your name and email
- No errors in console
- Modal shows "Successfully Connected"

**Common Issues**:

- **"Permission denied"**: Ensure you're an admin of the Facebook App
- **"App not setup"**: Check App ID in `index.html` matches your app
- **"Redirect URI mismatch"**: Add your localhost URL to OAuth settings

---

### Phase 2: Advanced Permissions Testing (Requires App Review Approval)

#### Test 3: Pages List Access

**Objective**: Fetch user's Facebook Pages

**Prerequisites**:

- `pages_show_list` permission approved
- You must be admin of at least one Facebook Page

**Steps**:

1. Complete Facebook login
2. Check if Pages dropdown appears
3. Select a Page from the list

**Expected Result**:

- Dropdown shows all Pages you manage
- Each Page displays correct name
- No "No Pages Found" error

**Test Data Setup**:

- Create a test Page: https://www.facebook.com/pages/create
- Make yourself Page admin
- Page must be published (not draft)

---

#### Test 4: Lead Forms Access

**Objective**: Fetch lead generation forms for selected Page

**Prerequisites**:

- `leads_retrieval` permission approved
- Selected Page has at least one lead ad campaign
- Lead form must be published

**Steps**:

1. Select a Page from dropdown
2. Wait for forms to load
3. Verify lead forms appear in dropdown

**Expected Result**:

- Forms dropdown populates with available lead forms
- Each form shows correct name
- "Connect to CRM" button becomes enabled

**Test Data Setup**:

1. Go to Facebook Ads Manager
2. Create a Lead Generation campaign
3. Create a lead form with basic fields
4. Publish the campaign (can use low budget)

---

#### Test 5: Lead Data Retrieval

**Objective**: Import actual lead submissions

**Prerequisites**:

- Lead form selected
- At least one test lead submission exists

**Steps**:

1. Select Page and Lead Form
2. Click "Connect to CRM"
3. Verify connection success message
4. Check CRM for imported leads

**Expected Result**:

- Success message appears
- Leads appear in CRM leads list
- Lead data correctly mapped to CRM fields

**Test Data**:

1. Submit a test lead form yourself
2. Use test values:
   - Name: Test Lead
   - Email: test@example.com
   - Phone: (555) 123-4567

---

### Phase 3: Error Handling Tests

#### Test 6: Network Failures

**Objective**: Verify graceful error handling

**Steps**:

1. Open browser DevTools > Network tab
2. Set network throttling to "Offline"
3. Try to login with Facebook
4. Verify error message displays

**Expected Result**:

- User-friendly error message
- No application crash
- Ability to retry

---

#### Test 7: Permission Revocation

**Objective**: Handle users who revoke permissions

**Steps**:

1. Complete login once successfully
2. Go to Facebook Settings > Apps and Websites
3. Remove permissions for your app
4. Try to use the import feature again

**Expected Result**:

- App detects missing permissions
- Prompts user to re-authenticate
- Requests missing permissions

---

#### Test 8: Token Expiration

**Objective**: Handle expired access tokens

**Steps**:

1. Login and get access token
2. Wait for token to expire (~1-2 hours)
3. Try to fetch pages/forms

**Expected Result**:

- App detects expired token
- Prompts user to re-authenticate
- Seamlessly refreshes token

---

### Phase 4: Edge Cases

#### Test 9: User with No Pages

**Objective**: Handle users without Page admin access

**Test Setup**:

- Test with account that doesn't manage any Pages

**Expected Result**:

- Shows "No Pages Found" message
- Provides link to create a Page
- Doesn't crash or show confusing errors

---

#### Test 10: Page with No Lead Forms

**Objective**: Handle Pages without lead generation forms

**Test Setup**:

- Select a Page without any lead ads

**Expected Result**:

- Shows "No Lead Forms Found" message
- Provides link to create lead ads
- Doesn't crash

---

#### Test 11: Multiple Businesses

**Objective**: Handle users with multiple business accounts

**Test Setup**:

- Test with account managing multiple businesses
- Each business has different Pages

**Expected Result**:

- All Pages from all businesses appear
- Can select Pages from any business
- No duplicate or missing Pages

---

### Phase 5: Performance Testing

#### Test 12: Large Datasets

**Objective**: Test with many Pages/Forms

**Test Setup**:

- Account with 10+ Pages
- Multiple forms per Page

**Expected Result**:

- Dropdowns load within 3 seconds
- No UI freezing
- Smooth scrolling in dropdowns

---

#### Test 13: Concurrent Users

**Objective**: Multiple users importing simultaneously

**Test Setup**:

- 2-3 users login at same time
- All import leads simultaneously

**Expected Result**:

- All imports complete successfully
- No data mixing between users
- No rate limit errors

---

## 🔍 Debugging Tools

### 1. Facebook Graph API Explorer

**URL**: https://developers.facebook.com/tools/explorer/

**Use For**:

- Testing API calls manually
- Checking permission grants
- Debugging token issues
- Viewing exact API responses

**How to Use**:

1. Select your app from dropdown
2. Generate access token with required permissions
3. Test API endpoints:
   - `/me` - User info
   - `/me/accounts` - Pages list
   - `/{page-id}/leadgen_forms` - Lead forms
   - `/{form-id}/leads` - Lead submissions

---

### 2. Access Token Debugger

**URL**: https://developers.facebook.com/tools/debug/accesstoken/

**Use For**:

- Checking token validity
- Viewing granted permissions
- Seeing token expiration time
- Debugging permission errors

**How to Use**:

1. Copy access token from browser console
2. Paste into debugger
3. Click "Debug"
4. Review permissions and expiration

---

### 3. Browser Console Logging

Add this to your component for detailed debugging:

```typescript
// Add after each API call
console.log("FB Token:", userToken);
console.log("Pages Response:", data);
console.log("Forms Response:", forms);
console.log("Granted Permissions:", response.authResponse.grantedScopes);
```

---

### 4. Network Tab Inspection

**Monitor**:

- API calls to `graph.facebook.com`
- Response status codes
- Response payloads
- Request headers (check access token)

---

## 📊 Test Result Documentation

### Test Results Template

```markdown
## Test: [Test Name]

**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: Development/Production
**Status**: ✅ Pass / ❌ Fail / ⚠️ Partial

### Setup

- App ID: [Your App ID]
- Permissions: [List granted permissions]
- Test Account: [Test user details]

### Steps Performed

1. Step 1
2. Step 2
3. Step 3

### Results

- Expected: [What should happen]
- Actual: [What happened]
- Screenshots: [Attach if relevant]

### Issues Found

- Issue 1: [Description and severity]
- Issue 2: [Description and severity]

### Notes

[Any additional observations]
```

---

## 🚨 Common Issues & Solutions

### Issue: "This app is in Development Mode"

**Cause**: App not submitted for review or not approved yet  
**Solution**: This is expected! Only admins/developers/testers can use it. Submit for App Review when ready.

### Issue: "pages_show_list permission not granted"

**Cause**: Permission not approved by Facebook  
**Solution**:

1. Check App Review status in Facebook Developers
2. If rejected, review feedback and resubmit
3. In development, ensure you're an app admin

### Issue: No leads showing up after import

**Cause**: Multiple possible reasons  
**Debug Steps**:

1. Check if leads exist in Facebook Ads Manager
2. Verify correct form ID selected
3. Check backend API logs
4. Verify CRM database connection
5. Check data mapping logic

### Issue: "Invalid OAuth Redirect URI"

**Cause**: Redirect URI not whitelisted  
**Solution**: Add your URL to "Valid OAuth Redirect URIs" in Facebook Login settings

---

## ✅ Pre-Production Checklist

Before launching to production:

- [ ] All test phases completed
- [ ] App Review approved for all permissions
- [ ] Privacy Policy URL configured
- [ ] Terms of Service URL configured
- [ ] Production domain added to OAuth settings
- [ ] App Secret secured (server-side only)
- [ ] Error logging implemented
- [ ] Webhook configured for real-time leads (optional)
- [ ] Rate limiting handled
- [ ] User data handling complies with GDPR
- [ ] Tested with non-admin users
- [ ] Performance tested with large datasets
- [ ] Backup/recovery plan in place
- [ ] Monitoring and alerts configured

---

## 📞 Support Resources

### Facebook Developer Support

- Community Forum: https://developers.facebook.com/community/
- Bug Reports: https://developers.facebook.com/support/bugs/
- Documentation: https://developers.facebook.com/docs/

### Your Team

- Lead Developer: [Name]
- Backend Developer: [Name]
- QA Tester: [Name]

---

## 📝 Testing Schedule

### Week 1: Basic Setup

- Day 1-2: SDK integration and basic auth
- Day 3-4: Error handling
- Day 5: Documentation review

### Week 2: Advanced Features

- Day 1-2: Pages and Forms fetching
- Day 3-4: Lead data import
- Day 5: Edge cases testing

### Week 3: Polish & Review

- Day 1-2: Performance testing
- Day 3: Security review
- Day 4: Documentation
- Day 5: App Review submission prep

---

Good luck with testing! 🚀
