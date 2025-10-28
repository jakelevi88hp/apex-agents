locals { name = "${var.service_name}-${var.environment}" }

resource "uptimerobot_monitor" "home" {
  friendly_name = "${local.name} home"
  type          = 1 # HTTP(s)
  url           = "${var.base_url}/"
  interval      = 60
}

resource "uptimerobot_monitor" "dashboard" {
  friendly_name = "${local.name} dashboard"
  type          = 1
  url           = "${var.base_url}/dashboard"
  interval      = 300
}

