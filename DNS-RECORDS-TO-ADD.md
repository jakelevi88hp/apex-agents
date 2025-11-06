# DNS Records for updates.apexagents.com

**Domain**: updates.apexagents.com  
**Date**: November 6, 2025  
**Purpose**: Verify domain with Resend for email sending

---

## 🔴 CRITICAL: Add These DNS Records to Your Domain Provider

### Section 1: Domain Verification (REQUIRED)

**Purpose**: Verify you own the domain

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| TXT | `resend._domainkey.updates` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdH0F4yqUlX/Y0D0UWiTiBIsEjEPPUAl/qQbRvvijFnzxE/pGlmtIf/Qf7L1/Ff9Ga3P/8P8jY00qPCNTv4ToQ9nRSYDk9ySpBVRPtoW8Q8iFLMu86EiB4bPZm/jnC805syXx+jiZ9lDdsZUrpBe5IHxA94GvWNLnrF775DhfBPwIDAQAB` | Auto | - |

---

### Section 2: Enable Sending (REQUIRED)

**Purpose**: Allow sending emails from updates.apexagents.com

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| MX | `send.updates` | `feedback-smtp.us-east-1.amazonses.com` | Auto | 10 |
| TXT | `send.updates` | `v=spf1 include:amazonses.com ~all` | Auto | - |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | Auto | - |

**Note**: The `_dmarc` record is optional but recommended for better deliverability.

---

### Section 3: Enable Receiving (OPTIONAL - Skip for now)

**Purpose**: Receive emails at updates.apexagents.com (not needed for password resets)

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| MX | `updates` | `inbound-smtp.us-east-1.amazonaws.com` | Auto | 10 |

**Recommendation**: Skip this section for now. You only need it if you want to RECEIVE emails at updates.apexagents.com.

---

## 📝 How to Add These Records

### If using Vercel:

1. Go to Vercel Dashboard
2. Navigate to your project
3. Click **Settings** → **Domains**
4. Find `apexagents.com`
5. Click **"DNS Records"** or **"Manage"**
6. Add each record from Section 1 and Section 2 above

### If using Cloudflare:

1. Log in to Cloudflare
2. Select `apexagents.com`
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add each record from Section 1 and Section 2 above

### If using another DNS provider:

1. Log in to your DNS provider (GoDaddy, Namecheap, etc.)
2. Find DNS management for `apexagents.com`
3. Add each record from Section 1 and Section 2 above

---

## ⚠️ Important Notes

### About the Name field:

Some DNS providers require the **full subdomain**, while others only need the **subdomain part**:

**Option A (Full)**: 
- `resend._domainkey.updates.apexagents.com`
- `send.updates.apexagents.com`

**Option B (Partial - Recommended)**:
- `resend._domainkey.updates`
- `send.updates`

**Try Option B first**. If your DNS provider shows an error, use Option A.

### About TTL:

- Use **Auto** if available
- Otherwise use **3600** (1 hour)
- Or use your provider's default

### About Priority:

- Only applies to MX records
- Use **10** for all MX records
- Leave blank for TXT records

---

## ✅ Verification Steps

### After adding DNS records:

1. **Wait 5-15 minutes** for DNS propagation
2. Go back to Resend dashboard
3. Click the **"Verify"** button next to each section:
   - Domain Verification
   - Enable Sending
4. You should see green checkmarks ✅

### If verification fails:

- Wait 30 minutes and try again (DNS can be slow)
- Double-check the records match exactly
- Make sure there are no typos
- Check that Name fields are correct for your DNS provider

### Check DNS propagation:

Use this tool to verify records are live:
- https://dnschecker.org

Search for:
- `resend._domainkey.updates.apexagents.com` (TXT record)
- `send.updates.apexagents.com` (MX and TXT records)

---

## 🎯 Summary

**Total Records to Add**: 4 records (or 5 if including optional DMARC)

**Section 1 - Domain Verification**: 1 TXT record  
**Section 2 - Enable Sending**: 2 MX + 1 TXT (+ 1 optional DMARC)  
**Section 3 - Enable Receiving**: Skip for now

**Time Required**: 
- Adding records: 5-10 minutes
- DNS propagation: 5-30 minutes
- Total: 15-40 minutes

**After Verification**:
- Update Vercel environment variable:
  ```
  RESEND_FROM_EMAIL=Apex Agents <noreply@updates.apexagents.com>
  ```
- Emails will be sent from `noreply@updates.apexagents.com`
- Can send to ANY email address (including Scott!)

---

## 🆘 Need Help?

If you get stuck:
1. Check the full guide: `/docs/RESEND-DNS-SETUP.md`
2. Use DNS checker: https://dnschecker.org
3. Contact Resend support: support@resend.com
4. Ask me for help!

---

**Once these records are added and verified, password reset emails will work for all users!** 🚀
