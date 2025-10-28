variable "environment" { type = string }
variable "service_name" { type = string }
variable "team_slug"    { type = string }
variable "slack_webhook" { type = string; sensitive = true }

