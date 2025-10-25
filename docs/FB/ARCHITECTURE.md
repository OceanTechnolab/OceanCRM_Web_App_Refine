# Facebook Lead Import - Visual Architecture

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Leads Page (src/routes/leads/list/index.tsx)              │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  [Import from Facebook Button] 📲                │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  │                          ↓ Opens                            │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Meta Import Modal Component                      │      │    │
│  │  │  (src/components/meta-import-modal/index.tsx)    │      │    │
│  │  │                                                    │      │    │
│  │  │  Step 1: [Log in With Facebook] 🔐              │      │    │
│  │  │  Step 2: [Select Your Page] 📄                  │      │    │
│  │  │  Step 3: [Select Lead Form] 📋                  │      │    │
│  │  │  Step 4: [Connect to CRM] ✅                    │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      FACEBOOK SDK (Client-Side)                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Facebook JavaScript SDK v24.0                              │    │
│  │  Initialized in index.html                                  │    │
│  │                                                              │    │
│  │  • window.FB.login() - OAuth popup                          │    │
│  │  • Handles user authentication                              │    │
│  │  • Returns access token                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    FACEBOOK GRAPH API (External)                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  graph.facebook.com/v24.0                                   │    │
│  │                                                              │    │
│  │  GET /me                      → User info (name, email)     │    │
│  │  GET /me/accounts             → List of Pages               │    │
│  │  GET /{page_id}/leadgen_forms → List of lead forms          │    │
│  │  GET /{form_id}/leads         → Lead submissions            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      YOUR BACKEND API (To Be Built)                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  POST /meta/account                                          │    │
│  │  • Stores page_id, form_id, page_access_token               │    │
│  │  • Encrypts and saves tokens                                │    │
│  │  • Links to user account                                    │    │
│  │                                                              │    │
│  │  POST /meta/import-leads                                    │    │
│  │  • Fetches leads from Facebook                              │    │
│  │  • Maps data to CRM format                                  │    │
│  │  • Checks for duplicates                                    │    │
│  │  • Saves to database                                        │    │
│  │                                                              │    │
│  │  POST /webhooks/facebook (Optional)                         │    │
│  │  • Receives real-time notifications                         │    │
│  │  • Imports new leads immediately                            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          DATABASE                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  meta_accounts table                                         │    │
│  │  ├─ id                                                       │    │
│  │  ├─ user_id                                                  │    │
│  │  ├─ page_id                                                  │    │
│  │  ├─ form_id                                                  │    │
│  │  ├─ page_access_token (encrypted) 🔒                       │    │
│  │  └─ token_expires_at                                        │    │
│  │                                                              │    │
│  │  leads table                                                 │    │
│  │  ├─ id                                                       │    │
│  │  ├─ name                                                     │    │
│  │  ├─ email                                                    │    │
│  │  ├─ phone                                                    │    │
│  │  ├─ source = 'facebook'                                     │    │
│  │  ├─ facebook_lead_id (unique)                               │    │
│  │  └─ meta_account_id                                         │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Sequence

### Scenario 1: Initial Setup

