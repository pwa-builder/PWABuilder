import { readFile } from "fs/promises";
import * as vscode from "vscode";
import { handleWebhint } from "../../library/handle-webhint";
import { maniTests } from "../../manifest-utils";

let manifestFileRead: string | undefined;

/** Code that is used to associate diagnostic entries with code actions. */
export const MANI_CODE = "mani_code";

setupFileWatcher();

/**
 * Analyzes the text document for problems.
 */
export function refreshDiagnostics(
  doc: vscode.TextDocument,
  maniDiagnostics: vscode.DiagnosticCollection
): void {
  const diagnostics: vscode.Diagnostic[] = [];

  try {
    const mani = JSON.parse(doc.getText());

    // check for required fields
    maniTests.forEach((testValue) => {
      if (
        Object.keys(mani).includes(testValue.member) === false &&
        testValue.category === "required"
      ) {
        let diagnostic = createDiagnostic(
          doc,
          doc.lineAt(1),
          1,
          testValue.member,
          true,
          vscode.DiagnosticSeverity.Error
        );

        if (diagnostic) {
          diagnostics.push(diagnostic);
        }
      }
      else if (
        Object.keys(mani).includes(testValue.member) === false &&
        testValue.category === "recommended"
      ) {
        let diagnostic = createDiagnostic(
          doc,
          doc.lineAt(1),
          1,
          testValue.member,
          true,
          vscode.DiagnosticSeverity.Warning
        );

        if (diagnostic) {
          diagnostics.push(diagnostic);
        }
      }
    });

    // diagnostics for manifest.json
    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
      const lineOfText = doc.lineAt(lineIndex);

      maniTests.forEach((testValue) => {
        if (lineOfText.text.includes(testValue.member)) {
          let diagnostic = createDiagnostic(
            doc,
            lineOfText,
            lineIndex,
            testValue.member,
            false,
            vscode.DiagnosticSeverity.Error
          );
          if (diagnostic) {
            diagnostics.push(diagnostic);
          }
        }
      });
    }

    maniDiagnostics.set(doc.uri, diagnostics);
  }
  catch (err) {
    // the manifest.json file is most likely empty
    return;
  }
}

function createDiagnostic(
  doc: vscode.TextDocument,
  lineOfText: vscode.TextLine,
  lineIndex: number,
  testString: string,
  globalManifestProblem: boolean,
  severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Error
): vscode.Diagnostic | undefined {
  // if globalManifestProblem === true, we dont need to find a range, we just want to return a diagnostic
  if (globalManifestProblem === true) {
    const diagnostic = new vscode.Diagnostic(
      // range for the first line of the document
      new vscode.Range(0, 0, 2, 0),
      `Your Web Manifest is missing the ${testString} field`,
      severity
    );
    diagnostic.code = "global";
    diagnostic.source = testString;
    return diagnostic;
  }

  // find where in the line of text the value is mentioned
  const index = lineOfText.text.indexOf(testString);

  // create range that represents where in the document the word is
  const range = new vscode.Range(
    lineIndex,
    index,
    lineIndex,
    index + testString.length
  );

  // test
  let testResult = undefined;
  let test: any = undefined;
  let textToTest: any = undefined;
  maniTests.forEach((testValue) => {
    if (testValue.member === testString && testValue.test) {
      try {
        textToTest = JSON.parse(doc.getText());

        testResult = testValue.test(textToTest[testString]);
        test = testValue;
      } catch (err) {
        console.error("Could not parse JSON value", err);
      }
    }
  });

  // secondary tests
  if (testResult !== undefined && typeof testResult !== "boolean") {
    const diagnostic = new vscode.Diagnostic(
      range,
      `PWA Studio - ${testString}: ${test ? test.errorString : "Error"}`,
      severity
    );

    diagnostic.code = test.member;
    diagnostic.source = testResult;

    return diagnostic;
  } else if (testResult === false) {
    const diagnostic = new vscode.Diagnostic(
      range,
      `PWA Studio - ${testString}: ${test ? test.errorString : "Error"}`,
      severity
    );

    diagnostic.code = test.member;
    return diagnostic;
  }

  return undefined;
}

export function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  maniDiagnostics: vscode.DiagnosticCollection
): void {
  if (vscode.window.activeTextEditor) {
    if (
      vscode.window.activeTextEditor.document.fileName.includes(
        "manifest.json"
      ) ||
      vscode.window.activeTextEditor.document.fileName.includes(
        "manifest.webmanifest"
      )
    ) {
      refreshDiagnostics(
        vscode.window.activeTextEditor.document,
        maniDiagnostics
      );
    }
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.fileName.includes("manifest.json")) {
        refreshDiagnostics(editor.document, maniDiagnostics);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.fileName.includes("manifest.json")) {
        refreshDiagnostics(e.document, maniDiagnostics);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) =>
      maniDiagnostics.delete(doc.uri)
    )
  );
}

