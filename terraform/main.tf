module "sentry" {
  source           = "./modules/sentry"
  environment      = var.environment
  service_name     = var.service_name
  team_slug        = var.sentry_team_slug
  slack_webhook    = var.slack_webhook_url
}

module "checkly" {
  source        = "./modules/checkly"
  environment   = var.environment
  service_name  = var.service_name
  base_url      = var.site_base_url
  api_auth      = var.api_auth_token
  slack_webhook = var.slack_webhook_url
}

module "grafana" {
  source        = "./modules/grafana"
  environment   = var.environment
  service_name  = var.service_name
  slack_webhook = var.slack_webhook_url
  dashboard_json = file("${path.module}/../dashboards/apex_api_dashboard.json")
}

module "uptimerobot" {
  source       = "./modules/uptimerobot"
  environment  = var.environment
  service_name = var.service_name
  base_url     = var.site_base_url
}

