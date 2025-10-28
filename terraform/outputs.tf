output "sentry_dsn" { value = module.sentry.dsn; sensitive = true }
output "grafana_dashboard_url" { value = module.grafana.dashboard_url }
output "checkly_dashboard_url" { value = module.checkly.public_dashboard_url }

