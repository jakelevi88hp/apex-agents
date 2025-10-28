locals {
  name_prefix = "${var.service_name}-${var.environment}"
}

# Slack alert channel
resource "checkly_alert_channel" "slack" {
  slack {
    url = var.slack_webhook
  }
  send_recovery = true
  send_failures = true
  send_degrades = true
  alert_threshold = 1
  name = "${local.name_prefix}-slack"
}

# Group
resource "checkly_check_group" "apex" {
  name                  = "${local.name_prefix}-synthetics"
  activated             = true
  concurrency           = 3
  runtimes              = ["2024.09"]
  muted                 = false
  double_check          = true
  use_global_alert_settings = false
  alert_channel_subscription {
    channel_id = checkly_alert_channel.slack.id
  }
  environment_variables = {
    BASE_URL = var.base_url
    API_AUTH = var.api_auth
  }
  locations = ["us-east-1", "us-west-2", "eu-west-1"]
}

# 1) Public page check: /
resource "checkly_http_check" "home" {
  name              = "${local.name_prefix} /"
  group_id          = checkly_check_group.apex.id
  activated         = true
  method            = "GET"
  url               = "${var.base_url}/"
  frequency         = 1 # minutes
  degraded_response_time  = 2500
  max_response_time       = 5000
  follow_redirects   = true
  ssl_check          = true
}

# 2) API auth check
resource "checkly_http_check" "auth_me" {
  name      = "${local.name_prefix} /api/trpc/auth.me"
  group_id  = checkly_check_group.apex.id
  activated = true
  url       = "${var.base_url}/api/trpc/auth.me"
  method    = "GET"
  frequency = 2
  headers = {
    Authorization = "Bearer ${var.api_auth}"
  }
  assertions = [{
    source      = "STATUS_CODE"
    comparison  = "EQUALS"
    target      = "200"
  }]
}

# 3) Browser flow: signup → login → dashboard
resource "checkly_browser_check" "signup_login" {
  name      = "${local.name_prefix} signup→login"
  group_id  = checkly_check_group.apex.id
  activated = true
  frequency = 15
  locations = ["us-east-1", "us-west-2", "eu-west-1"]
  script = <<'EOT'
  const { chromium } = require('playwright');
  const email = `synthetic+${Date.now()}@apexagents.test`;
  const password = 'Synthetics123!@#';
  const base = process.env.BASE_URL;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${base}/signup`, { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Synthetic User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button:has-text("Sign Up")');
  await page.waitForURL(`${base}/dashboard`, { timeout: 30000 });
  await page.waitForSelector('text=Welcome to Apex Agents');
  await browser.close();
  EOT
}

# 4) Workflow create/delete API smoke using fetch
resource "checkly_api_check" "workflow_smoke" {
  name      = "${local.name_prefix} workflow smoke"
  group_id  = checkly_check_group.apex.id
  activated = true
  frequency = 15
  request {
    url     = "${var.base_url}/api/trpc/workflows.create"
    method  = "POST"
    headers = {
      Authorization = "Bearer ${var.api_auth}"
      'Content-Type' = 'application/json'
    }
    body = jsonencode({
      json = {
        name  = "synthetic-workflow"
        steps = ["research", "analyze", "report"]
      }
    })
    assertions = [{
      source     = "STATUS_CODE"
      comparison = "EQUALS"
      target     = "200"
    }]
  }
}

# Optional: public dashboard for sharing checks
resource "checkly_dashboard" "public" {
  name        = "${local.name_prefix} public"
  header      = "Apex Agents Synthetics"
  tags        = [local.name_prefix]
  custom_domain = null
}

output "public_dashboard_url" {
  value = checkly_dashboard.public.url
}

