import AppKit
import WebKit

/// The main view controller that hosts the WKWebView.
///
/// It fills the entire window with a WKWebView that loads the PWA's `start_url`.
/// Navigation policy keeps the user inside the app for allowed origins and
/// opens external links in the system default browser.
class ViewController: NSViewController {

    // MARK: - Properties

    private var webView: WKWebView!
    private var loadingSpinner: NSProgressIndicator!

    // MARK: - View lifecycle

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 1024, height: 768))
        self.view.wantsLayer = true
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        setupLoadingSpinner()
        loadRootUrl()
    }

    // MARK: - Setup

    private func setupWebView() {
        let config = buildWebViewConfiguration()
        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.uiDelegate = self

        // Enable Safari Web Inspector support (macOS 13.3+).
        if #available(macOS 13.3, *) {
            webView.isInspectable = true
        }

        setCustomCookie()
        view.addSubview(webView)
    }

    private func buildWebViewConfiguration() -> WKWebViewConfiguration {
        let config = WKWebViewConfiguration()
        config.limitsNavigationsToAppBoundDomains = true
        config.allowsInlineMediaPlayback = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        return config
    }

    private func setupLoadingSpinner() {
        loadingSpinner = NSProgressIndicator()
        loadingSpinner.style = .spinning
        loadingSpinner.isIndeterminate = true
        loadingSpinner.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(loadingSpinner)

        NSLayoutConstraint.activate([
            loadingSpinner.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            loadingSpinner.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }

    /// Injects a platform identification cookie so the web app can detect it is
    /// running inside a native macOS wrapper.
    private func setCustomCookie() {
        guard let host = rootUrl.host else { return }
        let props: [HTTPCookiePropertyKey: Any] = [
            .domain:  host,
            .path:    "/",
            .name:    platformCookieName,
            .value:   platformCookieValue,
            .secure:  "FALSE",
            .expires: NSDate(timeIntervalSinceNow: 31_556_926)
        ]
        if let cookie = HTTPCookie(properties: props) {
            webView.configuration.websiteDataStore.httpCookieStore.setCookie(cookie)
        }
    }

    // MARK: - Navigation

    func loadRootUrl() {
        webView.load(URLRequest(url: rootUrl))
    }
}

// MARK: - WKNavigationDelegate

extension ViewController: WKNavigationDelegate {

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        loadingSpinner.startAnimation(nil)
        loadingSpinner.isHidden = false
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loadingSpinner.stopAnimation(nil)
        loadingSpinner.isHidden = true
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        loadingSpinner.stopAnimation(nil)
        loadingSpinner.isHidden = true
        showConnectionError(error)
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let requestUrl = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // Allow about: URLs (e.g. about:blank).
        if requestUrl.scheme == "about" {
            decisionHandler(.allow)
            return
        }

        guard let requestHost = requestUrl.host else {
            // Non-HTTP scheme (tel:, mailto:, …) — let macOS handle it.
            NSWorkspace.shared.open(requestUrl)
            decisionHandler(.cancel)
            return
        }

        // Auth origins are allowed inside the web view (OAuth, etc.).
        if authOrigins.first(where: { requestHost.range(of: $0) != nil }) != nil {
            decisionHandler(.allow)
            return
        }

        // Allowed origins stay inside the web view.
        if allowedOrigins.first(where: { requestHost.range(of: $0) != nil }) != nil {
            decisionHandler(.allow)
            return
        }

        // Everything else opens in the default browser.
        NSWorkspace.shared.open(requestUrl)
        decisionHandler(.cancel)
    }

    // MARK: - Error handling

    private func showConnectionError(_ error: Error) {
        guard let window = view.window else { return }
        let alert = NSAlert()
        alert.alertStyle = .warning
        alert.messageText = NSLocalizedString("Connection Error", comment: "")
        alert.informativeText = error.localizedDescription
        alert.addButton(withTitle: NSLocalizedString("Retry", comment: ""))
        alert.addButton(withTitle: NSLocalizedString("Cancel", comment: ""))

        alert.beginSheetModal(for: window) { [weak self] response in
            if response == .alertFirstButtonReturn {
                self?.loadRootUrl()
            }
        }
    }
}

// MARK: - WKUIDelegate

extension ViewController: WKUIDelegate {

    /// Redirect new-tab/window requests back into the same web view (SPA-friendly).
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }

    // MARK: JavaScript dialogs

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert()
        alert.messageText = message
        alert.addButton(withTitle: "OK")
        alert.runModal()
        completionHandler()
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = NSAlert()
        alert.messageText = message
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Cancel")
        completionHandler(alert.runModal() == .alertFirstButtonReturn)
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = NSAlert()
        alert.messageText = prompt
        let textField = NSTextField(frame: NSRect(x: 0, y: 0, width: 240, height: 24))
        textField.stringValue = defaultText ?? ""
        alert.accessoryView = textField
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Cancel")
        if alert.runModal() == .alertFirstButtonReturn {
            completionHandler(textField.stringValue)
        } else {
            completionHandler(nil)
        }
    }
}