```
User                    Frontend                Facebook            Backend          Database
  │                        │                        │                  │                │
  │  Click "Import"        │                        │                  │                │
  │───────────────────────>│                        │                  │                │
  │                        │                        │                  │                │
  │                        │  Open Modal            │                  │                │
  │<───────────────────────│                        │                  │                │
  │                        │                        │                  │                │
  │  Click "Login"         │                        │                  │                │
  │───────────────────────>│                        │                  │                │
  │                        │                        │                  │                │
  │                        │  FB.login()            │                  │                │
  │                        │───────────────────────>│                  │                │
  │                        │                        │                  │                │
  │                        │  OAuth Popup           │                  │                │
  │<────────────────────────────────────────────────│                  │                │
  │                        │                        │                  │                │
  │  Grant Permissions     │                        │                  │                │
  │───────────────────────────────────────────────>│                  │                │
  │                        │                        │                  │                │
  │                        │  Access Token          │                  │                │
  │                        │<───────────────────────│                  │                │
  │                        │                        │                  │                │
  │                        │  GET /me               │                  │                │
  │                        │───────────────────────>│                  │                │
  │                        │                        │                  │                │
  │                        │  User Info             │                  │                │
  │                        │<───────────────────────│                  │                │
  │                        │                        │                  │                │
  │  Display Name & Email  │                        │                  │                │
  │<───────────────────────│                        │                  │                │
  │                        │                        │                  │                │
  │                        │  GET /me/accounts      │                  │                │
  │                        │───────────────────────>│                  │                │
  │                        │                        │                  │                │
  │                        │  Pages List            │                  │                │
  │                        │<───────────────────────│                  │                │
  │                        │                        │                  │                │
  │  Select Page           │                        │                  │                │
  │───────────────────────>│                        │                  │                │
  │                        │                        │                  │                │
  │                        │  GET /{page}/forms     │                  │                │
  │                        │───────────────────────>│                  │                │
  │                        │                        │                  │                │
  │                        │  Forms List            │                  │                │
  │                        │<───────────────────────│                  │                │
  │                        │                        │                  │                │
  │  Select Form           │                        │                  │                │
  │───────────────────────>│                        │                  │                │
  │                        │                        │                  │                │
  │  Click "Connect"       │                        │                  │                │
  │───────────────────────>│                        │                  │                │
  │                        │                        │                  │                │
  │                        │         POST /meta/account               │                │
  │                        │─────────────────────────────────────────>│                │
  │                        │                        │                  │                │
  │                        │                        │                  │  INSERT meta   │
  │                        │                        │                  │──────────────>│
  │                        │                        │                  │                │
  │                        │         Success Response                  │                │
  │                        │<─────────────────────────────────────────│                │
  │                        │                        │                  │                │
  │  "Successfully         │                        │                  │                │
  │   Connected!" ✅       │                        │                  │                │
  │<───────────────────────│                        │                  │                │
```

### Scenario 2: Importing Leads (Backend Process)

```
Backend                 Facebook Graph API              Database
  │                            │                           │
  │  POST /meta/import-leads   │                           │
  │                            │                           │
  │  Get meta_account          │                           │
  │──────────────────────────────────────────────────────>│
  │                            │                           │
  │  Account details           │                           │
  │<──────────────────────────────────────────────────────│
  │                            │                           │
  │  GET /{form_id}/leads      │                           │
  │───────────────────────────>│                           │
  │                            │                           │
  │  Leads data (JSON)         │                           │
  │<───────────────────────────│                           │
  │                            │                           │
  │  For each lead:            │                           │
  │  • Check if exists         │                           │
  │  • Map data to CRM format  │                           │
  │  • Validate                │                           │
  │                            │                           │
  │  INSERT leads              │                           │
  │──────────────────────────────────────────────────────>│
  │                            │                           │
  │  Success                   │                           │
  │<──────────────────────────────────────────────────────│
  │                            │                           │
  │  Return: {imported: 5}     │                           │
```

### Scenario 3: Real-time Webhook (Optional)

```
Facebook              Your Webhook              Backend                Database
  │                       │                        │                      │
  │  New lead submitted   │                        │                      │
  │                       │                        │                      │
  │  POST /webhooks       │                        │                      │
  │──────────────────────>│                        │                      │
  │                       │                        │                      │
  │                       │  Parse notification    │                      │
  │                       │  Get lead_id, form_id  │                      │
  │                       │                        │                      │
  │                       │  Find meta_account     │                      │
  │                       │───────────────────────────────────────────────>│
  │                       │                        │                      │
  │                       │  Account details       │                      │
  │                       │<───────────────────────────────────────────────│
  │                       │                        │                      │
  │  GET /{lead_id}       │                        │                      │
  │<──────────────────────│                        │                      │
  │                       │                        │                      │
  │  Lead data            │                        │                      │
  │──────────────────────>│                        │                      │
  │                       │                        │                      │
  │                       │  Map & insert lead     │                      │
  │                       │───────────────────────────────────────────────>│
  │                       │                        │                      │
  │  200 OK               │                        │                      │
  │<──────────────────────│                        │                      │
```

