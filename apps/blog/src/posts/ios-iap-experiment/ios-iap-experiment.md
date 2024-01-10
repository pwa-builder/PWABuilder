---
layout: post
title: You Won’t Believe How We Enabled In-App Purchases for PWAs on iOS
excerpt: This post guides us through the journey of how we wrangled Swift to integrate in-app purchases in iOS PWAs.
description: A step-by-step account of integrating in-app purchases in iOS PWAs despite the restrictions.
date: 2023-11-07
updatedDate: 2023-11-03
trending: true
featured: true
image: posts/ios-iap-experiment/pic-1-min.jpg
isPost: true
backUrl: '/'
author:
  name: Gleb Khmyznikov
  twitter: khmyznikov
  title: Software Engineer
  tagline: Serbia based Web Developer who loves nature
  image: /placeholder-person.png
tags:
  - post
  - PWA
  - iOS
  - Swift
  - in-app purchases
  - ChatGPT
---

<figure>
  <video preload="none" controls poster="/posts/ios-iap-experiment/pic-1-min.jpg">
    <source src="/posts/ios-iap-experiment/video.webm" type="video/webm">
  </video>
  <figcaption>Buying Apple Subscription from the Store PWA</figcaption>
</figure>

[Progressive Web Applications](https://docs.pwabuilder.com/#/home/pwa-intro) on iOS typically have restricted access to Apple's exclusive APIs compared to native apps. These limitations extend to user reachability, purchases, and authentication features. Even after the introduction of the Web Push API to [Safari's PWA](https://www.macrumors.com/how-to/use-web-apps-iphone-ipad/), there continues to be a limitation in access for [Store PWAs](https://docs.pwabuilder.com/#/builder/app-store?id=publishing-pwas-to-the-app-store). This restriction also applies to In-App Purchases (which is the opposite for [Android](https://chromeos.dev/en/publish/pwa-play-billing) and [Windows](https://blogs.windows.com/msedgedev/2023/05/23/microsoft-edge-build-2023-innovations-in-ai-productivity-management-sidebar-apps/#digitalgoods:~:text=Digital%20goods%20API%20support%20for%20in%2Dapp%20purchases%20is%20coming%20to%20Microsoft%20Edge%20Progressive%20Web%20Apps%20(PWAs)%20published%20on%20Microsoft%20Store))

![Lack of Web APIs in Store PWA (WKWebView)](/posts/ios-iap-experiment/pic-2-min.jpg)

For those new to PWABuilder, let me give a quick primer. The PWABuilder service can package Progressive Web Apps for various platforms, including the Apple App Store. It achieves this by automatically generating a Swift project-wrapper, allowing PWA developers to target the App Store without having to touch native iOS code. However, this approach has certain limitations. Notably, it does not natively support the integration of In-App Purchases.

This gap in functionality comes with extra coding and configurations, which can be quite a challenge especially for those of you who, like me, are PWA developers with limited Swift experience. But with challenges come opportunities, and this is where it gets interesting. Let's see how we can enable in-app purchases in our PWA.

![Iterating the code for new IAP module via ChatGPT Playground](/posts/ios-iap-experiment/pic-3-min.jpg)

After active iterations with ChatGPT and reading related to Store Kit articles [[Mastering Store Kit](https://swiftwithmajid.com/2023/08/01/mastering-storekit2/), [In-App Purchase with StoreKit2](https://santoshbotre01.medium.com/in-app-purchase-with-storekit-2-using-xcode-locally-without-appstore-connect-account-391b01cfbeda), [Shotty Birds Repository](https://github.com/4Stryngs/shotty-bird-ios/blob/master/Shotty%20Bird%20Shared/In-App%20Puchases/StoreManager.swift), [Documentation](https://developer.apple.com/documentation/storekit/in-app_purchase/implementing_a_store_in_your_app_using_the_storekit_api)], we eventually made headway.

We defined and set up the correct webkit message handlers and functions in Swift with each one assigned a specific task - be it kicking off a purchase, retrieving info on products, or requesting transactions.

```swift
// Fetch products list by id's from WebView
func fetchProducts(productIDs: [String] = StoreKitAPI.IntentsProducts) async {
  do {
    self.products = try await Product.products(for: productIDs)
    
    // Convert each product representation (Data) to JSON String
    let productJSONStrings: [String] = self.products.compactMap { product in
      guard let jsonString = String(data: product.jsonRepresentation, encoding: .utf8) else {
        return nil
      }
      return jsonString
    }
    
    self.productsJson = "[\(productJSONStrings.joined(separator: ","))]"
    returnProductsResult(jsonString: self.productsJson)
  } catch {
    self.products = []
    // handle error
  }
}

// push results to webview
func returnProductsResult(jsonString: String){
  DispatchQueue.main.async(execute: {
    PWAShell.webView.evaluateJavaScript("this.dispatchEvent(new CustomEvent('iap-products-result', { detail: '\(jsonString)' }))")
  })
}
```

Following the [Swift implementation](https://github.com/khmyznikov/ios-pwa-wrap/tree/iap), the next step was to configure the front end of the [demo PWA](https://github.com/khmyznikov/ios-pwa-shell) to handle these new events. We set up JavaScript event listeners to respond to messages from the Swift class, thus creating a smooth relay between Swift and JavaScript.

```javascript
productsRequest() {
  if (this.iOSIAPCapability)
    window.webkit.messageHandlers['iap-products-request'].postMessage([
      'demo_product_id', 
      'demo_product2_id',
      'demo_subscription',
      'demo_subscription_auto'
    ]);
}

window.addEventListener('iap-products-result', (event: CustomEvent) => {
  if (event && event.detail) {
    this.logMessage(event.detail, true);
    this.products = JSON.parse(event.detail);
  }
});

```

![Products and Transactions passed to PWA from Store Kit 2](/posts/ios-iap-experiment/pic-4-min.jpg)

The output until now is promising. We've managed to make a prototype that starts and manages In-App purchase processes within Store PWAs on Apple devices. However, we've only just started.

For you to follow along:
1. MacOS with a fresh Xcode is required for this project (sadly)
2. Use [this repository](https://github.com/khmyznikov/ios-pwa-wrap/tree/iap) with "iap" branch as your base. It’s pre-configured as a demo of IAP.
3. Follow [readme instructions](https://github.com/khmyznikov/ios-pwa-wrap/tree/iap#readme) about the CocoaPods installation, but skip the firebase setup section
4. Also check [this instruction](https://docs.pwabuilder.com/#/builder/app-store?id=building-your-app) about the building and publishing xcode project.
5. Check the [documentation](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode/) about StoreKit testing, and update [StoreKit test file](https://github.com/khmyznikov/ios-pwa-wrap/blob/iap/pwaShellStore.storekit) for your needs
6. Native logic is in [IAP.swift file](https://github.com/khmyznikov/ios-pwa-wrap/blob/iap/pwa-shell/IAP.swift)
7. The source code for web demo component of [you can find here](https://github.com/khmyznikov/ios-pwa-shell/blob/main/src/components/in-app-purchase.ts)
8. Feel free to create [issue here](https://github.com/khmyznikov/ios-pwa-wrap/issues) or reach us in [Discord](https://aka.ms/pwabuilderdiscord) for any questions 

Your feedback is greatly valued. With this feature's success, it will bring us substantial leap forward, not only enhancing the Store PWA experience but also advancing the PWA community as a whole.