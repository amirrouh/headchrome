package main

import (
	"os"
	"path/filepath"
)

func chromeManifestDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "Library", "Application Support", "Google", "Chrome", "NativeMessagingHosts")
}

func firefoxManifestDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "Library", "Application Support", "Mozilla", "NativeMessagingHosts")
}

func binaryInstallDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "Library", "Application Support", "Tailscale", "BrowserExt")
}

// platformUninstall performs macOS-specific uninstall steps.
// On macOS there are no additional steps beyond removing manifest files.
func platformUninstall() error {
	return nil
}

func platformPostInstallChrome(_ string) error  { return nil }
func platformPostInstallFirefox(_ string) error { return nil }
