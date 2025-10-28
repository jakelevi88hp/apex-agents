locals { name = "${var.service_name}-${var.environment}" }

# Contact point: Slack via webhook
resource "grafana_contact_point" "slack" {
  name = "${local.name}-slack"
  slack {
    url = var.slack_webhook
  }
}

# Simple routing policy
resource "grafana_notification_policy" "root" {
  contact_point = grafana_contact_point.slack.name
}

# Folder
resource "grafana_folder" "apex" { title = "Apex Agents" }

# Dashboard
resource "grafana_dashboard" "api" {
  folder     = grafana_folder.apex.id
  config_json = var.dashboard_json
}

output "dashboard_url" {
  value = grafana_dashboard.api.url
}

