# Control Plane Ops Kit Add-on

## Purpose
Diff-driven OpenClaw gateway monitoring so operators see only meaningful state changes.

## Contents
- Snapshot script: `~/bin/openclaw_ops_snapshot.sh`
- Systemd units: `openclaw-ops-snapshot.service` + `.timer`
- Artifact layout: `~/openclaw-ops/snapshots/*.json|.md`, alerts, and state files
- Alert path: journald `ALERT` line + `~/openclaw-ops/alerts/*`

## Install (operator workstation)
1. Copy `openclaw_ops_snapshot.sh` into `~/bin/` (ensure executable).
2. Drop the systemd unit + timer into `~/.config/systemd/user/`.
3. `systemctl --user daemon-reload`
4. `systemctl --user enable --now openclaw-ops-snapshot.timer`
5. `systemctl --user start openclaw-ops-snapshot.service` (force initial snapshot).

## Operating Notes
- Timer runs every 5m; Persistent=true survives reboots.
- State diffs ignore timestamps, so noise-free snapshots.
- Unhealthy states auto-write alert artifacts and log to journald.
- Retention pruning keeps ~48h of change-driven snapshots.

## Extending
- Feed `~/openclaw-ops/current.json` into dashboards or Slack bots.
- Ship alert Markdown via email/Resend for on-call.
- Pair with `docs/overview.md` First Ten Minutes to show full control-plane story during demos.
