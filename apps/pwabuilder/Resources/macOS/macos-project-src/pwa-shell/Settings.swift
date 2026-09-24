import Foundation

// App configuration — these values are injected by PWABuilder during package generation.

/// The display name of the app.
let appName = "{{PWABuilder.macOS.appName}}"

/// The start URL loaded by the WKWebView on launch.
let rootUrl = URL(string: "{{PWABuilder.macOS.url}}")!

/// The theme color used as the window background / title bar tint.
let themeColor = "{{PWABuilder.macOS.themeColor}}"

/// The background color shown during loading.
let backgroundColor = "{{PWABuilder.macOS.backgroundColor}}"

/// Hosts that the app is allowed to navigate within the WKWebView.
/// Navigation to any other host opens in the system default browser.
let allowedOrigins: [String] = ["{{PWABuilder.macOS.urlHost}}"]

/// Auth/third-party hosts that are permitted inside the WKWebView
/// (e.g. OAuth flows). Navigation to these is allowed without opening a browser.
let authOrigins: [String] = ["{{PWABuilder.macOS.permittedHosts}}"]

/// Cookie that identifies the hosting platform to the web app.
let platformCookieName = "app-platform"
let platformCookieValue = "macOS App"
