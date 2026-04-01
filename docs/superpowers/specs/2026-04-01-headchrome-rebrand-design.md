# HeadChrome: Rebrand & Headscale Support

> Design spec for converting TailChrome to HeadChrome — a browser extension for self-hosted Headscale.

## Overview

Convert the TailChrome browser extension from Tailscale to Headscale-only. Users configure their own Headscale server URL via a settings panel in the popup. The Go native host passes this URL to `tsnet.Server.ControlURL` to connect to the user's Headscale instance.

## Decisions

- **Headscale-only** — no Tailscale compatibility. Simpler codebase, cleaner branding.
- **Settings in popup** — gear icon opens a settings panel (not a separate options page).
- **Fork & Replace** — rename everything in-place, no abstraction layer.
- **New icon** — distinct color scheme to differentiate from Tailscale.

---

## 1. Branding Changes

| Before | After |
|--------|-------|
| TailChrome | HeadChrome |
| `com.tailscale.browserext.chrome` | `com.headchrome.browserext.chrome` |
| `com.tailscale.browserext.firefox` | `com.headchrome.browserext.firefox` |
| `tailchrome@tesseras.org` | `headchrome@tesseras.org` (or new AMO ID) |
| `~/.config/tailscale-browser-ext/` | `~/.config/headchrome-browser-ext/` |
| "Send page URL to Tailscale device" | "Send page URL to Headscale device" |
| `tailscale-browser-ext` (hostinfo app) | `headchrome-browser-ext` |
| Tailscale blue icon | New purple/teal icon |

All user-facing strings change from "Tailscale" to "Headscale". Internal type names like `TailscaleState` can be renamed or kept for now (lower priority).

## 2. Settings Panel

### Storage

```
chrome.storage.local key: "headscaleServerUrl"
Value: string (e.g., "https://headscale.example.com")
```

### UI: Settings View

Accessible via gear icon in the connected view header. Same sub-view pattern as exit-nodes and profiles views.

Contents:
- Label: "Headscale Server URL"
- Text input, pre-filled with current value
- Save button — validates URL format (must be `https://` with valid hostname)
- Cancel button — returns to previous view

### UI: Needs-Setup View

Shown when no `headscaleServerUrl` exists in storage (first launch).

Contents:
- HeadChrome icon (centered)
- "Welcome to HeadChrome"
- "Enter your Headscale server URL to get started"
- URL text input with placeholder `https://headscale.example.com`
- "Save & Connect" button
- Validation: reject empty, non-https, malformed URLs

After saving, the popup transitions to the normal disconnected/connecting flow.

### View Routing Update

```
viewForState(state):
  if no headscaleServerUrl in storage → "needs-setup"
  if installError → "needs-install"
  if NeedsLogin → "needs-login"
  if Running → "connected"
  else → "disconnected"
```

The `headscaleServerUrl` must be loaded from storage at popup init (already loads custom URLs).

## 3. Native Messaging Protocol Changes

### Init Command Extension

```typescript
// Before
{ cmd: "init", initID: "uuid" }

// After
{ cmd: "init", initID: "uuid", controlURL: "https://headscale.example.com" }
```

### Go Side

`Request` struct gains `ControlURL` field:

```go
type Request struct {
    Cmd        string          `json:"cmd"`
    InitID     string          `json:"initID,omitempty"`
    ControlURL string          `json:"controlURL,omitempty"` // NEW
    // ... rest unchanged
}
```

`handleInit` sets `ControlURL` on the `tsnet.Server`:

```go
h.ts = &tsnet.Server{
    Dir:          stateDir,
    Hostname:     "browser-ext",
    ControlURL:   req.ControlURL, // NEW — points to Headscale
    RunWebClient: true,
    Logf:         log.Printf,
}
```

