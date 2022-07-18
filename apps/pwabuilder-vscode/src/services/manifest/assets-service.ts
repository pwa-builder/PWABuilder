import * as vscode from 'vscode';
const pwaAssetGenerator = require('pwa-asset-generator');

export async function generateScreenshots() {
    // ask user for icon file
    const iconFile = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        filters: {
            'Images': ['png']
        }
    });

    // ask user for output directory
    const outputDir = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: 'Select output directory',
    });

    const { savedImages, htmlMeta, manifestJsonContent } = await pwaAssetGenerator.generateImages(
        iconFile ? iconFile[0].fsPath : null,
        outputDir ? outputDir[0].fsPath : null,
        {
          scrape: false,
          background: "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
          splashOnly: true,
          portraitOnly: true,
          log: false
        });

    console.log(savedImages, htmlMeta, manifestJsonContent);
}