export async function handleValidation(
  context: vscode.ExtensionContext
): Promise<void> {
  vscode.window.showInformationMessage(
    "Lets validate your PWA and make sure its installable and Store Ready"
  );

  const answer = await vscode.window.showInformationMessage(
    "First, let's check your Web Manifest",
    {
      modal: true,
    },
    "OK"
  );

  if (!answer || answer !== "OK") {
    return;
  }

  // ask the user if they have a service worker with quickPick
  const maniQuestion = await vscode.window.showQuickPick(
    [
      {
        label: "Yes",
        description: "I have a Web Manifest",
      },
      {
        label: "No",
        description: "I don't have a Web Manifest",
      },
    ],
    {
      placeHolder: "Do you have a Web Manifest?",
      ignoreFocusOut: true,
      canPickMany: false,
    }
  );

  if (maniQuestion && maniQuestion.label === "Yes") {
    const manifestFile = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      title: "Select your Web Manifest file",
      filters: {
        JSON: ["json"],
      },
    });

    if (manifestFile) {
      manifestFileRead = await readFile(manifestFile[0].fsPath, "utf8");
      const results = await testManifest(manifestFile);
      if (results) {
        await gatherResults(results, manifestFile, context);
      }
    } else {
      await vscode.window.showErrorMessage("Please select a Web Manifest");
      return;
    }
  } else if (maniQuestion && maniQuestion.label === "No") {
    await vscode.commands.executeCommand("pwa-studio.manifest");
    return;
  }

  const swAnswer = await vscode.window.showInformationMessage(
    "Next, let's evaluate your Service Worker",
    {
      modal: true,
    },
    "OK"
  );

  if (!swAnswer || swAnswer !== "OK") {
    return;
  }

  // ask the user if they have a service worker with quickPick
  const swQuestion = await vscode.window.showQuickPick(
    [
      {
        label: "Yes",
        description: "I have a Service Worker",
      },
      {
        label: "No",
        description: "I don't have a Service Worker",
      },
    ],
    {
      placeHolder: "Do you have a Service Worker?",
      ignoreFocusOut: true,
      canPickMany: false,
    }
  );

  if (swQuestion && swQuestion.label === "Yes") {
    const swFile = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      title: "Select your Service Worker file",
      filters: {
        JavaScript: ["js"],
        TypeScript: ["ts"],
      },
    });

    if (swFile) {
      await vscode.window.showInformationMessage(
        "Awesome! Your PWA is installable and store ready!"
      );
    } else {
      vscode.window.showErrorMessage("Please select a Service Worker");
    }
  } else if (swQuestion && swQuestion.label === "No") {
    // execute a command to create a service worker
    await vscode.commands.executeCommand("pwa-studio.serviceWorker");
    return;
  }

  const runWebhintQuestion = await vscode.window.showQuickPick(
    [
      {
        label: "Yes",
        description: "I want to run Webhint",
      },
      {
        label: "No",
        description: "I don't want to run Webhint",
      },
    ],
    {
      placeHolder: "Run extra tests on your PWA using Webhint?",
      ignoreFocusOut: true,
      canPickMany: false,
    }
  );

  if (runWebhintQuestion && runWebhintQuestion.label === "Yes") {
    await handleWebhint();

    return;
  }
}

function setupFileWatcher(): void {
  const watcher = vscode.workspace.createFileSystemWatcher("**/manifest.json");

  watcher.onDidChange(async (manifestFile) => {
    manifestFileRead = await readFile(manifestFile.fsPath, "utf8");
    await testManifest(manifestFileRead);
    await vscode.commands.executeCommand("pwa-studio.refreshEntry");
  });

  watcher.onDidDelete(async (manifestFile) => {
    await vscode.commands.executeCommand("pwa-studio.refreshEntry");
  });
}

async function gatherResults(
  results: Array<any>,
  manifestFile: vscode.Uri[],
  context: vscode.ExtensionContext
): Promise<void> {
  const problems = results.filter(
    (r) => r.result === false && r.category === "required"
  );

  if (problems.length > 0) {
    const maniAnswer = await vscode.window.showInformationMessage(
      "Your Web Manifest is missing some required fields, should we add them?",
      {
        modal: true,
      },
      "OK"
    );

    if (!maniAnswer || maniAnswer !== "OK") {
      return;
    }

    // open manifestFile
    const editor = await vscode.window.showTextDocument(
      vscode.Uri.file(manifestFile[0].fsPath)
    );
    // open problems
    problems.forEach(async (problem) => {
      const end = editor.document.positionAt(
        editor.document.getText().lastIndexOf("}") - 1
      );

      await editor.insertSnippet(
        new vscode.SnippetString(
          `,"${problem.member}": "${problem.defaultValue}"`
        ),
        end
      );
    });

    if (manifestFileRead) {
      // check for a 512x512 icon in manifestFile
      const fiveTwelveCheck = JSON.parse(manifestFileRead).icons.forEach(
        (icon: any) => {
          if (icon.sizes === "512x512") {
            return icon;
          }
        }
      );

      if (!fiveTwelveCheck) {
        const iconAnswer = await vscode.window.showInformationMessage(
          "You are missing a 512x512 sized icon, lets generate one",
          {
            modal: true,
          },
          "OK"
        );

        if (iconAnswer && iconAnswer === "OK") {
          vscode.commands.executeCommand("pwa-studio.generateIcon");

          return;
        }
      }
    }
  } else {
    await vscode.window.showInformationMessage(
      "Your Web Manifest looks great!",
      {
        modal: true,
      },
      "OK"
    );
  }
}