If `controlURL` is empty, the host sends an init error (it's required for Headscale).

### Background Script

On init, background reads `headscaleServerUrl` from storage and includes it in the `init` command sent to the native host.

## 4. Login URL Validation

Replace hardcoded Tailscale origins:

```typescript
// Before
const ALLOWED_LOGIN_ORIGINS = [
  "https://login.tailscale.com",
  "https://controlplane.tailscale.com",
];

// After — dynamic, based on user's configured URL
function isValidLoginURL(url: string, headscaleUrl: string): boolean {
  try {
    const parsed = new URL(url);
    const allowed = new URL(headscaleUrl);
    return parsed.origin === allowed.origin;
  } catch {
    return false;
  }
}
```

The `headscaleServerUrl` is read from storage and passed through. The native host's `browseToURL` will point to the Headscale instance's auth page, which this validates against.

## 5. Admin & Web Client URLs

| Before | After |
|--------|-------|
| `ADMIN_URL = "https://login.tailscale.com/admin"` | `{headscaleServerUrl}/admin` |
| `open-web-client` → `http://100.100.100.100` | Remove or point to `{headscaleServerUrl}` |

The `ADMIN_URL` constant is removed. Admin URL is computed dynamically from the stored Headscale URL. The `TAILSCALE_SERVICE_IP` constant (`100.100.100.100`) stays — it's the Tailscale/Headscale service IP used for proxy routing and is the same for both.

## 6. New Icons

Generate SVG-based icons in a purple/teal color scheme:
- 16x16, 48x48, 128x128 PNGs (same sizes as current)
- Simple geometric design — distinguishable from Tailscale's logo
- Used in popup header, browser toolbar, and manifest

## 7. Files to Modify

### Extension (TypeScript)

| File | Changes |
|------|---------|
| `packages/shared/src/types.ts` | Add `controlURL` to `NativeRequest` init variant. Add `set-headscale-url` and `get-headscale-url` to `BackgroundMessage`. Add `headscaleUrl` to `TailscaleState` (or separate). |
| `packages/shared/src/constants.ts` | Remove `ADMIN_URL`. Keep `TAILSCALE_SERVICE_IP` (same for Headscale). Rename if desired. |
| `packages/shared/src/background/background.ts` | Read `headscaleServerUrl` from storage on init. Pass `controlURL` in init command. Dynamic login URL validation. Dynamic admin URL. Handle settings messages from popup. |
| `packages/shared/src/popup/popup.ts` | Add "needs-setup" view routing. Load headscale URL from storage at init. |
| `packages/shared/src/popup/views/needs-setup.ts` | **NEW** — First-run setup screen with URL input. |
| `packages/shared/src/popup/views/settings.ts` | **NEW** — Settings panel with URL input, save, cancel. |
| `packages/shared/src/popup/views/connected.ts` | Add gear icon to header. Rename "Tailscale" strings to "Headscale". |
| `packages/shared/src/popup/views/needs-login.ts` | Rename strings. |
| `packages/shared/src/popup/views/needs-install.ts` | Rename strings. |
| `packages/shared/src/popup/views/disconnected.ts` | Rename strings. |
| `packages/shared/src/popup/styles/*.css` | Add styles for settings view and gear icon. |
| `packages/shared/src/background/native-host.ts` | Update native host ID references if needed. |
| `packages/extension/wxt.config.ts` | Update extension name, description. |
| `packages/extension/entrypoints/popup/index.html` | Update title. |
| `packages/extension/public/` | Replace icons. |

### Native Host (Go)

| File | Changes |
|------|---------|
| `host/protocol.go` | Add `ControlURL` field to `Request` struct. |
| `host/host.go` | Use `req.ControlURL` when creating `tsnet.Server`. Require non-empty `controlURL`. Update state dir path. |
| `host/main.go` | Rename hostinfo app name. Rename user-facing strings. |
| `host/install_darwin.go` | Update native host IDs (`com.headchrome.browserext.*`). |
| `host/install_linux.go` | Same. |
| `host/install_windows.go` | Same. |
| `host/ids.go` (or equivalent) | Update extension IDs. |

### Config & Build

| File | Changes |
|------|---------|
| `config/` | Update extension IDs. |
| `package.json` / `pnpm-workspace.yaml` | Rename package names if desired. |
| `README.md` | Update project name and description. |
| `.github/workflows/` | Update references if any. |

## 8. What Stays the Same

- Proxy logic (SOCKS5, PAC scripts, Firefox dynamic proxy) — identical
- `tsnet` library — supports Headscale natively via `ControlURL`
- Per-browser-profile isolation (UUID-based)
- Exit node selection, MagicDNS routing, subnet routing
- Native messaging wire protocol (4-byte LE + JSON)
- Taildrop file sending
- Keepalive/reconnection logic
- Exponential backoff on native host disconnect

## 9. Migration Note

Users of the old TailChrome extension will need to:
1. Uninstall the old native host (`tailchrome-host --uninstall`)
2. Install the new HeadChrome native host
3. Configure their Headscale URL in the extension

This is expected since we're changing native host IDs. No automatic migration.
