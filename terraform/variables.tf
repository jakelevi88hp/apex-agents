variable "environment" { type = string }
variable "service_name" { type = string; default = "apex-agents" }

# Sentry
variable "sentry_auth_token" { type = string; sensitive = true }
variable "sentry_org_slug"   { type = string }
variable "sentry_team_slug"  { type = string }

# Checkly
variable "checkly_api_key"    { type = string; sensitive = true }
variable "checkly_account_id" { type = string }
variable "site_base_url"      { type = string }            # e.g. https://apex-agents.vercel.app
variable "api_auth_token"     { type = string; sensitive = true } # bearer for protected checks

# Grafana
variable "grafana_url"  { type = string }
variable "grafana_auth" { type = string; sensitive = true }

# UptimeRobot
variable "uptimerobot_api_key" { type = string; sensitive = true }

# Alerting
variable "slack_webhook_url" { type = string; sensitive = true }

# Tags
variable "tags" { type = map(string); default = {} }

