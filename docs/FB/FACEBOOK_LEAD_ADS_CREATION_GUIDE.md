# How to Create Facebook Lead Generation Forms

## 📋 Overview

This guide will walk you through creating Facebook Lead Ads and Lead Generation Forms step-by-step. Lead Ads allow you to collect information from people interested in your business without them having to leave Facebook.

---

## 🎯 Prerequisites

Before creating Lead Ads, you need:

- ✅ A Facebook Page (Business Page, not personal profile)
- ✅ Facebook Business Manager account (or Ads Manager access)
- ✅ A payment method added to your ad account
- ✅ Admin or Advertiser role on the Page

---

## 📝 Step-by-Step: Create Lead Generation Form

### Method 1: Create Lead Form Directly (Recommended for Testing)

#### Step 1: Go to Publishing Tools

1. Go to your Facebook Page
2. Click **"Publishing Tools"** in the left sidebar
3. Click **"Forms Library"** in the left menu
4. Click **"Create"** button

#### Step 2: Choose Form Type

Select one of these options:

- **More volume** - Shorter form, easier for users (recommended for testing)
- **Higher intent** - Longer form with more qualifying questions
- **Custom** - Build your own form from scratch

**For testing, choose "More volume"**

#### Step 3: Set Up Form Details

**Basic Information**:

- **Form Name**: `Test Lead Form - [Date]` (for internal use)
- **Form Type**: Choose based on your goal
  - Contact information
  - Quote request
  - Newsletter signup
  - etc.

#### Step 4: Configure Privacy Policy

- **Privacy Policy URL**: Add your website's privacy policy URL
  - Example: `https://yourdomain.com/privacy`
  - This is REQUIRED - use the PRIVACY_POLICY_TEMPLATE.md from this project

#### Step 5: Add Questions (Fields to Collect)

