# Resend Domain Verification - DNS Records Guide

Complete step-by-step guide to verify your domain with Resend for sending emails from your own domain.

---

## 🎯 Goal

Enable sending emails from `noreply@apexagents.com` (or your domain) instead of `onboarding@resend.dev`.

---

## 📋 Step-by-Step Process

### Step 1: Add Domain in Resend

1. Log in to https://resend.com
2. Go to **Domains** section
3. Click **"Add Domain"**
4. Enter your domain: `apexagents.com` (or whatever domain you own)
5. Click **"Add"**

### Step 2: Get Your DNS Records

Resend will show you **3 DNS records** to add. They will look like this:

---

## 🔧 DNS Records You'll Need to Add

### Record 1: SPF (Sender Policy Framework)

**Purpose**: Tells receiving servers that Resend is authorized to send emails from your domain

```
Type:     TXT
Name:     @ (or your domain root)
Value:    v=spf1 include:resend.com ~all
TTL:      3600 (or default)
```

**Example for apexagents.com:**
- **Host/Name**: `@` or `apexagents.com`
- **Type**: `TXT`
- **Value**: `v=spf1 include:resend.com ~all`

---

### Record 2: DKIM (DomainKeys Identified Mail)

**Purpose**: Cryptographic signature to verify emails are actually from you

```
Type:     TXT
Name:     resend._domainkey
Value:    [UNIQUE VALUE PROVIDED BY RESEND]
TTL:      3600 (or default)
```

**Example format:**
- **Host/Name**: `resend._domainkey` or `resend._domainkey.apexagents.com`
- **Type**: `TXT`
- **Value**: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...` (long string provided by Resend)

⚠️ **Important**: The DKIM value is **unique to your account**. You MUST copy it from Resend dashboard.

---

### Record 3: Custom Domain (Optional but Recommended)

**Purpose**: Route emails through Resend's servers

```
Type:     MX
Name:     @ (or your domain root)
Value:    feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL:      3600 (or default)
```

**Example for apexagents.com:**
- **Host/Name**: `@` or `apexagents.com`
- **Type**: `MX`
- **Value**: `feedback-smtp.us-east-1.amazonses.com`
- **Priority**: `10`

⚠️ **Warning**: Only add this if you want ALL emails for your domain to go through Resend. Skip if you use the domain for other email services.

---

## 🌐 Where to Add DNS Records

### If using Vercel for domain:

1. Go to Vercel dashboard
2. Navigate to your project
3. Click **Settings** → **Domains**
4. Click on your domain
5. Scroll to **DNS Records**
6. Click **"Add Record"**
7. Add each record above

### If using Cloudflare:

1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add each record above

### If using GoDaddy:

1. Log in to GoDaddy
2. Go to **My Products** → **DNS**
3. Click **"Add"** under DNS Records
4. Add each record above

### If using Namecheap:

1. Log in to Namecheap
2. Go to **Domain List** → **Manage**
3. Click **"Advanced DNS"**
4. Click **"Add New Record"**
5. Add each record above

---

## 📝 Exact Steps to Get YOUR Specific Records

Since the DKIM record is unique to your account, here's how to get it:

### 1. Log in to Resend

Go to: https://resend.com/login

Use your credentials or login with GitHub/Google

### 2. Navigate to Domains

Click **"Domains"** in the left sidebar

### 3. Add Your Domain

Click **"Add Domain"** button

Enter: `apexagents.com` (or your domain)

### 4. Copy DNS Records

Resend will show you a screen with **3 DNS records**. It will look like this:

```
┌─────────────────────────────────────────────────────┐
│ Add these DNS records to your domain provider:      │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 1. SPF Record                                       │
│    Type: TXT                                        │
│    Name: @                                          │
│    Value: v=spf1 include:resend.com ~all           │
│                                                      │
│ 2. DKIM Record                                      │
│    Type: TXT                                        │
│    Name: resend._domainkey                         │
│    Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...       │
│           [COPY THIS ENTIRE VALUE]                  │
│                                                      │
│ 3. Custom Domain (Optional)                         │
│    Type: MX                                         │
│    Name: @                                          │
│    Value: feedback-smtp.us-east-1.amazonses.com    │
│    Priority: 10                                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 5. Copy Each Record