---

## 🔐 Security Flow

```
┌────────────────────────────────────────────────────────────┐
│                    TOKEN SECURITY                           │
│                                                             │
│  User Access Token (Short-lived: 1-2 hours)                │
│  ├─ Generated by FB.login()                                │
│  ├─ Sent to backend ONCE                                   │
│  ├─ Never stored in frontend                               │
│  └─ Used to get Page token                                 │
│                                                             │
│  Page Access Token (Long-lived: 60 days)                   │
│  ├─ Obtained from /me/accounts                             │
│  ├─ ENCRYPTED before database storage 🔒                  │
│  ├─ Only decrypted when needed                             │
│  ├─ Refreshed before expiry                                │
│  └─ Used for all API calls                                 │
│                                                             │
│  Environment Variables                                      │
│  ├─ FACEBOOK_APP_SECRET (Backend only!)                    │
│  ├─ ENCRYPTION_KEY (Database encryption)                   │
│  ├─ Never committed to Git                                 │
│  └─ Stored in secure environment                           │
└────────────────────────────────────────────────────────────┘
```

---

## 📱 Permission Flow

```
┌────────────────────────────────────────────────────────────┐
│              PERMISSION REQUEST FLOW                        │
│                                                             │
│  Development Mode (Before App Review)                       │
│  ┌──────────────────────────────────────────────────┐     │
│  │  ✅ email                                         │     │
│  │  • Works immediately                              │     │
│  │  • Only for admins/developers/testers             │     │
│  │                                                    │     │
│  │  ❌ pages_show_list                              │     │
│  │  ❌ leads_retrieval                              │     │
│  │  ❌ Other advanced permissions                   │     │
│  │  • Need App Review approval                       │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  After App Review Approval                                 │
│  ┌──────────────────────────────────────────────────┐     │
│  │  ✅ All requested permissions                    │     │
│  │  • Works for all users                            │     │
│  │  • App can go "Live"                              │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Project File Structure

```
OceanCRM_Web_App_Refine/
├── index.html                           # Facebook SDK initialization ⚡
│
├── src/
│   ├── components/
│   │   └── meta-import-modal/
│   │       └── index.tsx                # Main integration component 🎯
│   │
│   └── routes/
│       └── leads/
│           └── list/
│               └── index.tsx            # Leads page with import button
│
├── DOCUMENTATION/
│   ├── README_FACEBOOK_INTEGRATION.md   # 📚 START HERE - Main index
│   ├── QUICK_START.md                   # 🚀 5-minute setup
│   ├── FACEBOOK_APP_SETUP_GUIDE.md      # 📖 Complete Facebook setup
│   ├── IMPLEMENTATION_GUIDE.md          # 💻 Technical implementation
│   ├── TESTING_GUIDE.md                 # 🧪 Testing procedures
│   ├── PRIVACY_POLICY_TEMPLATE.md       # 📄 Legal compliance
│   ├── ARCHITECTURE.md                  # 📊 This file!
│   └── check-facebook-setup.sh          # ✅ Verification script
│
└── .env.example                         # Environment configuration
```

---

## 🎯 Implementation Status

```
┌─────────────────────────────────────────────────────────────┐
│  COMPONENT STATUS                                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend                                       Status       │
│  ├─ Facebook SDK integration                   ✅ Complete  │
│  ├─ OAuth login flow                           ✅ Complete  │
│  ├─ Multi-step wizard UI                       ✅ Complete  │
│  ├─ Error handling                             ✅ Complete  │
│  ├─ Loading states                             ✅ Complete  │
│  └─ User info display                          ✅ Complete  │
│                                                              │
│  Backend                                        Status       │
│  ├─ POST /meta/account                         ❌ To Do     │
│  ├─ POST /meta/import-leads                    ❌ To Do     │
│  ├─ Token encryption                           ❌ To Do     │
│  ├─ Token refresh logic                        ❌ To Do     │
│  ├─ Data mapping                               ❌ To Do     │
│  ├─ Duplicate detection                        ❌ To Do     │
│  └─ Webhook handler (optional)                 ⚪ Optional  │
│                                                              │
│  Facebook App                                   Status       │
│  ├─ App created                                ⚠️  Verify   │
│  ├─ Facebook Login added                       ⚠️  Verify   │
│  ├─ OAuth configured                           ⚠️  Verify   │
│  ├─ Business verification                      ❌ To Do     │
│  ├─ Privacy Policy                             ❌ To Do     │
│  └─ App Review submission                      ❌ To Do     │
│                                                              │
│  Database                                       Status       │
│  ├─ meta_accounts table                        ❌ To Do     │
│  └─ leads table updates                        ❌ To Do     │
└─────────────────────────────────────────────────────────────┘

