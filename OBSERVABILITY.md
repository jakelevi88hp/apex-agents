# Apex Agents Observability Stack

Comprehensive monitoring and alerting infrastructure for the Apex Agents platform.

## Overview

This project includes a complete observability stack provisioned via Terraform:

- **Sentry** - Error tracking and performance monitoring
- **Checkly** - Synthetic monitoring with automated browser tests
- **Grafana Cloud** - Dashboards and alerting
- **UptimeRobot** - Uptime monitoring for key endpoints
- **Slack** - Centralized alerting

## Prerequisites

### Required Service Accounts

1. **Sentry** (https://sentry.io)
   - Create an organization
   - Create a team
   - Generate an auth token with project:write permissions

2. **Checkly** (https://www.checklyhq.com)
   - Sign up for an account
   - Get your Account ID from Settings
   - Generate an API key

3. **Grafana Cloud** (https://grafana.com/products/cloud/)
   - Create a free account
   - Get your stack URL (e.g., https://yourstack.grafana.net)
   - Generate an API token with Admin permissions

4. **UptimeRobot** (https://uptimerobot.com)
   - Create a free account
   - Generate a Main API Key

5. **Slack** (https://slack.com)
   - Create a Slack workspace
   - Create an Incoming Webhook URL for alerts

### Required Environment Variables

Set these in your CI/CD environment (GitHub Secrets) or locally:

```bash
# Sentry
export TF_VAR_sentry_auth_token="YOUR_SENTRY_AUTH_TOKEN"
export TF_VAR_sentry_org_slug="your-org-slug"
export TF_VAR_sentry_team_slug="your-team-slug"

# Checkly
export TF_VAR_checkly_api_key="YOUR_CHECKLY_API_KEY"
export TF_VAR_checkly_account_id="YOUR_CHECKLY_ACCOUNT_ID"

# Grafana
export TF_VAR_grafana_url="https://yourstack.grafana.net"
export TF_VAR_grafana_auth="YOUR_GRAFANA_API_TOKEN"

# UptimeRobot
export TF_VAR_uptimerobot_api_key="YOUR_UPTIMEROBOT_API_KEY"

# Slack
export TF_VAR_slack_webhook_url="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Application
export TF_VAR_site_base_url="https://apex-agents.vercel.app"
export TF_VAR_api_auth_token="YOUR_JWT_TOKEN_FOR_TESTING"
```

## Terraform Setup

### Installation

1. Install Terraform >= 1.9.0:
   ```bash
   brew install terraform  # macOS
   # or
   wget https://releases.hashicorp.com/terraform/1.9.6/terraform_1.9.6_linux_amd64.zip
   unzip terraform_1.9.6_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. Initialize Terraform:
   ```bash
   cd terraform
   terraform init
   ```

### Deployment

1. **Plan** - Preview changes:
   ```bash
   terraform plan -var-file=env/production.tfvars
   ```

2. **Apply** - Deploy infrastructure:
   ```bash
   terraform apply -var-file=env/production.tfvars
   ```

3. **Outputs** - Get important values:
   ```bash
   terraform output sentry_dsn
   terraform output grafana_dashboard_url
   terraform output checkly_dashboard_url
   ```

### Updating

After making changes to Terraform files:

```bash
cd terraform
terraform plan -var-file=env/production.tfvars
terraform apply -var-file=env/production.tfvars
```

### Destroying

To remove all monitoring infrastructure:

```bash
cd terraform
terraform destroy -var-file=env/production.tfvars
```

## Sentry Integration

### Configuration

1. Get your Sentry DSN from Terraform output:
   ```bash
   cd terraform
   terraform output -raw sentry_dsn
   ```

2. Add to Vercel environment variables:
   - `NEXT_PUBLIC_SENTRY_DSN` - Your Sentry DSN
   - `SENTRY_ORG` - Your Sentry organization slug
   - `SENTRY_PROJECT` - `apex-agents-production`
   - `SENTRY_AUTH_TOKEN` - Your Sentry auth token (for source maps)

3. Redeploy your application

### Features

- **Error Tracking** - Automatic capture of unhandled errors
- **Performance Monitoring** - Track API response times and page load speeds
- **Session Replay** - Watch user sessions that encountered errors
- **Release Tracking** - Link errors to specific Git commits
- **Slack Alerts** - Get notified of error spikes and performance issues

### Testing

Trigger a test error:

```javascript
// In your browser console or add to a page
throw new Error("Sentry test error");
```

Check Sentry dashboard to verify the error was captured.

## Checkly Synthetic Monitoring

### What's Monitored

1. **Homepage** - HTTP check every 1 minute
2. **API Authentication** - Validates `/api/trpc/auth.me` every 2 minutes
3. **User Signup Flow** - Full browser test every 15 minutes
   - Navigate to signup page
   - Fill form and submit
   - Verify redirect to dashboard
4. **Workflow API** - API test every 15 minutes

### Locations

Tests run from multiple locations:
- US East (N. Virginia)
- US West (Oregon)
- EU West (Ireland)

### Viewing Results

Access your Checkly dashboard:
```bash
cd terraform
terraform output checkly_dashboard_url
```

## Grafana Dashboards

### Available Dashboards

1. **API Health Dashboard**
   - API latency p95
   - Error rate
   - Database query duration p95
   - Availability last 24h

### Accessing Dashboards

```bash
cd terraform
terraform output grafana_dashboard_url
```

### Alerts

Grafana sends alerts to Slack for:
- High error rates
- Slow API responses
- Database performance issues
- Downtime

## UptimeRobot Monitoring

### Monitored Endpoints

1. **Homepage** - Checked every 60 seconds
2. **Dashboard** - Checked every 5 minutes

### Accessing Reports

Log in to UptimeRobot dashboard to view:
- Uptime percentage
- Response time trends
- Downtime incidents

## GitHub Actions

### Automated Deployment

The observability infrastructure is automatically deployed via GitHub Actions when changes are pushed to the `main` branch.

**Workflow**: `.github/workflows/infra-apply.yml`

**Triggers**:
- Push to `main` branch with changes in `terraform/` or `dashboards/`
- Manual workflow dispatch

**Required Secrets** (set in GitHub repository settings):
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG_SLUG`
- `SENTRY_TEAM_SLUG`
- `CHECKLY_API_KEY`
- `CHECKLY_ACCOUNT_ID`
- `GRAFANA_URL`
- `GRAFANA_AUTH`
- `UPTIMEROBOT_API_KEY`
- `SLACK_WEBHOOK_URL`
- `SITE_BASE_URL`
- `API_AUTH_TOKEN`

## Alerting

All alerts are centralized in Slack. You'll receive notifications for:

### Sentry Alerts
- Error rate > 3%
- p95 latency > 2.5 seconds

### Checkly Alerts
- Failed HTTP checks
- Failed browser tests
- Degraded performance

### Grafana Alerts
- Custom metric thresholds
- Database performance issues

### Configuration

Alerts are sent to the Slack webhook configured in `TF_VAR_slack_webhook_url`.

To customize alert thresholds, edit:
- `terraform/modules/sentry/main.tf` - Sentry alerts
- `terraform/modules/checkly/main.tf` - Checkly alerts
- `terraform/modules/grafana/main.tf` - Grafana alerts

## Troubleshooting

### Terraform Errors

**Provider authentication failed:**
- Verify all environment variables are set correctly
- Check that API tokens have the required permissions

**Resource already exists:**
- Import existing resources: `terraform import <resource_type>.<name> <id>`
- Or delete the existing resource and let Terraform recreate it

### Sentry Not Capturing Errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel
2. Check Sentry configuration files are present
3. Trigger a test error and check browser console for Sentry logs
4. Verify the Sentry project exists and is active

### Checkly Tests Failing

1. Check if the application is accessible from Checkly's locations
2. Verify API authentication token is valid
3. Review test scripts for selector changes
4. Check Checkly dashboard for detailed error logs

### Grafana Dashboard Empty

1. Verify metrics are being sent to Grafana Cloud
2. Check dashboard queries match your metric names
3. Ensure data source is configured correctly
4. Wait a few minutes for data to populate

## Cost Estimates

### Free Tiers

- **Sentry**: 5,000 errors/month, 10,000 transactions/month
- **Checkly**: 10,000 check runs/month
- **Grafana Cloud**: 10,000 series, 50GB logs, 50GB traces
- **UptimeRobot**: 50 monitors, 5-minute intervals
- **Slack**: Unlimited messages

### Paid Plans (if needed)

- **Sentry**: $26/month for Team plan
- **Checkly**: $7/month for 20,000 check runs
- **Grafana Cloud**: Pay-as-you-go after free tier
- **UptimeRobot**: $7/month for 1-minute intervals

## Best Practices

1. **Monitor What Matters** - Focus on user-facing metrics
2. **Set Meaningful Alerts** - Avoid alert fatigue
3. **Review Regularly** - Check dashboards weekly
4. **Update Tests** - Keep synthetic tests in sync with UI changes
5. **Track Releases** - Use Sentry release tracking for faster debugging
6. **Document Incidents** - Create runbooks for common issues

## Support

For issues with:
- **Terraform**: Check Terraform documentation or GitHub issues
- **Sentry**: Visit https://docs.sentry.io
- **Checkly**: Visit https://www.checklyhq.com/docs
- **Grafana**: Visit https://grafana.com/docs
- **UptimeRobot**: Visit https://uptimerobot.com/help

## Maintenance

### Regular Tasks

- **Weekly**: Review error trends in Sentry
- **Monthly**: Check uptime reports and performance trends
- **Quarterly**: Review and optimize alert thresholds
- **Annually**: Review service costs and optimize usage

### Updating Services

When updating the application:
1. Update Checkly test selectors if UI changes
2. Add new endpoints to monitoring
3. Update Grafana dashboards for new features
4. Test alerts after major changes

## License

This observability stack configuration is part of the Apex Agents project.

