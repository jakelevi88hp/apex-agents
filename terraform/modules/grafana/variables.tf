variable "environment" { type = string }
variable "service_name" { type = string }
variable "slack_webhook" { type = string; sensitive = true }
variable "dashboard_json" { type = string }

