import AppKit

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    var window: NSWindow?

    // MARK: - NSApplicationDelegate

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        createMainWindow()
    }

    /// Quit the application when the last window is closed.
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    // MARK: - Window creation

    private func createMainWindow() {
        let contentRect = NSRect(x: 0, y: 0, width: 1024, height: 768)
        let styleMask: NSWindow.StyleMask = [
            .titled,
            .closable,
            .miniaturizable,
            .resizable,
            .fullSizeContentView
        ]

        let window = NSWindow(
            contentRect: contentRect,
            styleMask: styleMask,
            backing: .buffered,
            defer: false
        )

        window.title = appName
        window.setFrameAutosaveName("MainWindow")
        window.minSize = NSSize(width: 640, height: 480)

        // Apply the manifest theme color to the title bar area.
        applyThemeColor(to: window)

        let viewController = ViewController()
        window.contentViewController = viewController

        window.center()
        window.makeKeyAndOrderFront(nil)
        self.window = window
    }

    /// Tints the window background with the PWA's theme color so the title bar
    /// blends seamlessly with the web content.
    private func applyThemeColor(to window: NSWindow) {
        guard let color = NSColor(hexString: themeColor) else { return }
        window.backgroundColor = color
        // Keep the standard title bar chrome but let the color show through.
        window.titlebarAppearsTransparent = false
    }
}

// MARK: - NSColor hex helper

extension NSColor {
    /// Creates an NSColor from a CSS-style hex string such as "#FF5733" or "FF5733".
    convenience init?(hexString: String) {
        var hex = hexString.trimmingCharacters(in: .whitespacesAndNewlines)
        if hex.hasPrefix("#") { hex = String(hex.dropFirst()) }
        guard hex.count == 6, let rgb = UInt32(hex, radix: 16) else { return nil }
        let r = CGFloat((rgb >> 16) & 0xFF) / 255.0
        let g = CGFloat((rgb >>  8) & 0xFF) / 255.0
        let b = CGFloat( rgb        & 0xFF) / 255.0
        self.init(srgbRed: r, green: g, blue: b, alpha: 1.0)
    }
}
