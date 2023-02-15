// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { setUpLocalPwaStarterRepository } from "./services/new-pwa-starter";
import { 
  generateServiceWorker,
  chooseServiceWorker,
} from "./services/service-workers/simple-service-worker";
import { handleSW } from "./services/service-workers/service-worker";
import {
  chooseManifest,
  generateManifest,
} from "./services/manifest/manifest-service";
import { packageApp } from "./services/package/package-app";
import {
  MANI_CODE,
  handleManiDocsCommand,
  handleValidation,
  subscribeToDocumentChanges,
} from "./services/validation/validation";
import { PWAValidationProvider } from "./services/validation/validation-view";
import { ServiceWorkerProvider } from "./services/validation/sw-view";
import { PackageViewProvider } from "./services/package/package-view";
import { LocalStorageService } from "./library/local-storage";
import { askForUrl } from "./services/web-publish";
import { HelpViewPanel } from "./views/help-view";
import { IconViewPanel } from "./views/icon-view";
import { hoversActivate } from "./services/manifest/mani-hovers";
import { codeActionsActivate } from "./services/manifest/mani-codeactions";
import { initAnalytics } from "./services/usage-analytics";
import { generateScreenshots } from "./services/manifest/assets-service";
import { updateAdvServiceWorker } from "./services/service-workers/adv-service-worker";
import { runScript, runTests } from "./services/dashboard/dev-dashboard";
import { DashboardViewProvider } from "./services/dashboard/dashboard-view";
import { addFileHandlers, addProtocolHandler, addShareTarget, addShortcuts } from "./services/enhancements";

const serviceWorkerCommandId = "pwa-studio.serviceWorker";
const generateWorkerCommandId = "pwa-studio.generateWorker";
const newPWAStarterCommandId = "pwa-studio.newPwaStarter";
const validateCommandId = "pwa-studio.validatePWA";
const packageCommandId = "pwa-studio.packageApp";
const manifestCommandID = "pwa-studio.manifest";
const maniDocsCommandID = "pwa-studio.maniItemDocs";
const chooseManiCommandID = "pwa-studio.chooseManifest";
const refreshViewCommandID = "pwa-studio.refreshEntry";
const refreshSWCommandID = "pwa-studio.refreshSWView";
const refreshPackageCommandID = "pwa-studio.refreshPackageView";
const chooseServiceWorkerCommandID = "pwa-studio.chooseServiceWorker";
const updateADVWorkerCommandID = "pwa-studio.updateAdvWorker";
const setAppURLCommandID = "pwa-studio.setWebURL";
const handleIconsCommmandID = "pwa-studio.generateIcons";
const handleScreenshotsCommandID = "pwa-studio.generateScreenshots";
const helpCommandID = "pwa-studio.help";
const runTestCommandID = "pwa-studio.runTests";
const runScriptCommandID = "pwa-studio.runScript";
const addShortcutsCommandID = "pwa-studio.addShortcuts";
const addShareTargetCommandID = "pwa-studio.addShareTarget";
const addProtocolHandlerCommandID = "pwa-studio.addProtocolHandler";
const addFileHandlerCommandID = "pwa-studio.addFileHandler";