Click the **"Copy"** button next to each record value

### 6. Add to Your DNS Provider

Go to your domain's DNS settings (Vercel, Cloudflare, GoDaddy, etc.)

Add each record exactly as shown

---

## ✅ Verification

### After Adding DNS Records:

1. Wait 5-15 minutes for DNS propagation
2. Go back to Resend dashboard
3. Click **"Verify"** button next to your domain
4. If successful, you'll see a green checkmark ✅

### If Verification Fails:

**Common Issues:**

1. **DNS not propagated yet**
   - Solution: Wait 30 minutes and try again

2. **Wrong record format**
   - Solution: Double-check spacing, no extra quotes
   - Make sure Name is exactly `@` or your domain
   - Make sure Type is exactly `TXT` or `MX`

3. **DKIM value truncated**
   - Solution: Copy the ENTIRE value (it's very long)
   - Some DNS providers split long TXT records - that's OK

4. **Multiple SPF records**
   - Solution: Only have ONE SPF record
   - If you have existing SPF, merge them:
     - Old: `v=spf1 include:_spf.google.com ~all`
     - New: `v=spf1 include:_spf.google.com include:resend.com ~all`

### Check DNS Propagation:

Use this tool to verify your records are live:
- https://dnschecker.org

Enter your domain and select:
- `TXT` record for SPF and DKIM
- `MX` record for mail server

---

## 🔍 Quick DNS Check Commands

You can also check from command line:

```bash
# Check SPF record
dig TXT apexagents.com

# Check DKIM record
dig TXT resend._domainkey.apexagents.com

# Check MX record
dig MX apexagents.com
```

---

## 📧 After Verification

### Update Vercel Environment Variable

Once your domain is verified:

1. Go to Vercel → Settings → Environment Variables
2. Add or update:
   ```
   RESEND_FROM_EMAIL=Apex Agents <noreply@apexagents.com>
   ```
3. Redeploy your app (or it will pick up on next request)

### Test Email Sending

1. Go to `/forgot-password`
2. Enter ANY email address (not just yours!)
3. Check that email's inbox
4. You should receive a beautiful email from `noreply@apexagents.com`

---

## 🎯 Expected Timeline

| Step | Time |
|------|------|
| Add domain in Resend | 1 minute |
| Copy DNS records | 1 minute |
| Add to DNS provider | 5 minutes |
| DNS propagation | 5-30 minutes |
| Verify in Resend | 1 minute |
| Update Vercel env var | 2 minutes |
| **Total** | **15-40 minutes** |

---

## 📊 What You Get

**Before Domain Verification:**
- ❌ Can only send to your own email (jakelevi88hp@gmail.com)
- ❌ Emails from `onboarding@resend.dev`
- ❌ May go to spam folder

**After Domain Verification:**
- ✅ Send to ANY email address
- ✅ Emails from `noreply@apexagents.com`
- ✅ Better deliverability
- ✅ Professional branding
- ✅ Lower spam score

---

## 🆘 Need Help?

### Resend Support
- **Docs**: https://resend.com/docs/dashboard/domains/introduction
- **Email**: support@resend.com
- **Discord**: https://discord.gg/resend

### DNS Provider Support
- **Vercel**: https://vercel.com/docs/projects/domains/working-with-domains
- **Cloudflare**: https://developers.cloudflare.com/dns/
- **GoDaddy**: https://www.godaddy.com/help/add-a-txt-record-19232
- **Namecheap**: https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-do-i-add-txtspfdkimdmarc-records-for-my-domain/

---

## 🎉 Summary

1. **Log in to Resend** → Add domain
2. **Copy 3 DNS records** (SPF, DKIM, MX)
3. **Add to your DNS provider** (Vercel, Cloudflare, etc.)
4. **Wait 15 minutes** for propagation
5. **Verify in Resend** → Click verify button
6. **Update Vercel env** → RESEND_FROM_EMAIL
7. **Test** → Send password reset to any email

**You'll be able to send emails to Scott and all users from your own domain!** 🚀
