import UIKit
import WebKit

func printView(webView: WKWebView){
    let printController = UIPrintInteractionController.shared

    let printInfo = UIPrintInfo(dictionary:nil)
    printInfo.outputType = UIPrintInfo.OutputType.general
    printInfo.jobName = (webView.url?.absoluteString)!
    printInfo.duplex = UIPrintInfo.Duplex.none
    printInfo.orientation = UIPrintInfo.Orientation.portrait

    printController.printPageRenderer = UIPrintPageRenderer()
          
    printController.printPageRenderer?.addPrintFormatter(webView.viewPrintFormatter(), startingAtPageAt: 0)

    printController.printInfo = printInfo
    printController.showsNumberOfCopies = true
    printController.present(animated: true)
}
