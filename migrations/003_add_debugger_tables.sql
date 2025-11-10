-- Debugger and Monitor Database Schema

CREATE TABLE IF NOT EXISTS debugger_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  level VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB,
  user_id UUID,
  endpoint VARCHAR(255),
  resolved BOOLEAN DEFAULT FALSE,
  fix_applied TEXT,
  fix_timestamp TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debugger_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES debugger_error_logs(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP,
  acknowledged_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS debugger_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  response_time INTEGER,
  error_message TEXT,
  metrics JSONB,
  checked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debugger_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  response_time INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debugger_auto_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES debugger_error_logs(id) ON DELETE CASCADE,
  fix_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  code_changes TEXT,
  file_path VARCHAR(500),
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP,
  success BOOLEAN,
  rollback_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS debugger_error_logs_timestamp_idx ON debugger_error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS debugger_error_logs_category_idx ON debugger_error_logs(category);
CREATE INDEX IF NOT EXISTS debugger_error_logs_level_idx ON debugger_error_logs(level);
CREATE INDEX IF NOT EXISTS debugger_error_logs_resolved_idx ON debugger_error_logs(resolved);
CREATE INDEX IF NOT EXISTS debugger_error_logs_user_id_idx ON debugger_error_logs(user_id);
CREATE INDEX IF NOT EXISTS debugger_error_logs_endpoint_idx ON debugger_error_logs(endpoint);

CREATE INDEX IF NOT EXISTS debugger_alerts_created_at_idx ON debugger_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS debugger_alerts_acknowledged_idx ON debugger_alerts(acknowledged);

CREATE INDEX IF NOT EXISTS debugger_health_checks_component_idx ON debugger_health_checks(component);
CREATE INDEX IF NOT EXISTS debugger_health_checks_checked_at_idx ON debugger_health_checks(checked_at DESC);

CREATE INDEX IF NOT EXISTS debugger_performance_metrics_endpoint_idx ON debugger_performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS debugger_performance_metrics_timestamp_idx ON debugger_performance_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS debugger_auto_fixes_error_id_idx ON debugger_auto_fixes(error_id);
CREATE INDEX IF NOT EXISTS debugger_auto_fixes_applied_idx ON debugger_auto_fixes(applied);
