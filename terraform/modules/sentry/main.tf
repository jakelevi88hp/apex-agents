locals {
  project_slug = replace("${var.service_name}-${var.environment}", ":", "-")
}

resource "sentry_team" "team" {
  # Optionally manage team; if it already exists, import
  slug = var.team_slug
}

resource "sentry_project" "proj" {
  name        = local.project_slug
  slug        = local.project_slug
  team        = var.team_slug
  platform    = "javascript-nextjs"
  resolve_age = 720 # hours
}

resource "sentry_project_key" "key" {
  project = sentry_project.proj.slug
  name    = "default"
}

# Alert: error rate spike
resource "sentry_metric_alert" "error_rate" {
  project     = sentry_project.proj.slug
  name        = "${local.project_slug}: High error rate"
  dataset     = "transactions"
  query       = "event.type:error | rate() > 0.03" # >3%
  aggregate   = "count()"
  time_window = 5
  threshold_type = "above"

  actions {
    type          = "slack"
    target_type   = "webhook"
    target_identifier = var.slack_webhook
  }
}

# Performance alert: p95 > 2.5s
resource "sentry_metric_alert" "latency" {
  project     = sentry_project.proj.slug
  name        = "${local.project_slug}: High p95 latency"
  dataset     = "transactions"
  query       = "transaction.duration:p95()>2500"
  aggregate   = "p95(transaction.duration)"
  time_window = 5
  threshold_type = "above"
  actions {
    type              = "slack"
    target_type       = "webhook"
    target_identifier = var.slack_webhook
  }
}

output "dsn" {
  value     = sentry_project_key.key.dsn_public
  sensitive = true
}