export let storageManager: LocalStorageService | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  storageManager = new LocalStorageService(context.workspaceState);

  try {
    initAnalytics();
  }
  catch (err) {
    console.error("Error activating analytics", err)
  }

  const packageStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  packageStatusBarItem.text = "Package PWA";
  packageStatusBarItem.show();

  const generateAppStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    250
  );
  generateAppStatusBarItem.text = "Start new PWA";
  generateAppStatusBarItem.show();

  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    const maniValidationProvider = new PWAValidationProvider(
      vscode.workspace.workspaceFolders[0].uri.fsPath
    );

    const serviceWorkerProvider = new ServiceWorkerProvider(
      vscode.workspace.workspaceFolders[0].uri.fsPath
    );

    const packageViewProvider = new PackageViewProvider(
      vscode.workspace.workspaceFolders[0].uri.fsPath
    );

    const dashboardViewProvider = new DashboardViewProvider(
      vscode.workspace.workspaceFolders[0].uri.fsPath
    )

    vscode.window.createTreeView("validationPanel", {
      treeDataProvider: maniValidationProvider,
    });

    vscode.window.createTreeView("serviceWorkerPanel", {
      treeDataProvider: serviceWorkerProvider,
    });

    vscode.window.createTreeView("packagePanel", {
      treeDataProvider: packageViewProvider,
    });

    vscode.window.createTreeView("dashboardPanel", {
      treeDataProvider: dashboardViewProvider,
    });

    vscode.window.createTreeView("explorerPanel", {
      treeDataProvider: dashboardViewProvider
    });

    vscode.commands.registerCommand(refreshViewCommandID, (event) => {
      maniValidationProvider.refresh(event);
    });

    vscode.commands.registerCommand(refreshSWCommandID, (event) => {
      serviceWorkerProvider.refresh(event);
    });

    vscode.commands.registerCommand(refreshPackageCommandID, (event) => {
      packageViewProvider.refresh(event);
    });
  }

  const maniDocs = vscode.commands.registerCommand(
    maniDocsCommandID,
    async (event) => {
      await handleManiDocsCommand(event);
    }
  );

  const chooseManifestCommand = vscode.commands.registerCommand(
    chooseManiCommandID,
    async () => {
      await chooseManifest();
    }
  );

  const addShortcutsCommand = vscode.commands.registerCommand(
    addShortcutsCommandID,
    async () => {
      await addShortcuts();
    }
  );

  const addShareTargetCommand = vscode.commands.registerCommand(
    addShareTargetCommandID,
    async () => {
      await addShareTarget();
    }
  );

  const addProtocolHandlerCommand = vscode.commands.registerCommand(
    addProtocolHandlerCommandID,
    async () => {
      await addProtocolHandler();
    }
  );

  const addFileHandlerCommand = vscode.commands.registerCommand(
    addFileHandlerCommandID,
    async () => {
      await addFileHandlers();
    }
  );

  const generateScreenshotsCommand = vscode.commands.registerCommand(
    handleScreenshotsCommandID,
    async () => {
      await generateScreenshots();
    }
  )

  const helpCommand = vscode.commands.registerCommand(
    helpCommandID,
    async () => {
      HelpViewPanel.render(context.extensionUri);
    }
  );

  const iconView = vscode.commands.registerCommand(
    handleIconsCommmandID ,
    async () => {
      IconViewPanel.render(context.extensionUri);
    }
  );

  const chooseServiceWorkerCommand = vscode.commands.registerCommand(
    chooseServiceWorkerCommandID,
    async () => {
      await chooseServiceWorker();
    }
  );

  const addServiceWorker = vscode.commands.registerCommand(
    serviceWorkerCommandId,
    async () => {
      await handleSW();
    }
  );

  const generateWorker = vscode.commands.registerCommand(
    generateWorkerCommandId,
    async () => {
      await generateServiceWorker();
    }
  );

  const updateAdvWorkerCommand = vscode.commands.registerCommand(
    updateADVWorkerCommandID,
    async () => {
      updateAdvServiceWorker();
    }
  );

  let packageAppCommand = vscode.commands.registerCommand(
    packageCommandId,
    packageApp
  );
  packageStatusBarItem.command = packageCommandId;

  let newPwaStarterCommand = vscode.commands.registerCommand(
    newPWAStarterCommandId,
    setUpLocalPwaStarterRepository
  );
  generateAppStatusBarItem.command = newPWAStarterCommandId;

  let validationCommand = vscode.commands.registerCommand(
    validateCommandId,
    async () => {
      handleValidation(context);
    }
  );

  let manifestCommand = vscode.commands.registerCommand(
    manifestCommandID,
    async () => {
      await generateManifest();
    }
  );

  let setAppURLCommand = vscode.commands.registerCommand(
    setAppURLCommandID,
    async () => {
      await askForUrl();
    }
  );

  let runTestCommand = vscode.commands.registerCommand(
    runTestCommandID,
    async () => {
      await runTests();
    }
  );

  let runScriptCommand = vscode.commands.registerCommand(
    runScriptCommandID,
    async (script: string) => {
      await runScript(script);
    }
  );

  // init manifest improvement suggestion
  // to-do: integrate into sideview panel
  // initSuggestions();

  // used for web manifest validation
  const manifestDiagnostics =
    vscode.languages.createDiagnosticCollection("webmanifest");
  context.subscriptions.push(manifestDiagnostics);

  subscribeToDocumentChanges(context, manifestDiagnostics);

  context.subscriptions.push(
    // only on web manifest files
    vscode.languages.registerCodeActionsProvider(
      { language: 'json', pattern: '**/manifest.json' },
      new ManifestInfoProvider(),
      {
        providedCodeActionKinds: ManifestInfoProvider.providedCodeActionKinds,
      }
    )
  );

  // web manifest hovers
  hoversActivate(context);

  // web manifest code actions
  codeActionsActivate(context);

  context.subscriptions.push(manifestCommand);
  context.subscriptions.push(newPwaStarterCommand);
  context.subscriptions.push(addServiceWorker);
  context.subscriptions.push(chooseServiceWorkerCommand);
  context.subscriptions.push(packageAppCommand);
  context.subscriptions.push(validationCommand);
  context.subscriptions.push(generateWorker);
  context.subscriptions.push(updateAdvWorkerCommand);
  context.subscriptions.push(maniDocs);
  context.subscriptions.push(chooseManifestCommand);
  context.subscriptions.push(setAppURLCommand);
  context.subscriptions.push(runTestCommand);
  context.subscriptions.push(runScriptCommand);
  context.subscriptions.push(iconView);
  context.subscriptions.push(generateScreenshotsCommand);
  context.subscriptions.push(helpCommand);
  context.subscriptions.push(addShortcutsCommand);
  context.subscriptions.push(addShareTargetCommand);
  context.subscriptions.push(addProtocolHandlerCommand);
  context.subscriptions.push(addFileHandlerCommand);
}

export function deactivate() {}

export class ManifestInfoProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    // for each diagnostic entry that has the matching `code`, create a code action command
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === MANI_CODE)
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction("", vscode.CodeActionKind.Empty);
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}
