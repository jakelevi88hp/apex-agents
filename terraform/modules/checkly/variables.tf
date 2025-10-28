variable "environment" { type = string }
variable "service_name" { type = string }
variable "base_url"     { type = string }
variable "api_auth"     { type = string; sensitive = true }
variable "slack_webhook" { type = string; sensitive = true }

