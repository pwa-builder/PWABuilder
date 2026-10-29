import WebKit

struct Cookie {
    var name: String
    var value: String
}

let gcmMessageIDKey = "00000000000" // update this with actual ID if using Firebase 

// URL for first launch
let rootUrl = URL(string: "{{PWABuilder.iOS.url}}")!

// allowed origin is for what we are sticking to pwa domain
// This should also appear in Info.plist
let allowedOrigins: [String] = ["{{PWABuilder.iOS.urlHost}}"]

// auth origins will open in modal and show toolbar for back into the main origin.
// These should also appear in Info.plist
let authOrigins: [String] = ["{{PWABuilder.iOS.permittedHosts}}"]
// allowedOrigins + authOrigins <= 10

let platformCookie = Cookie(name: "app-platform", value: "iOS App Store")

// UI options
let displayMode = "{{PWABuilder.iOS.displayMode}}" // standalone / fullscreen.
let adaptiveUIStyle = {{PWABuilder.iOS.adaptiveUIStyle}}     // iOS 15+ only. Change app theme on the fly to dark/light related to WebView background color.
let overrideStatusBar = {{PWABuilder.iOS.overrideStatusBar}}   // iOS 13+. Fix the status bar text style instead of following the system theme.
let statusBarTheme = "{{PWABuilder.iOS.statusBarTheme}}"    // dark / light, related to override option.
let pullToRefresh = true    // Enable/disable pull down to refresh page
