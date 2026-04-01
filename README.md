<p align="center">
  <img src="logo.png" alt="HeadChrome logo" width="120">
</p>

<h1 align="center">HeadChrome</h1>

<p align="center">
  Access your self-hosted <a href="https://github.com/juanfont/headscale">Headscale</a> network directly from your browser. No system VPN required.
</p>

HeadChrome runs a dedicated node per browser profile, without touching system networking. Network traffic is routed through a local SOCKS5/HTTP proxy, so it works alongside (or without) a system-level Headscale client.

## Features

- **Chrome and Firefox** — works in both browsers with full feature parity
- **Self-hosted** — connects to your own Headscale server, configured via the extension settings
- **Per-profile isolation** — each browser profile gets its own independent node and identity
- **Exit nodes** — route all browser traffic through any exit node on your network
- **MagicDNS** — access devices by name, not IP
- **Subnet routing** — reach resources behind subnet routers
- **Taildrop** — send files to other devices on your network
- **Profiles** — create and switch between multiple identities

## Quick Start

1. Download the latest release from [GitHub Releases](https://github.com/amirrouh/headchrome/releases/latest)
2. Install the extension:
   - **Chrome:** Go to `chrome://extensions`, enable Developer Mode, load the unpacked extension
   - **Firefox:** Go to `about:debugging#/runtime/this-firefox`, load as temporary addon
3. Click the extension icon — you'll be prompted to enter your Headscale server URL (e.g. `https://headscale.example.com`)
4. Download and run the native host helper when prompted
5. Log in to your Headscale account

## How It Works

The extension has two parts:

- A **browser extension** (Manifest V3, Chrome and Firefox) that manages proxy configuration and provides the popup UI
- A **native host** (Go) that runs the actual node and exposes a local proxy

They communicate over the browser's native messaging protocol. Your Headscale server URL is stored locally in the browser and passed to the native host on startup.

## Development

### Requirements

- Go 1.21+
- Node.js / pnpm
- Desktop Chrome or Firefox for manual extension testing

### Project Structure

```
packages/extension/   # WXT app for Chrome and Firefox packaging
packages/shared/      # Shared code (types, state management, popup logic)
host/                 # Native messaging host (Go)
```

### Build

```bash
pnpm install
pnpm build:chrome      # Chrome extension build
pnpm build:firefox     # Firefox extension build
pnpm zip:chrome        # chrome.zip
pnpm zip:firefox       # firefox.zip + firefox-sources.zip
make host              # native host for the current platform
make host-all          # release host binaries for all supported targets
```

The extension outputs land in `packages/extension/.output/`. The native host binaries land in `dist/`.

### Install for Development

1. `pnpm install --frozen-lockfile`
2. Build: `pnpm build:chrome` and `make host`
3. **Chrome:** Load `packages/extension/.output/chrome-mv3/` as an unpacked extension
4. **Firefox:** Load `packages/extension/.output/firefox-mv3/manifest.json` as a temporary addon
5. Run the native host binary directly — it auto-installs for detected browsers

### Tests

```bash
pnpm test         # run all tests
pnpm typecheck    # TypeScript type checking
```

## Contributing

Bug reports and feature requests are welcome. Please open an issue first before submitting a PR so we can discuss the approach.

## Contributors

- [@amirrouh](https://github.com/amirrouh)

## Credits

Forked from [dantraynor/tailchrome](https://github.com/dantraynor/tailchrome), adapted for Headscale.

## License

MIT
