import * as vscode from "vscode";
import { maniTests } from "../../manifest-utils";

class ManiCodeActionsProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    return new Promise(async (resolve) => {
      if (context.diagnostics && context.diagnostics.length > 0) {
        // find the default value for the diagnostic
        const diagnostic = context.diagnostics[0];

        // check for a global problem before continuing
        if (diagnostic.code === "global") {
          for (const value of maniTests) {
            if (
              value.member === diagnostic.source &&
              value.quickFix === true &&
              (value.category === "required" || value.category === "recommended")
            ) {
              const fix = new vscode.CodeAction(
                `Manifest missing a ${value.category} member`,
                vscode.CodeActionKind.QuickFix
              );
              fix.diagnostics = [diagnostic];
              fix.edit = new vscode.WorkspaceEdit();

              if (value.defaultValue) {
                // special case around quotes for icons and screenshots
                // and quotes for other members
                // to-do: Maybe add a "type" field to the manifest vaildations? 
                if (value.member === "icons" || value.member === "screenshots" || value.member === "shortcuts") {
                  fix.edit.insert(
                    document.uri,
                    new vscode.Position(1, 0),
                    `"${diagnostic.source}": ${value.defaultValue}, \n`
                  );
                }
                else {
                  fix.edit.insert(
                    document.uri,
                    new vscode.Position(1, 0),
                    `"${diagnostic.source}": "${value.defaultValue}", \n`
                  );
                }
              }
              else {
                fix.edit.insert(
                    document.uri,
                    new vscode.Position(1, 0),
                    `"${diagnostic.source}": "", \n`
                  );
              }

              resolve([fix]);
            }
          }
        }

        for (const value of maniTests) {
          if (diagnostic.code === value.member && value.quickFix === true) {
            // set up quick fix
            const fix = new vscode.CodeAction(
              `${diagnostic.code}`,
              vscode.CodeActionKind.QuickFix
            );
            fix.diagnostics = [diagnostic];
            fix.edit = new vscode.WorkspaceEdit();

            // figure out range of affected member
            for (
              let lineIndex = 0;
              lineIndex < document.lineCount;
              lineIndex++
            ) {
              const lineOfText = document.lineAt(lineIndex);
              if (lineOfText.text.includes(value.member)) {
                // find range after the member + :
                const start = lineOfText.text.indexOf(":") + 1;
                const end = lineOfText.text.length;
                const range = new vscode.Range(
                  lineIndex,
                  start,
                  lineIndex,
                  end
                );

                // handle special cases
                if (
                  value.member === "icons" ||
                  value.member === "screenshots"
                ) {
                  fix.edit.replace(
                    document.uri,
                    range,
                    `${value.defaultValue},`
                  );
                }
                // handle secondary tests
                // such as whitespace tests
                else if (diagnostic.source) {
                  fix.edit.replace(
                    document.uri,
                    range,
                    ` "${diagnostic.source}",`
                  );
                } else {
                  // add the edit to the fix with appropriate text and range
                  fix.edit.replace(
                    document.uri,
                    range,
                    ` "${value.defaultValue}",`
                  );
                }
              }
            }

            resolve([fix]);
          }
        }
      }

      resolve([]);
    });
  }
}

export function codeActionsActivate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { language: 'json', pattern: '**/manifest.json' },
      new ManiCodeActionsProvider()
    )
  );
}
