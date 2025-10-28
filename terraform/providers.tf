provider "sentry" {
  token = var.sentry_auth_token
  org   = var.sentry_org_slug
}

provider "checkly" {
  api_key    = var.checkly_api_key
  account_id = var.checkly_account_id
}

provider "grafana" {
  url  = var.grafana_url
  auth = var.grafana_auth
}

provider "uptimerobot" {
  api_key = var.uptimerobot_api_key
}