Legend:
✅ Complete and working
⚠️  Needs verification/configuration
❌ Not yet implemented
⚪ Optional feature
```

---

## 📈 Timeline Visualization

```
Week 1: Foundation & Testing
├─ Day 1: Quick Start ──────────────┐
├─ Day 2: Facebook App Setup ───────┤
├─ Day 3: Basic Auth Testing ───────┤  ✅ You can complete this now!
├─ Day 4: Privacy Policy Draft ─────┤
└─ Day 5: Business Verification ────┘

Week 2: Backend Development
├─ Day 1: Database Schema ──────────┐
├─ Day 2: API Endpoints ────────────┤
├─ Day 3: Token Management ─────────┤  🔧 Development phase
├─ Day 4: Lead Import Logic ────────┤
└─ Day 5: Testing & Debugging ──────┘

Week 3: App Review
├─ Day 1: Demo Video ───────────────┐
├─ Day 2: App Review Submission ────┤  ⏳ Waiting period
├─ Day 3-7: Waiting ────────────────┘

Week 4: Launch
├─ Day 1: Production Deploy ────────┐
├─ Day 2: Testing ──────────────────┤  🚀 Go live!
├─ Day 3: Monitoring ───────────────┤
└─ Day 4-5: User Training ──────────┘

Total: ~4 weeks from start to production
```

---

## 🔍 Error Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                         │
│                                                               │
│  User Action                                                  │
│      ↓                                                        │
│  ┌──────────┐                                                │
│  │ Try API  │                                                │
│  │ Call     │                                                │
│  └────┬─────┘                                                │
│       │                                                       │
│       ├──→ Success ──→ Display result ──→ Next step         │
│       │                                                       │
│       ├──→ Network Error ──→ Show error message             │
│       │                     │                                │
│       │                     └─→ Retry button available       │
│       │                                                       │
│       ├──→ Permission Denied ──→ "Please grant permissions" │
│       │                          │                            │
│       │                          └─→ Re-login button          │
│       │                                                       │
│       ├──→ Token Expired ──→ Auto re-authenticate           │
│       │                      │                                │
│       │                      └─→ Retry original action        │
│       │                                                       │
│       └──→ Other Error ──→ Display error                     │
│                           │                                   │
│                           ├─→ Log to console                  │
│                           └─→ Report to monitoring            │
└──────────────────────────────────────────────────────────────┘
```

---

## 📚 Related Documentation

- **Main Index**: README_FACEBOOK_INTEGRATION.md
- **Quick Start**: QUICK_START.md
- **Full Setup**: FACEBOOK_APP_SETUP_GUIDE.md
- **Implementation**: IMPLEMENTATION_GUIDE.md
- **Testing**: TESTING_GUIDE.md

---

_This architecture document provides a visual overview of the system.  
For detailed implementation instructions, see the other guide files._