export async function testManifest(manifestFile: any): Promise<any[] | undefined> {
  try {
    const manifest = JSON.parse(manifestFile);
    return [
      {
        infoString: "Lists icons for add to home screen",
        result: manifest.icons && manifest.icons.length > 0 ? true : false,
        category: "required",
        member: "icons",
        defaultValue: [],
        docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/icons",
      },
      {
        infoString: "Contains name property",
        result: manifest.name && manifest.name.length > 1 ? true : false,
        category: "required",
        member: "name",
        defaultValue: "placeholder name",
        docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/name",
      },
      {
        infoString: "Contains short_name property",
        result:
          manifest.short_name && manifest.short_name.length > 1 ? true : false,
        category: "required",
        member: "short_name",
        defaultValue: "placeholder",
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/short_name",
      },
      {
        infoString: "Designates a start_url",
        result:
          manifest.start_url && manifest.start_url.length > 0 ? true : false,
        category: "required",
        member: "start_url",
        defaultValue: "/",
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url",
      },
      {
        infoString: "Specifies a display mode",
        result:
          manifest.display &&
            ["fullscreen", "standalone", "minimal-ui", "browser"].includes(
              manifest.display
            )
            ? true
            : false,
        category: "recommended",
        member: "display",
        defaultValue: "standalone",
        docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/display",
      },
      {
        infoString: "Has a background color",
        result: manifest.background_color ? true : false,
        category: "recommended",
        member: "background_color",
        defaultValue: "black",
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color",
      },
      {
        infoString: "Has a theme color",
        result: manifest.theme_color ? true : false,
        category: "recommended",
        member: "theme_color",
        defaultValue: "black",
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color",
      },
      {
        infoString: "Specifies an orientation mode",
        result:
          manifest.orientation && isStandardOrientation(manifest.orientation)
            ? true
            : false,
        category: "recommended",
        member: "orientation",
        defaultValue: "any",
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation",
      },
      {
        infoString: "Contains screenshots for app store listings",
        result:
          manifest.screenshots && manifest.screenshots.length > 0 ? true : false,
        category: "recommended",
        member: "screenshots",
        defaultValue: [],
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots",
      },
      {
        infoString: "Lists shortcuts for quick access",
        result:
          manifest.shortcuts && manifest.shortcuts.length > 0 ? true : false,
        category: "recommended",
        member: "shortcuts",
        defaultValue: [],
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts",
      },
      {
        infoString: "Icons specify their type",
        result: !!manifest.icons && manifest.icons.every((i: any) => !!i.type),
        category: "recommended",
        docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/icons",
      },
      {
        infoString: "Icons specify their size",
        result: !!manifest.icons && manifest.icons.every((i: any) => !!i.sizes),
        category: "recommended",
        docsLink: "https://developer.mozilla.org/en-US/docs/Web/Manifest/icons",
      },
      {
        infoString: "Contains an IARC ID",
        result: manifest.iarc_rating_id ? true : false,
        category: "optional",
        member: "iarc_rating_id",
        defaultValue: "",
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/iarc_rating_id",
      },
      {
        infoString: "Specifies related_applications",
        result:
          manifest.related_applications &&
            manifest.related_applications.length > 0
            ? true
            : false,
        category: "optional",
        member: "related_applications",
        defaultValue: [],
        docsLink:
          "https://developer.mozilla.org/en-US/docs/Web/Manifest/related_applications",
      },
    ];
  }
  catch (err) {
    return undefined;
  }
}

function containsStandardCategory(categories: string[]): boolean {
  // https://github.com/w3c/manifest/wiki/Categories
  const standardCategories = [
    "books",
    "business",
    "education",
    "entertainment",
    "finance",
    "fitness",
    "food",
    "games",
    "government",
    "health",
    "kids",
    "lifestyle",
    "magazines",
    "medical",
    "music",
    "navigation",
    "news",
    "personalization",
    "photo",
    "politics",
    "productivity",
    "security",
    "shopping",
    "social",
    "sports",
    "travel",
    "utilities",
    "weather",
  ];
  return categories.some((c) => standardCategories.includes(c));
}

export function isStandardOrientation(orientation: string): boolean {
  const standardOrientations = [
    "any",
    "natural",
    "landscape",
    "landscape-primary",
    "landscape-secondary",
    "portrait",
    "portrait-primary",
    "portrait-secondary",
  ];
  return standardOrientations.includes(orientation);
}

export async function handleManiDocsCommand(event: any): Promise<void> {
  // open docs link
  if (event.label === "Installable" || event.label === "Uninstallable") {
    vscode.env.openExternal(
      vscode.Uri.parse(
        "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs"
      )
    );
  }

  if (event && event.docsLink && event.docsLink.length > 0) {
    vscode.env.openExternal(event.docsLink);
  }
}
