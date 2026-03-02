package main

import (
	"os"
	"path/filepath"
)

func chromeManifestDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".config", "google-chrome", "NativeMessagingHosts")
}

func firefoxManifestDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".mozilla", "native-messaging-hosts")
}

func binaryInstallDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".local", "share", "tailscale", "browser-ext")
}

// platformUninstall performs Linux-specific uninstall steps.
// On Linux there are no additional steps beyond removing manifest files.
func platformUninstall() error {
	return nil
}

func platformPostInstallChrome(_ string) error  { return nil }
func platformPostInstallFirefox(_ string) error { return nil }