**Pre-filled fields** (from user's Facebook profile):

- ✅ **Full name** - Required for most forms
- ✅ **Email** - Essential for CRM import
- ✅ **Phone number** - Useful for follow-up
- 📍 City
- 📍 State/Province
- 📍 ZIP/Postal code
- 📍 Country

**Custom questions** (you can add your own):

- Multiple choice
- Short answer
- Appointment scheduling
- Store location
- etc.

**Recommended minimal form for testing**:

```
1. Full name (pre-filled)
2. Email (pre-filled)
3. Phone number (pre-filled, optional)
4. "How can we help you?" (short answer)
```

#### Step 6: Thank You Screen

Configure what users see after submitting:

- **Headline**: "Thanks for your interest!"
- **Description**: "We'll be in touch soon"
- **Call to Action** (optional):
  - Visit Website
  - Download
  - Call Now
  - etc.

#### Step 7: Review and Create

1. Click **"Create"** or **"Publish"**
2. Your form is now ready to use!
3. Note the Form ID (you'll need this for your CRM integration)

---

### Method 2: Create Lead Ad Campaign with Form

#### Step 1: Access Ads Manager

1. Go to https://business.facebook.com/adsmanager
2. Or from your Page: Click **"Ad Center"** → **"All Ads"** → **"Create Ad"**

#### Step 2: Choose Campaign Objective

1. Click **"Create"** button
2. Select **"Lead generation"** as your objective
3. Name your campaign: `Test Lead Campaign`
4. Click **"Continue"**

#### Step 3: Set Up Ad Set

**Budget & Schedule**:

- Daily budget: $5-10 (minimum for testing)
- Schedule: Start immediately or set specific dates
- For testing: Set end date for 2-3 days

**Audience**:
For testing, you can target yourself:

- **Location**: Your city
- **Age**: Your age range
- **Gender**: All or specific
- **Detailed Targeting**: Add your interests
- **Tip**: Target a small audience (100-1,000 people) for cheap testing

**Placements**:

- **Automatic placements** (recommended)
- Or **Manual placements**: Facebook Feed, Instagram Feed

#### Step 4: Create the Ad

**Identity**:

- Select your Facebook Page

**Ad Setup**:

- **Format**: Single image or video
- **Media**: Upload an image (1200x628px recommended)
  - Can be simple: Your logo, product image, or stock photo
  - Tip: Use Canva for quick ad creation

**Primary Text**:

```
🎯 Get a Free Quote Today!

Interested in [your service]? Fill out our quick form and we'll get back to you within 24 hours.

No obligation - just helpful information! ✨
```

**Headline**: "Get Your Free Quote"

**Description**: "Takes less than 30 seconds"

#### Step 5: Set Up Lead Form

Two options here:

**Option A: Create New Form**

1. Click **"Create form"**
2. Follow Steps 3-7 from Method 1 above

**Option B: Use Existing Form**

1. Click **"Select existing form"**
2. Choose from your Forms Library
3. Click **"Continue"**

#### Step 6: Review and Publish

1. Review all settings
2. Click **"Publish"**
3. Your ad will be reviewed by Facebook (usually within 24 hours)
4. Once approved, it starts running

---

## 🧪 Testing Your Lead Form

### Option 1: Test Directly from Forms Library

1. Go to **Publishing Tools** → **Forms Library**
2. Find your form
3. Click **"View Details"**
4. Click **"Preview"** button
5. Fill out and submit as a test
6. Check if lead appears in **"Leads"** tab

### Option 2: Test with Live Ad (Recommended)

1. Create a minimal ad campaign (as above)
2. Target only yourself or small audience
3. Use minimal budget ($5-10)
4. Run for 1-2 days
5. Submit the form yourself from your mobile device
6. Verify lead appears in CRM

### Where to View Collected Leads

**In Forms Library**:

1. **Publishing Tools** → **Forms Library**
2. Click on your form
3. Click **"Leads"** tab
4. See all submissions with timestamps

**In Ads Manager**:

1. Go to **Ads Manager**
2. Select your Lead campaign
3. Click **"View Leads"** button
4. Download as CSV if needed

---

## 📱 Quick Test Setup (5 Minutes)

### Fastest Way to Test

1. **Create Simple Form**:

   ```
   Name: Test Form
   Fields: Full name, Email, Phone
   Privacy Policy: Your website URL
   ```

2. **Create $5 Ad Campaign**:

   ```
   Budget: $5/day for 1 day
   Audience: Your city, 100-1000 people
   Image: Any simple image
   Text: "Test - Get Free Info"
   ```

3. **Submit Test Lead**:
   - Use your mobile phone
   - Find your ad in Facebook feed
   - Fill out and submit

4. **Verify in CRM**:
   - Use your import modal
   - Select page and form
   - Import leads
   - Check if test lead appears

---

## 🎨 Best Practices for Lead Forms

### Form Design

- ✅ **Keep it short** - 3-5 fields maximum
- ✅ **Use pre-filled fields** - Reduces friction
- ✅ **Clear value proposition** - Why should they fill it out?
- ✅ **Mobile-friendly** - Most leads come from mobile

### Question Selection

**Essential fields**:

- Full name ✅
- Email ✅
- Phone (optional but recommended)

**Good additional questions**:

- "What are you interested in?" (multiple choice)
- "When would you like to be contacted?" (dropdown)
- "Any specific requirements?" (short answer)

**Avoid**:

- Too many required fields
- Complex questions
- Sensitive information (unless necessary)

### Ad Creative Tips

- Use eye-catching images
- Clear headline about the benefit
- Include a call-to-action
- Show the offer/value upfront
- Use emojis sparingly but effectively

---

## 🔍 Finding Your Form ID

### Method 1: From Forms Library URL

1. Go to **Publishing Tools** → **Forms Library**
2. Click on your form
3. Look at the URL in browser:
   ```
   https://www.facebook.com/...forms_library/form_details/?form_id=123456789
   ```
4. The number after `form_id=` is your Form ID

### Method 2: Using Graph API Explorer

1. Go to https://developers.facebook.com/tools/explorer/
2. Select your Page
3. Run query: `GET /{page-id}/leadgen_forms`
4. View form IDs in response

### Method 3: From Your CRM Integration

- Your import modal will automatically fetch and display form IDs
- Just select your page and the forms will appear

---

## 📍 Where to View Your Forms in Facebook UI

### Option 1: Forms Library (Recommended - Desktop)

**Direct Access URLs**:

#### For a specific Facebook Page:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS
```

#### Using Page Name:

```
https://www.facebook.com/{PAGE_NAME}/publishing_tools/?section=LEAD_ADS_FORMS
```

**Step-by-Step**:

1. Go to your Facebook Page
2. In the left sidebar, click **"Publishing Tools"**
3. In the left menu, click **"Forms Library"**
4. You'll see all your lead generation forms listed

**What You'll See**:

- Form name (e.g., "Henna by Nena's form created on Fri Apr 25, 2025 2:52pm")
- Form status (ACTIVE, DRAFT, ARCHIVED)
- Number of leads collected
- Creation date
- Options to: Edit, View, Download Leads, Archive

### Option 2: Meta Business Suite (Desktop & Mobile)

**Direct Link**:

```
https://business.facebook.com/latest/leads
```

**Or Navigate**:

1. Go to https://business.facebook.com
2. Select your Page from the dropdown
3. In the left menu, click **"Leads"** or **"Forms"**
4. View all forms and leads in one place

**Features**:

- View leads from all forms
- Download leads as CSV
- Manage multiple Pages
- Mobile app access

### Option 3: Meta Ads Manager (For Ad-Based Forms)

**Direct Link**:

```
https://business.facebook.com/adsmanager/manage/ads
```

**Then**:

1. Go to your Lead Generation campaign
2. Click **"View Leads"** button
3. Or go to: Tools → Leads Center

**Leads Center Direct Link**:

```
https://business.facebook.com/ads/leadgen/
```

### Option 4: Facebook Pages Manager App (Mobile)

**For iOS/Android**:

1. Download "Meta Business Suite" app
2. Log in and select your Page
3. Tap **"Leads"** in the bottom menu
4. View and manage forms on the go

---

## 🔗 Quick Access Links for Your Forms

Based on your API response, you have **2 active forms**:

### Form 1: "Henna by Nena's form"

- **Form ID**: `1832323164213143`
- **Status**: ACTIVE
- **Locale**: en_US

**Direct Access** (replace `{PAGE_ID}` with your actual Page ID):

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=active
```

**View Leads for This Form**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=leads&form_id=1832323164213143
```

### Form 2: "Standard form"

- **Form ID**: `2641153762748710`
- **Status**: ACTIVE
- **Locale**: en_GB

**View Leads for This Form**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=leads&form_id=2641153762748710
```

---

## 🎯 How to Find Your Page ID

If you don't know your Page ID:

### Method 1: From Page Settings

1. Go to your Facebook Page
2. Click **"Settings"**
3. Click **"Page Info"** in left menu
4. Your Page ID is listed at the bottom

### Method 2: From Page URL

1. Go to your Facebook Page
2. Look at the URL:
   - If numeric: `facebook.com/123456789` → Page ID is 123456789
   - If text: `facebook.com/YourPageName` → Use method 1

### Method 3: Using Graph API

1. Go to: https://developers.facebook.com/tools/explorer/
2. Run query: `GET /me/accounts`
3. Find your Page and copy the `id` field

### Method 4: Quick Lookup

Visit: `https://findmyfbid.com/` and paste your Page URL

---

## 📊 Complete URL Reference Guide

### Forms Library URLs

**All Forms**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS
```

**Active Forms Only**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=active
```

**Archived Forms**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=archived
```

**Create New Form**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=create
```

**View Specific Form**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/form_details/?form_id={FORM_ID}
```

**View Leads for Specific Form**:

```
https://www.facebook.com/{PAGE_ID}/publishing_tools/?section=LEAD_ADS_FORMS&subsection=leads&form_id={FORM_ID}
```

### Business Suite URLs

**Leads Center**:

```
https://business.facebook.com/latest/leads
```

**Forms Management**:

```
https://business.facebook.com/latest/lead_ads_forms
```

**Download All Leads**:

```
https://business.facebook.com/ads/leadgen/
```

### Ads Manager URLs

**Leads Center in Ads Manager**:

```
https://business.facebook.com/adsmanager/manage/leads
```

**All Campaigns**:

```
https://business.facebook.com/adsmanager/manage/campaigns
```

---

## 🖼️ Visual Guide: Where to Find Forms

### Desktop: Forms Library Path

```
Facebook Page
└─ Publishing Tools (left sidebar)
   └─ Forms Library (left menu)
      └─ Your Forms List
         ├─ Form 1: "Henna by Nena's form"
         ├─ Form 2: "Standard form"
         └─ [+ Create] button
```

### Desktop: Business Suite Path

```
business.facebook.com
└─ Select Your Page (top dropdown)
   └─ Leads (left menu)
      └─ Forms tab
         ├─ All Forms
         └─ All Leads
```

### Mobile: Meta Business Suite App

```
Open App
└─ Select Page
   └─ Leads (bottom navigation)
      └─ Forms
         ├─ View forms
         ├─ View leads
         └─ Download CSV
```

---

## 🚨 Common Issues & Solutions

### Issue: "No forms found for this page"

**Possible Causes**:

1. You don't have any lead forms created yet
2. You're not an admin of the Page
3. Forms are in draft status

**Solutions**:

- Create a new form using Method 1 above
- Verify you're a Page admin
- Publish any draft forms

### Issue: "Form not showing in CRM"

**Solutions**:

1. Wait 5 minutes after creating form (cache delay)
2. Refresh the page selection in your CRM
3. Verify the form is published (not draft)
4. Check you selected the correct Page

### Issue: "No leads appearing"

**Solutions**:

1. Verify ad is approved and running
2. Check budget hasn't been depleted
3. Make sure audience size isn't too small
4. Submit a test lead yourself

### Issue: "Can't create lead ads"

**Requirements**:

- Must have a Facebook Page (not personal profile)
- Must be Page admin or advertiser
- Must have payment method added
- Account must not be restricted

---

## 💰 Cost Information

### Creating Forms

- **FREE** - No cost to create lead forms
- You only pay when running ads

### Running Lead Ads

- **Minimum**: $1/day budget
- **Recommended for testing**: $5-10/day
- **Cost per lead**: Typically $3-15 depending on:
  - Industry
  - Location
  - Audience quality
  - Form length
  - Ad quality

### Testing Budget Recommendation

```
Test Campaign:
- Budget: $5-10/day
- Duration: 2-3 days
- Expected leads: 1-5 leads
- Total cost: $10-30

This proves your integration works before scaling up!
```

---

## 📊 Lead Form Analytics

### Metrics to Track

**In Forms Library**:

- Total submissions
- Submission rate
- Completion rate
- Drop-off points

**In Ads Manager**:

- Cost per lead
- Lead quality score
- Conversion rate
- Return on ad spend (ROAS)

### Optimizing Your Forms

**High drop-off?**

- Reduce number of fields
- Make more fields optional
- Improve value proposition

**Low quality leads?**

- Add qualifying questions
- Be more specific in ad copy
- Adjust audience targeting

**High cost per lead?**

- Improve ad creative
- Test different audiences
- Optimize ad copy
- Try different placements

---

## 🎯 Advanced: Multiple Forms Strategy

### Why Multiple Forms?

Create different forms for:

1. **By Service**: Different forms for different products/services
2. **By Intent**: Newsletter vs. Quote vs. Demo
3. **By Source**: Facebook vs. Instagram
4. **By Campaign**: Different offers or promotions

### Example Setup

```
Form 1: "Free Quote" - Detailed, higher intent
Form 2: "Newsletter" - Simple, high volume
Form 3: "Demo Request" - Enterprise prospects
Form 4: "Price List" - Lead magnet
```

Each form can be connected separately in your CRM!

---

## 🔗 Quick Links

### Facebook Resources

- **Forms Library**: https://www.facebook.com/[your-page]/publishing_tools/?section=LEAD_ADS_FORMS
- **Ads Manager**: https://business.facebook.com/adsmanager
- **Lead Ads Guide**: https://www.facebook.com/business/help/397336587121938
- **Best Practices**: https://www.facebook.com/business/learn/lessons/lead-ads-best-practices

### Your Project Resources

- **Integration Setup**: FACEBOOK_APP_SETUP_GUIDE.md
- **Testing Guide**: TESTING_GUIDE.md
- **Privacy Policy**: PRIVACY_POLICY_TEMPLATE.md

---

## ✅ Checklist: Create Your First Lead Form

### Preparation (5 minutes)

- [ ] Verify you're admin of Facebook Page
- [ ] Have privacy policy URL ready
- [ ] Know what information you want to collect

### Create Form (10 minutes)

- [ ] Go to Publishing Tools → Forms Library
- [ ] Click "Create"
- [ ] Choose "More volume" template
- [ ] Add privacy policy URL
- [ ] Select fields: Name, Email, Phone
- [ ] Add one custom question (optional)
- [ ] Configure thank you screen
- [ ] Publish form
- [ ] Note the Form ID

### Create Test Ad (15 minutes)

- [ ] Go to Ads Manager
- [ ] Create Lead Generation campaign
- [ ] Set $5-10 daily budget
- [ ] Target small local audience
- [ ] Upload simple image
- [ ] Write basic ad copy
- [ ] Select your lead form
- [ ] Publish campaign

### Test Integration (10 minutes)

- [ ] Wait for ad approval (~30 min to 24 hours)
- [ ] Submit test lead yourself
- [ ] Go to your CRM
- [ ] Click "Import from Facebook"
- [ ] Select your Page
- [ ] Select your Form
- [ ] Import leads
- [ ] Verify test lead appears

**Total Time**: ~40 minutes + waiting for ad approval

---

## 🎓 Learning Resources

### Facebook Blueprint Courses (Free)

1. "Lead Ads Best Practices"
2. "Creating Effective Lead Ads"
3. "Optimizing for Lead Generation"

### Video Tutorials

- Search YouTube: "How to create Facebook Lead Ads 2024"
- Facebook Business YouTube Channel

---

## 💡 Pro Tips

1. **Start Simple**: Your first form should be minimal (name, email only)
2. **Test with Yourself**: Always submit at least one test lead
3. **Mobile First**: 80%+ of leads come from mobile - test on phone
4. **Quick Follow-up**: Contact leads within 5 minutes for best results
5. **A/B Test**: Create multiple forms and see which performs better
6. **Privacy Matters**: Always include legitimate privacy policy URL
7. **Thank You Page**: Use it to set expectations ("We'll call within 24 hours")
8. **Save as Template**: Once you have a good form, duplicate for new campaigns

---

## 🆘 Need Help?

### If You're Stuck:

1. **Forms not creating?**
   - Check you're a Page admin
   - Try different browser
   - Clear cache and cookies

2. **Can't run ads?**
   - Verify payment method added
   - Check account isn't restricted
   - Review Facebook ad policies

3. **Integration not working?**
   - See TESTING_GUIDE.md
   - Run ./check-facebook-setup.sh
   - Verify permissions in your Facebook App

4. **No leads showing up?**
   - Check Leads tab in Forms Library
   - Verify form is published (not draft)
   - Wait a few minutes for system to sync

---

## 🎉 Success!

Once you have:

- ✅ Lead form created and published
- ✅ Test ad running (or at least form published)
- ✅ At least one test submission
- ✅ Form ID known

You're ready to connect it to your CRM!

**Next Step**: Use the "Import from Facebook" feature in your CRM to select this form and import leads automatically.

---

## 📋 Quick Reference Card

```
CREATE FORM:
Facebook Page → Publishing Tools → Forms Library → Create

CREATE AD:
Ads Manager → Create → Lead Generation → Set up campaign

VIEW LEADS:
Forms Library → [Your Form] → Leads tab

FORM REQUIREMENTS:
✓ Facebook Page (admin access)
✓ Privacy Policy URL
✓ At least 1 field (name/email recommended)
✓ Thank you message

TESTING:
✓ $5-10 budget
✓ Small local audience
✓ 1-2 days runtime
✓ Submit yourself
```

---

**Questions?** Check the troubleshooting section or refer to Facebook's official Lead Ads documentation.

**Ready to import?** Once your form has submissions, use your CRM's "Import from Facebook" button!

---

_Last Updated: October 25, 2025_  
_Part of OceanCRM Facebook Integration Documentation Suite_
