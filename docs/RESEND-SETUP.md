# Resend Email Service Setup

Complete guide for setting up Resend email service for password resets and transactional emails.

---

## 📧 What is Resend?

Resend is a modern email API for developers. It provides:
- Simple API for sending transactional emails
- Beautiful email templates
- High deliverability rates
- Generous free tier (100 emails/day)
- Easy domain verification

---

## 🚀 Setup Instructions

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Click "Sign Up" or "Get Started"
3. Create account with your email
4. Verify your email address

### Step 2: Get API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section
3. Click **"Create API Key"**
4. Name it: "Apex Agents Production"
5. Copy the API key (starts with `re_...`)
6. **Save it securely** - you won't see it again!

### Step 3: Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_api_key_here`
   - **Environment**: Production, Preview, Development
4. Click **Save**

### Step 4: Configure From Email (Optional)

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `apexagents.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually 5-15 minutes)
6. Once verified, add to Vercel:
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `Apex Agents <noreply@apexagents.com>`

### Step 5: Redeploy

1. Go to Vercel dashboard
2. Navigate to **Deployments**
3. Click **"Redeploy"** on the latest deployment
4. Or push a new commit to trigger deployment

---

## 🧪 Testing

### Test Password Reset Email

1. Go to https://apex-agents.vercel.app/forgot-password
2. Enter your email address
3. Click "Send Reset Link"
4. Check your inbox for the email
5. Click the reset link
6. Set a new password

### Test Welcome Email

1. Go to https://apex-agents.vercel.app/signup
2. Create a new account
3. Check your inbox for the welcome email

### Check Email Logs

1. Log in to Resend dashboard
2. Go to **Emails** section
3. See all sent emails with status
4. Click on an email to see details

---

## 📊 Email Templates

### Password Reset Email

**Subject**: Reset your Apex Agents password

**Features**:
- Beautiful gradient header
- Clear call-to-action button
- Fallback plain text link
- 1-hour expiry notice
- Security disclaimer
- Support contact info

**Preview**: Check `/src/lib/email/resend.ts`

### Welcome Email

**Subject**: Welcome to Apex Agents! 🎉

**Features**:
- Personalized greeting
- Trial details and features
- Get started button
- Support information

**Preview**: Check `/src/lib/email/resend.ts`

---

## 🔒 Security Best Practices

### API Key Security

- ✅ **DO**: Store API key in environment variables
- ✅ **DO**: Use different keys for dev/prod
- ✅ **DO**: Rotate keys periodically
- ❌ **DON'T**: Commit API keys to git
- ❌ **DON'T**: Share API keys publicly
- ❌ **DON'T**: Use production keys in development

### Email Security

- ✅ **DO**: Verify domain ownership
- ✅ **DO**: Use DKIM/SPF records
- ✅ **DO**: Rate limit password reset requests
- ✅ **DO**: Expire reset tokens after 1 hour
- ❌ **DON'T**: Include sensitive data in emails
- ❌ **DON'T**: Reveal if email exists (enumeration)

---

## 💰 Pricing

### Free Tier
- **100 emails/day**
- **3,000 emails/month**
- Perfect for getting started
- All features included

### Paid Plans
- **$20/month**: 50,000 emails
- **$80/month**: 250,000 emails
- **$320/month**: 1,000,000 emails
- **Enterprise**: Custom pricing

**Current Usage**: ~10-50 emails/day (password resets + signups)

---

## 🐛 Troubleshooting

### Emails Not Sending

**Check API Key**:
```bash
# In Vercel dashboard
Settings → Environment Variables → RESEND_API_KEY
```

**Check Logs**:
```bash
# In Vercel dashboard
Deployments → [Latest] → Functions → Logs
# Look for "Password reset email sent successfully"
```

**Check Resend Dashboard**:
- Go to Emails section
- Look for failed sends
- Check error messages

### Emails Going to Spam

**Solutions**:
1. Verify your domain in Resend
2. Add SPF record: `v=spf1 include:resend.com ~all`
3. Add DKIM records (provided by Resend)
4. Warm up your domain (send gradually)
5. Ask users to whitelist your email

### Rate Limiting

If you hit the 100 emails/day limit:
1. Upgrade to paid plan
2. Or implement email queuing
3. Or use multiple API keys (not recommended)

---

## 📈 Monitoring

### Key Metrics to Track

1. **Delivery Rate**: % of emails delivered
2. **Open Rate**: % of emails opened
3. **Click Rate**: % of links clicked
4. **Bounce Rate**: % of emails bounced
5. **Spam Rate**: % marked as spam

### Resend Dashboard

- **Emails**: See all sent emails
- **Analytics**: View metrics over time
- **Logs**: Debug delivery issues
- **Webhooks**: Get real-time notifications

---

## 🔄 Migration from Console Logging

**Before** (logged to console):
```typescript
console.log(`Reset link: ${resetUrl}`);
```

**After** (sent via email):
```typescript
await sendPasswordResetEmail(email, resetToken);
```

**Benefits**:
- ✅ Professional user experience
- ✅ No need to check server logs
- ✅ Works in production
- ✅ Trackable delivery
- ✅ Beautiful templates

---

## 📞 Support

### Resend Support
- **Documentation**: https://resend.com/docs
- **Email**: support@resend.com
- **Discord**: https://discord.gg/resend
- **Status**: https://status.resend.com

### Apex Agents Support
- **Email**: support@apexagents.com
- **Documentation**: /docs
- **GitHub Issues**: jakelevi88hp/apex-agents

---

## ✅ Checklist

Before going live, verify:

- [ ] Resend account created
- [ ] API key generated
- [ ] API key added to Vercel
- [ ] Domain verified (optional but recommended)
- [ ] FROM_EMAIL configured
- [ ] Deployment successful
- [ ] Password reset email tested
- [ ] Welcome email tested
- [ ] Emails not going to spam
- [ ] Monitoring set up

---

## 🎉 You're All Set!

Your email service is now fully configured and ready for production. Users will receive:

1. **Welcome email** when they sign up
2. **Password reset email** when they forget their password
3. **Professional, branded emails** with beautiful templates

**Next Steps**:
1. Test both email flows
2. Monitor delivery rates
3. Collect user feedback
4. Iterate on templates if needed

Good luck! 🚀
