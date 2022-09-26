import * as vscode from "vscode";
import { maniTests } from "../../manifest-utils";

class ManiHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Thenable<vscode.Hover | undefined> {
    const lineOfText = document.lineAt(position);

    // search through maniTests for lineOfText.text
    const hoverInfo = maniTests.find((hoverValue) => {
      if (
        lineOfText.text.toLowerCase().includes(hoverValue.member.toLowerCase())
      ) {
        return hoverValue;
      }
    });
    if (!hoverInfo) {
      return new Promise(() => {});
    } else {
      return new Promise((resolve) => {
        resolve(
          new vscode.Hover(
            new vscode.MarkdownString(
              `**PWA Studio**: ${hoverInfo.infoString} [Learn More](${hoverInfo.docsLink})`
            )
          )
        );
      });
    }
  }
}

export function hoversActivate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { language: 'json', pattern: '**/manifest.json' },
      new ManiHoverProvider()
    )
  );
}
