terraform {
  required_version = ">= 1.9.0"
  required_providers {
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.13"
    }
    checkly = {
      source  = "checkly/checkly"
      version = "~> 2.0"
    }
    grafana = {
      source  = "grafana/grafana"
      version = "~> 2.11"
    }
    uptimerobot = {
      source  = "lablabs/uptimerobot"
      version = "~> 0.6"
    }
  }
}

