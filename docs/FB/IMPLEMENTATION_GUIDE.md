# Facebook Lead Import - Complete Implementation Guide

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Current Implementation](#current-implementation)
4. [Complete Setup Process](#complete-setup-process)
5. [API Integration Details](#api-integration-details)
6. [Webhook Implementation](#webhook-implementation)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Project Overview

### What This Does

Your CRM integrates with Facebook Lead Ads to automatically import lead submissions into your system.

### User Flow

1. User clicks "Import from Facebook" button
2. User logs in with Facebook account
3. User selects their Facebook Page
4. User selects a lead generation form
5. System imports leads from that form
6. (Optional) System receives real-time notifications for new leads

### Technologies Used

- **Frontend**: React, TypeScript, Ant Design, Refine
- **Facebook SDK**: JavaScript SDK v24.0
- **API**: Facebook Graph API v24.0
- **Authentication**: OAuth 2.0

---

## Architecture

### Component Structure

```
src/components/meta-import-modal/
└── index.tsx                    # Main modal component

src/routes/leads/list/
└── index.tsx                    # Leads list page with import button
```

### Data Flow

```
User Action → Facebook Login → Access Token
                                    ↓
Token → Graph API → User Info (email, name)
                                    ↓
Token → Graph API → Pages List
                                    ↓
Page Token → Graph API → Lead Forms List
                                    ↓
Form ID → Backend API → Store Connection
                                    ↓
Backend → Graph API → Import Leads → CRM Database
```

### State Management

```typescript
// Modal state
const [currentStep, setCurrentStep] = useState(0); // Wizard step
const [userToken, setUserToken] = useState<string | null>(null);
const [pages, setPages] = useState<PageOption[]>([]);
const [forms, setForms] = useState<FormOption[]>([]);
const [selectedPage, setSelectedPage] = useState<PageOption | null>(null);
const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
```

---

## Current Implementation

### What's Already Built ✅

#### 1. Facebook SDK Integration (`index.html`)

```html
<script>
  window.fbAsyncInit = function () {
    FB.init({
      appId: "1148870030057645",
      cookie: true,
      xfbml: true,
      version: "v24.0",
    });
  };
</script>
```

#### 2. Meta Import Modal Component

- Multi-step wizard UI
- Facebook OAuth login
- User info display
- Page selection dropdown
- Form selection dropdown
- Error handling
- Loading states

#### 3. Leads Page Integration

- Import button with Facebook icon
- Modal trigger
- Success callback handling

### What's Partially Implemented ⚠️

#### Permissions Scope

Currently includes all required permissions but only `email` works in development:

```typescript
scope: "email,business_management,leads_retrieval,pages_show_list,pages_read_engagement,pages_manage_ads,pages_manage_metadata";
```

### What's Missing ❌

1. **Backend API endpoint** for storing Meta account connection
2. **Backend API endpoint** for importing leads
3. **Webhook handler** for real-time lead notifications
4. **Token refresh** mechanism
5. **Data mapping** from Facebook format to CRM format
6. **Duplicate detection** for existing leads
7. **Error retry** logic
8. **Rate limiting** handling

---

## Complete Setup Process

### Phase 1: Facebook App Creation (Required)

#### Step 1.1: Create App

```bash
1. Visit https://developers.facebook.com/apps/
2. Click "Create App"
3. Select "Business" type
4. Fill in:
   - App Name: "OceanCRM Lead Import"
   - App Contact Email: your@email.com
   - Business Account: Select or create
5. Click "Create App"
6. Note your App ID
```

#### Step 1.2: Add Facebook Login

```bash
1. Dashboard → "Add Product" → "Facebook Login"
2. Select "Web" platform
3. Go to "Facebook Login" → "Settings"
4. Add to "Valid OAuth Redirect URIs":
   - http://localhost:5173/
   - https://your-production-domain.com/
5. Add to "Allowed Domains for JS SDK":
   - localhost
   - your-production-domain.com
6. Save Changes
```

#### Step 1.3: Configure Basic Settings

```bash
1. Dashboard → "Settings" → "Basic"
2. Add "App Domains":
   - localhost
   - your-production-domain.com
3. Upload App Icon (1024x1024px)
4. Set "Privacy Policy URL"
5. Set "Terms of Service URL"
6. Save Changes
```

### Phase 2: Code Configuration

#### Step 2.1: Update App ID

```bash
# Edit index.html
# Replace the App ID with yours:
appId: 'YOUR_APP_ID_HERE',
```

#### Step 2.2: Test Basic Authentication

```bash
# Start development server
npm run dev

# Open browser
http://localhost:5173

# Navigate to Leads page
# Click "Import from Facebook"
# Login with your Facebook account
# Verify name and email display
```

### Phase 3: Backend Implementation (Required)

#### Step 3.1: Create API Endpoint - Store Meta Account

**Endpoint**: `POST /meta/account`

**Request Body**:

```json
{
  "page_id": "123456789",
  "form_id": "987654321",
  "user_token": "EAABwz..."
}
```

**Backend Logic**:

```typescript
// 1. Validate user authentication
// 2. Exchange user token for long-lived Page token
// 3. Store in database:
//    - user_id
//    - page_id
//    - page_name
//    - form_id
//    - form_name
//    - page_access_token (encrypted)
//    - token_expires_at
//    - created_at
// 4. Return success response
```

**Database Schema**:

```sql
CREATE TABLE meta_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  page_id VARCHAR(255) NOT NULL,
  page_name VARCHAR(255),
  form_id VARCHAR(255) NOT NULL,
  form_name VARCHAR(255),
  page_access_token TEXT NOT NULL, -- Encrypted
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 3.2: Create API Endpoint - Import Leads

**Endpoint**: `POST /meta/import-leads`

**Request Body**:

```json
{
  "account_id": 1
}
```

**Backend Logic**:

```typescript
async function importLeads(accountId: number) {
  // 1. Fetch meta_account from database
  const account = await db.meta_accounts.findOne({ id: accountId });

  // 2. Check token validity, refresh if needed
  if (isTokenExpired(account.token_expires_at)) {
    await refreshPageToken(account);
  }

  // 3. Fetch leads from Facebook
  const response = await fetch(
    `https://graph.facebook.com/v24.0/${account.form_id}/leads?access_token=${account.page_access_token}`,
  );
  const data = await response.json();

  // 4. Process each lead
  for (const fbLead of data.data) {
    // 5. Check if lead already exists (by facebook_lead_id)
    const existing = await db.leads.findOne({
      facebook_lead_id: fbLead.id,
    });

    if (existing) continue; // Skip duplicates

    // 6. Map Facebook data to CRM format
    const leadData = mapFacebookLead(fbLead);

    // 7. Create lead in CRM
    await db.leads.create({
      ...leadData,
      facebook_lead_id: fbLead.id,
      source: "facebook",
      meta_account_id: accountId,
    });
  }

  // 8. Update last_sync timestamp
  await db.meta_accounts.update(
    { id: accountId },
    { last_sync_at: new Date() },
  );

  return { success: true, imported: data.data.length };
}

function mapFacebookLead(fbLead: any) {
  // Map Facebook lead format to your CRM format
  const fieldData = {};

  for (const field of fbLead.field_data) {
    fieldData[field.name] = field.values[0];
  }

  return {
    name:
      fieldData.full_name || fieldData.first_name + " " + fieldData.last_name,
    email: fieldData.email,
    phone: fieldData.phone_number,
    company: fieldData.company_name,
    notes: `Imported from Facebook Lead Ads - Form: ${fbLead.form_id}`,
    submitted_at: new Date(fbLead.created_time),
    // Map other fields as needed
  };
}
```

### Phase 4: Request Advanced Permissions

#### Step 4.1: Business Verification

```bash
1. Facebook App Dashboard → "Settings" → "Business Verification"
2. Upload documents:
   - Business registration certificate
   - Tax ID / EIN
   - Utility bill or bank statement (address proof)
3. Wait 1-2 business days for approval
```

#### Step 4.2: Create Privacy Policy

```bash
1. Use PRIVACY_POLICY_TEMPLATE.md in this repo
2. Customize for your business
3. Host on your website: https://yourdomain.com/privacy
4. Add URL to Facebook App settings
```

#### Step 4.3: Submit for App Review

```bash
1. Dashboard → "App Review" → "Permissions and Features"
2. For each permission, click "Request Advanced Access":
   - email (already approved)
   - business_management
   - leads_retrieval
   - pages_show_list
   - pages_read_engagement
   - pages_manage_ads
   - pages_manage_metadata

3. For each permission, provide:
   - Detailed description of use
   - Demo video showing the feature
   - Screenshots
   - Privacy Policy URL

4. Submit and wait 3-7 business days
```

#### Step 4.4: Create Demo Video

Record a 2-3 minute video showing:

1. Opening your CRM
2. Clicking "Import from Facebook"
3. Facebook login popup (show permissions clearly)
4. Selecting a Page
5. Selecting a form
6. Leads importing successfully
7. Showing imported leads in CRM
8. Disconnecting/data deletion option

**Tools**: OBS Studio, Loom, or built-in screen recording

### Phase 5: Testing & Launch

#### Step 5.1: Test with Approved Permissions

```bash
1. After permissions approved, test full flow
2. Create a real Facebook Page
3. Create a real Lead Ad campaign
4. Submit test leads
5. Verify import works correctly
6. Test edge cases (see TESTING_GUIDE.md)
```

#### Step 5.2: Add Test Users

```bash
1. Dashboard → "Roles" → "Test Users"
2. Create test users or add real users as testers
3. Have them test the complete flow
4. Gather feedback
```

#### Step 5.3: Go Live

```bash
1. Switch app from "Development" to "Live" mode
2. Dashboard → "Settings" → "Basic" → "App Mode" → Switch
3. Now anyone can use your integration!
```

---

## API Integration Details

### Facebook Graph API Endpoints

#### 1. Get User Info

```http
GET https://graph.facebook.com/v24.0/me
    ?fields=id,name,email
    &access_token={user_access_token}
```

**Response**:

```json
{
  "id": "1234567890",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 2. Get User's Pages

```http
GET https://graph.facebook.com/v24.0/me/accounts
    ?fields=id,name,access_token
    &access_token={user_access_token}
```

**Response**:

```json
{
  "data": [
    {
      "id": "987654321",
      "name": "My Business Page",
      "access_token": "EAABwz..."
    }
  ]
}
```

#### 3. Get Lead Forms for Page

```http
GET https://graph.facebook.com/v24.0/{page_id}/leadgen_forms
    ?access_token={page_access_token}
```

**Response**:

```json
{
  "data": [
    {
      "id": "456789123",
      "name": "Contact Form - Fall Campaign",
      "status": "ACTIVE"
    }
  ]
}
```

#### 4. Get Leads from Form

```http
GET https://graph.facebook.com/v24.0/{form_id}/leads
    ?fields=id,created_time,field_data
    &access_token={page_access_token}
```

**Response**:

```json
{
  "data": [
    {
      "id": "lead_123",
      "created_time": "2024-01-15T10:30:00+0000",
      "field_data": [
        { "name": "full_name", "values": ["Jane Smith"] },
        { "name": "email", "values": ["jane@example.com"] },
        { "name": "phone_number", "values": ["+1234567890"] }
      ]
    }
  ]
}
```

### Token Management

#### User Access Token

- **Lifespan**: 1-2 hours
- **Use**: Initial authentication, get Pages list
- **Should not be stored**: Too short-lived

#### Page Access Token

- **Lifespan**: 60 days (can be extended)
- **Use**: Access leads, set up webhooks
- **Should be stored**: Encrypted in database

#### Exchange for Long-Lived Token

```typescript
async function getLongLivedToken(shortToken: string, pageId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v24.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${APP_ID}&` +
      `client_secret=${APP_SECRET}&` +
      `fb_exchange_token=${shortToken}`,
  );

  const data = await response.json();
  return data.access_token; // Long-lived token
}
```

#### Refresh Token Before Expiry

```typescript
async function refreshTokenIfNeeded(account: MetaAccount) {
  const daysUntilExpiry = differenceInDays(
    account.token_expires_at,
    new Date(),
  );

  if (daysUntilExpiry < 7) {
    // Refresh token
    const newToken = await getLongLivedToken(
      account.page_access_token,
      account.page_id,
    );

    await db.meta_accounts.update(
      { id: account.id },
      {
        page_access_token: encrypt(newToken),
        token_expires_at: add(new Date(), { days: 60 }),
      },
    );
  }
}
```

---

## Webhook Implementation

### Why Use Webhooks?

Instead of polling for new leads, get real-time notifications when someone submits a form.

### Setup Process

#### 1. Create Webhook Endpoint

```typescript
// Backend endpoint: POST /webhooks/facebook

app.post("/webhooks/facebook", async (req, res) => {
  // Verify webhook (required by Facebook)
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === WEBHOOK_VERIFY_TOKEN
  ) {
    res.send(req.query["hub.challenge"]);
    return;
  }

  // Process webhook notification
  const { entry } = req.body;

  for (const item of entry) {
    const changes = item.changes || [];

    for (const change of changes) {
      if (change.field === "leadgen") {
        const leadgenId = change.value.leadgen_id;
        const formId = change.value.form_id;
        const pageId = change.value.page_id;

        // Find meta_account for this form
        const account = await db.meta_accounts.findOne({
          form_id: formId,
        });

        if (account) {
          // Import this specific lead
          await importSingleLead(leadgenId, account);
        }
      }
    }
  }

  res.sendStatus(200);
});
```

#### 2. Subscribe to Webhooks

```typescript
async function subscribeToWebhooks(pageId: string, pageToken: string) {
  await fetch(`https://graph.facebook.com/v24.0/${pageId}/subscribed_apps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscribed_fields: ["leadgen"],
      access_token: pageToken,
    }),
  });
}
```

#### 3. Configure in Facebook

```bash
1. App Dashboard → "Webhooks"
2. Click "Edit Subscription"
3. Add Callback URL: https://yourdomain.com/webhooks/facebook
4. Add Verify Token: your_secret_verify_token
5. Subscribe to "leadgen" events
6. Save
```

---

## Production Deployment

### Environment Variables

```bash
# .env.production
VITE_FACEBOOK_APP_ID=your_app_id
VITE_FACEBOOK_API_VERSION=v24.0
FACEBOOK_APP_SECRET=your_app_secret  # Backend only!
WEBHOOK_VERIFY_TOKEN=your_webhook_token
DATABASE_URL=your_database_url
ENCRYPTION_KEY=your_encryption_key
```

### Security Checklist

- [ ] App Secret never exposed to client
- [ ] Page tokens encrypted in database
- [ ] HTTPS enabled for all endpoints
- [ ] Webhook verify token is strong and random
- [ ] Rate limiting implemented
- [ ] Error logging (without exposing tokens)
- [ ] Regular security audits

### Deployment Steps

```bash
1. Update Facebook App with production URLs
2. Add production domain to OAuth settings
3. Deploy backend with webhooks endpoint
4. Test webhook delivery
5. Deploy frontend with production App ID
6. Test complete flow in production
7. Monitor error rates
8. Set up alerts for failures
```

---

## Monitoring & Maintenance

### Metrics to Track

- **Import success rate**: % of successful imports
- **Token expiration incidents**: Count of expired token errors
- **Webhook delivery rate**: % of webhooks successfully processed
- **Average import time**: Time from form submission to CRM
- **Error rates by type**: Categorize errors
- **User adoption**: # of users connecting Facebook

### Error Monitoring

```typescript
// Log errors with context
logger.error("Facebook lead import failed", {
  accountId: account.id,
  formId: account.form_id,
  error: error.message,
  errorCode: error.code,
  userId: user.id,
});
```

### Maintenance Tasks

- **Weekly**: Review error logs
- **Monthly**: Check token expiration dates
- **Quarterly**: Review API version for deprecation
- **Annually**: Renew business verification if needed

---

## Troubleshooting Guide

### Issue: Permissions Denied

**Cause**: App Review not approved or permissions revoked
**Solution**:

- Check App Review status
- Verify user hasn't revoked access
- Check permission is included in login scope

### Issue: No Leads Imported

**Debug Steps**:

1. Verify form has submissions in Facebook
2. Check page_access_token is valid
3. Test API endpoint directly in Graph API Explorer
4. Check backend logs for errors
5. Verify data mapping logic

### Issue: Webhook Not Receiving Events

**Debug Steps**:

1. Verify webhook URL is publicly accessible
2. Check HTTPS is enabled
3. Test webhook with Facebook's test tool
4. Verify subscription is active
5. Check webhook verify token matches
6. Review webhook logs

---

## Additional Resources

### Documentation

- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api
- **Lead Ads API**: https://developers.facebook.com/docs/marketing-api/guides/lead-ads
- **Webhooks**: https://developers.facebook.com/docs/graph-api/webhooks
- **Business Verification**: https://developers.facebook.com/docs/development/release/business-verification

### Tools

- **Graph API Explorer**: Test API calls - https://developers.facebook.com/tools/explorer
- **Access Token Debugger**: Check token status - https://developers.facebook.com/tools/debug/accesstoken
- **Webhook Tester**: Test webhook delivery

### Support

- **Facebook Developer Community**: https://developers.facebook.com/community
- **Bug Reports**: https://developers.facebook.com/support/bugs

---

## Success Checklist

### MVP (Minimum Viable Product)

- [x] Facebook SDK integrated
- [x] Basic authentication works
- [x] UI/UX complete
- [ ] Backend API endpoints created
- [ ] Data import working
- [ ] Error handling robust
- [ ] Privacy Policy published
- [ ] App Review submitted
- [ ] Permissions approved
- [ ] Tested with real users

### Production Ready

- [ ] Webhooks implemented
- [ ] Token refresh automated
- [ ] Monitoring in place
- [ ] Error alerts configured
- [ ] Documentation complete
- [ ] User onboarding flow
- [ ] Support documentation
- [ ] GDPR compliance verified
- [ ] Security audit passed
- [ ] Load testing completed

---

**Estimated Timeline**:

- Setup & Basic Testing: 1 day
- Backend Implementation: 3-5 days
- App Review Process: 5-10 days (waiting)
- Testing & Refinement: 2-3 days
- Production Deployment: 1 day
- **Total: ~2-3 weeks**

Good luck with your implementation! 🚀
