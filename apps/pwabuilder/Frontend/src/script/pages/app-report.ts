import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getManifestContext, setManifestContext } from '../services/app-info';
import { validateManifest, Validation, Manifest, reportMissing, required_fields, recommended_fields, optional_fields } from '@pwabuilder/manifest-validation';
import {
  BreakpointValues
} from '../utils/css/breakpoints';
import {classMap} from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import '../components/app-header';
import '../components/todo-list-item';
import '../components/manifest-editor-frame';
import '../components/publish-pane';
import '../components/test-publish-pane';
import '../components/sw-selector';
import '../components/share-card';
import '../components/manifest-info-card'
import '../components/sw-info-card'
import '../components/arrow-link'

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/progress-ring/progress-ring.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';

import {
  Icon,
  ManifestContext,
  RawTestResult,
  TestResult
} from '../utils/interfaces';

// import { fetchOrCreateManifest, createManifestContextFromEmpty } from '../services/manifest';
import { resolveUrl } from '../utils/url';

import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

//@ts-ignore
import Color from "../../../node_modules/colorjs.io/dist/color";
import { manifest_fields } from '@pwabuilder/manifest-information';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import { processImages, processManifest, processSecurity, processServiceWorker } from './app-report.helper';
import { Report, ReportAudit, FindWebManifest, FindServiceWorker, AuditServiceWorker } from './app-report.api';
import { findBestAppIcon } from '../utils/icons';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import { appReportStyles } from './app-report.styles';

const valid_src = "/assets/new/valid.svg";
const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const enhancement_src = "/assets/new/enhancement.svg";

const yield_white_src = "/assets/new/yield_white.svg";
const stop_white_src = "/assets/new/stop_white.svg";
const enhancement_white_src = "/assets/new/enhancement_white.svg";

@customElement('app-report')
export class AppReport extends LitElement {
  @property({ type: Object }) resultOfTest: RawTestResult | undefined;
  @property({ type: Object }) reportAudit: ReportAudit | undefined;
  @property({ type: Object }) appCard = {
    siteName: 'Site Name',
    description: "Your site's description",
    siteUrl: 'Site URL',
    iconURL: '/assets/new/icon_placeholder.png',
    iconAlt: 'Your sites logo'
  };
  @property({ type: Object }) CardStyles = { backgroundColor: '#ffffff', color: '#292c3a' };
  @property({ type: Object }) BorderStyles = { borderTop: '1px solid #00000033' };
  @property({ type: Object }) LastEditedStyles = { color: '#000000b3' };
  @property() manifestCard = {};
  @property() serviceWorkerCard = {};
  @property() securityCard = {};
  @property() siteURL = '';
  @state() swScore = 0;
  @state() maniScore = 0;
  @state() securityScore = 0;

  @state() errored: boolean = false;
  @state() errorMessage: string | undefined = undefined;
  @state() errorLink: string | undefined = undefined;

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isAppCardInfoLoading: boolean = false;
  @state() isDeskTopView = this.mql.matches;

  // will be used to control the state of the "Package for store" button.
  @state() runningTests: boolean = false;
  @state() canPackageList: boolean[] = [false, false, false];
  @state() canPackage: boolean = false;
  @state() manifestEditorOpened: boolean = false;

  @state() swSelectorOpen: boolean = false;

  // Controls the last tested section
  @state() lastTested: string = "Last tested seconds ago";

  @state() todoWindow: any[] = [];
  private pageNumber: number = 1;
  private pageSize: number = 5;

  // validation
  @state() validationResults: Validation[] = [];
  @state() manifestTotalScore: number = 0;
  @state() manifestValidCounter: number = 0;
  @state() manifestRequiredCounter: number = 0;
  @state() manifestRecCounter: number = 0;
  @state() manifestDataLoading: boolean = true;
  @state() manifestMessage: string = "";
  @state() startingManifestEditorTab: string = "info";
  @state() focusOnME: string = "";
  @state() proxyLoadingImage: boolean = false;

  @state() serviceWorkerResults: any[] = [];
  @state() swTotalScore: number = 0;
  @state() swValidCounter: number = 0;
  @state() swRequiredCounter: number = 0;
  @state() swRecCounter: number = 0;
  @state() swDataLoading: boolean = true;
  @state() swMessage: string = "";


  @state() secDataLoading: boolean = true;
  @state() showSecurityErrorBanner: boolean = false;
  @state() showSecurityWarningBanner: boolean = false;
  @state() securityIssues: string[] = [];

  @state() showIconsErrorBanner: boolean = false;
  @state() showScreenshotsErrorBanner: boolean = false;

  @state() showServiceWorkerWarningBanner: boolean = false;

  @state() enhancementTotalScore: number = 0;

  @state() requiredMissingFields: any[] = [];
  @state() recMissingFields: any[] = [];
  @state() optMissingFields: any[] = [];

  // Confirm Retest stuff
  @state() showConfirmationModal: boolean = false;
  @state() thingToAdd: string = "";
  @state() retestConfirmed: boolean = false;
  @state() readdDenied: boolean = false;

  @state() createdManifest: boolean = false;
  @state() manifestContext: ManifestContext | undefined;

  @state() allTodoItems: any[] = [];
  @state() filteredTodoItems: any[] = [];
  @state() filterList: any[] = [];
  @state() openTooltips: SlDropdown[] = [];
  @state() stopShowingNotificationTooltip: boolean = false;
  @state() closeOpenTooltips: boolean = true;

  @state() darkMode: boolean = false;

  private possible_messages = [
    {"messages": {
                  "green": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! Great job you have a perfect score!",
                  "yellow": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! We have identified recommended and optional fields that you can include to make your PWA better. Use our Manifest Editor to edit and update those fields.",
                  "blocked": "PWABuilder has analyzed your Web Manifest. You have one or more fields that need to be updated before you can package. Use our Manifest Editor to edit and update those fields. You can package for the store once you have a valid manifest.",
                  "none": "PWABuilder has analyzed your site and did not find a Web Manifest. Use our Manifest Editor to generate one. You can package for the store once you have a valid manifest.",
                  }
    },
    {"messages": {
                      "green": "PWABuilder has analyzed your Service Worker and your Service Worker is ready for packaging! Great job you have a perfect score!",
                      "yellow": "PWABuilder has analyzed your Service Worker, and has identified additional features you can add to make your app feel more robust.",
                      "blocked": "",
                      "none": "PWABuilder has analyzed your site and did not find a Service Worker. Having a Service Worker is highly recommended by PWABuilder as it enables an array of features that can enhance your PWA. You can generate a Service Worker below or use our documentation to make your own.",
                  },
     },
      {"messages": {
                    "green": "PWABuilder has done a basic analysis of your HTTPS setup and found no issues! Great job you have a perfect score!",
                    "yellow": "",
                    "blocked": "",
                    "none": "PWABuilder has done a basic analysis of your HTTPS setup and has identified required actions before you can package. Check out the documentation linked below to learn more.",
                  }
      }
    ];

  private specialManifestTodos: {[id: string]: string} = {
    "shortcuts": "Add contextual shortcuts to specific parts of your app",
    "display_override": "Extend your app into the titlebar for a more native look and feel with display_override and window-controls-overlay",
    "share_target": "Be a share_target for your users",
    "file_handlers": "Be a default handler for certain filetypes with file_handlers",
    "handle_links": "Open links as an app with handle_links",
    "protocol_handlers": "Create a custom protocol_handler",
    "edge_side_panel": "Increase reach by participating in the edge_side_panel",
    "widgets": "Increase reach with widgets"
  }

  private specialSWTodos: {[id: string]: string} = {
    "offline_support": "Allow users to use your app without internet connection",
    "push_notifications": "Send notifications to you users even if your app is not running with push notifications",
    "background_sync": "Ensure user actions and content is always in sync even if network connection is lost with background sync",
    "periodic_sync": "Update your app in the background so it's ready next time the user opens it with periodic sync"
  }

  static styles = [appReportStyles];

  /* Legacy code, scared to remove. IDK the application of this code */
  constructor() {
    super();
    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  // Runs when the page loads.
  // Responsible for setting running the initial tests
  async connectedCallback(): Promise<void> {
    super.connectedCallback();


    // understand the users color preference
    const result = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = result.matches; // TRUE if user prefers dark mode

    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runAllTests(site);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }

    setInterval(() => this.pollLastTested(), 120000);

    window.addEventListener('scroll', this.closeTooltipOnScroll.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.closeTooltipOnScroll.bind(this));
  }

  // Expands the Action items details on load
  firstUpdated() {

  }

  // Polling function that updates the time that the site was last tested
  pollLastTested(){
    let last = new Date(JSON.parse(sessionStorage.getItem('last_tested')!));
    let now = new Date();
    let diff = now.getTime() - last.getTime();

    if(diff < 60000){
      this.lastTested = "Last tested seconds ago";
    } else if (diff < 3600000) {
      let mins = Math.floor(diff / 60000);
      this.lastTested = "Last tested " + mins + " minutes ago";
    } else if (diff < 86400000) {
      let hours = Math.floor(diff / 3600000);
      this.lastTested = "Last tested " + hours + " hours ago";
    } else {
      let days = Math.floor(diff / 86400000);
      this.lastTested = "Last tested " + days + " days ago";
    }
    this.requestUpdate();
  }

  // Fetches the sites manifest from the URL
  // If it's missing it creates one and sets a flag
  // If it's there then it saves it to sessionStorage
  // async getManifest(url: string): Promise<ManifestContext> {
  //   this.isAppCardInfoLoading = true;
  //   let manifestContext: ManifestContext | undefined;

  //   manifestContext = await fetchOrCreateManifest(url);
  //   this.createdManifest = false;

  //   if(!manifestContext){
  //     this.createdManifest = true;
  //     manifestContext = await createManifestContextFromEmpty(url);
  //   }

  //   this.manifestContext = manifestContext;

  //   this.isAppCardInfoLoading = false;
  //   this.populateAppCard(manifestContext!, url);
  //   return manifestContext!;
  // }

  // Populates the "App Card" from the manifest.
  // Uses the URL for loading the image.
  async populateAppCard(manifestContext: ManifestContext, url?: string) {
    let cleanURL = url?.replace(/(^\w+:|^)\/\//, '') || '';

    if (manifestContext && !this.createdManifest) {
      const parsedManifestContext = manifestContext;

      let icons = parsedManifestContext.manifest.icons;

      let chosenIcon: any;

      if(icons){
        let maxSize = 0;
        for(let i = 0; i < icons.length; i++){
          let icon = icons[i];
          let size = icon.sizes?.split("x")[0];
          if(size === '512'){
            chosenIcon = icon;
            break;
          } else{
            if(parseInt(size!) > maxSize){
              maxSize = parseInt(size!);
              chosenIcon = icon;
            }
          }
        }
      }

      let iconUrl: string;
      if(chosenIcon){
        iconUrl = this.iconSrcListParse(chosenIcon);
      } else {
        iconUrl = "/assets/icons/icon_512.png"
      }


      this.proxyLoadingImage = true;
      await this.testImage(iconUrl).then(
        function fulfilled(_img) {
          //console.log('That image is found and loaded', img);
        },

        function rejected() {
          //console.log('That image was not found');
          iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getSafeUrl?url=${iconUrl}`;
        }
      );
      this.proxyLoadingImage = false;

      this.appCard = {
        siteName: parsedManifestContext.manifest.short_name
          ? parsedManifestContext.manifest.short_name
          : (parsedManifestContext.manifest.name ? parsedManifestContext.manifest.name : 'Untitled App'),
        siteUrl: cleanURL,
        iconURL: iconUrl,
        iconAlt: "Your sites logo",
        description: parsedManifestContext.manifest.description
          ? parsedManifestContext.manifest.description
          : 'Add an app description to your manifest',
      };
    } else {
        this.appCard = {
          siteName: "Missing Name",
          siteUrl: cleanURL,
          description: "Your manifest description is missing.",
          iconURL: "/assets/new/icon_placeholder.png",
          iconAlt: "A placeholder for you sites icon"
        };
    }
  }

  // Tests if an image will load
  // If it fails, we use our proxy service to fetch it
  // If it succeeds, we load it
  testImage(url: string) {

    // Define the promise
    const imgPromise = new Promise(function imgPromise(resolve, reject) {

        // Create the image
        const imgElement = new Image();

        // When image is loaded, resolve the promise
        imgElement.addEventListener('load', function imgOnLoad() {
            resolve(this);
        });

        // When there's an error during load, reject the promise
        imgElement.addEventListener('error', function imgOnError() {
            reject();
        })

        // Assign URL
        imgElement.src = url;

    });

    return imgPromise;
  }

  // Looks at the brackground color from the sites manifest
  // If its darker, returns lightColor for the background of app card
  // If its lighter, returns darkColor for the background of app card
  pickTextColorBasedOnBgColorAdvanced(bgColor: string, lightColor: string, darkColor: string): string {

    //@ts-ignore:next-line
    var colors: any = new Color(bgColor).coords;

    var c = colors.map((num: number) => {
      if (num <= 0.03928) {
        return num / 12.92;
      }
      return Math.pow((num + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    let chosenColor = (L > 0.3) ?  darkColor : lightColor;
    return chosenColor
  }

  private async applyManifestContext(url: string, manifestUrl?: string, manifestRaw?: string) {
    this.manifestContext = await processManifest(url, {url: manifestUrl, raw: manifestRaw});
    this.createdManifest = this.manifestContext.isGenerated || false;
    setManifestContext(this.manifestContext);
    this.isAppCardInfoLoading = false;
    await this.populateAppCard(this.manifestContext, manifestUrl);
  }

  // Runs the Manifest, SW and SEC Tests. Sets "canPackage" to true or false depending on the results of each test
  async runAllTests(url: string) {
    this.runningTests = true;
    this.isAppCardInfoLoading = true;

    let findersResults = {
      manifest: {} as {url?: string, raw?: string, json?: unknown},
      serviceWorker: {} as {url?: string, raw?: string},
      manifestTodos: [] as unknown[],
      workerTodos: [] as unknown[]
    }
    this.reportAudit = undefined;

    // Take only good results, ignore errors.
    FindWebManifest(url).then( async (result) => {
      if (result?.content?.raw && !this.reportAudit?.artifacts?.webAppManifestDetails?.raw) {
        // TODO: can use json instead of raw
        findersResults.manifest = result.content;
        await this.applyManifestContext(url, result?.content?.url || undefined, result?.content?.raw);
        findersResults.manifestTodos = await this.testManifest(result.content.validations);
        this.allTodoItems.push(...findersResults.manifestTodos);
        this.requestUpdate();
      }
    });

    setTimeout(() => this.closeOpenTooltips = false, 20000);

    this.filteredTodoItems = this.allTodoItems;

    FindServiceWorker(url).then( async (result) => {
        if (result?.content?.url && !this.reportAudit?.audits?.serviceWorker) {
          await AuditServiceWorker(result.content.url).then( async (result) => {
            console.log("content:", result.validations);
            findersResults.workerTodos = await this.createServiceWorkerResults(result.validations);
            this.allTodoItems.push(...findersResults.workerTodos);
            this.requestUpdate();
          });
          findersResults.serviceWorker = result.content;
        }
      }
    );

    this.filteredTodoItems = this.allTodoItems;

    try {
      this.reportAudit = await Report(url);
    } catch (e) {
      console.error(e);
      this.allTodoItems.push(...await this.createSecurityResults(processSecurity()));
      if (!findersResults.manifest?.raw) {
        await this.applyManifestContext(url, undefined, undefined);
        this.allTodoItems.push(...await this.testManifest());
      }
      if (!findersResults.serviceWorker?.raw) {
        this.allTodoItems.push(...await this.createServiceWorkerResults(processServiceWorker({score: false, details: {}})));
      }

      this.filteredTodoItems = this.allTodoItems;

      this.runningTests = false;
      this.requestUpdate();
      return;
    }

    this.filteredTodoItems = this.allTodoItems;
    console.log(this.reportAudit);

    // Check for previously successfull FindMani
    if (this.reportAudit?.artifacts?.webAppManifestDetails?.raw) {
      if (!findersResults.manifest.raw || this.reportAudit?.artifacts.webAppManifestDetails.raw != findersResults.manifest.raw) {
        await this.applyManifestContext(url, this.reportAudit?.artifacts?.webAppManifestDetails?.url, this.reportAudit?.artifacts?.webAppManifestDetails?.raw);
        findersResults.manifestTodos = [];
      }
    } else {
      if (!findersResults.manifest?.raw) {
        await this.applyManifestContext(url, undefined, undefined);
      }
    }

    // Reapply mani todos from FindMani
    this.allTodoItems = [];
    if (findersResults.manifestTodos.length){
      this.allTodoItems.push(...findersResults.manifestTodos)
    }
    else {
      this.allTodoItems.push(...await this.testManifest());
    }

    // TODO: move installability score to different place
    this.allTodoItems.push(...await this.createServiceWorkerResults(this.reportAudit?.serviceWorkerValidations ?? [])),
    this.allTodoItems.push(...await this.createSecurityResults(this.reportAudit?.securityValidations ?? []));
    this.allTodoItems.push(...await this.createTestsImagesResults(processImages(this.reportAudit?.audits)));

    this.filteredTodoItems = this.allTodoItems;
    this.canPackage = this.canPackageList[0] && this.canPackageList[1] && this.canPackageList[2] && this.canPackageList[3];

    this.runningTests = false;
    this.requestUpdate();
  }

  // Tests the Manifest and populates the manifest card detail dropdown
  async testManifest(validationResults: Validation[] = []) {
    //add manifest validation logic
    // note: wrap in try catch (can fail if invalid json)
    this.manifestDataLoading = true;
    let manifest;
    let todos: unknown[] = [];

    if(this.createdManifest){
      manifest = {};
      todos.push({"card": "mani-details", "field": "Open Manifest Modal", "fix": "Edit and download your created manifest (Manifest not found before detection tests timed out)", "status": "missing"});
    }

    manifest = getManifestContext().manifest;
    if (validationResults.length > 0){
      this.validationResults = validationResults;
    } else {
      this.validationResults = await validateManifest(manifest, true);
    }

    const icon = findBestAppIcon(manifest.icons);
    this.validationResults.push({infoString: "Icons are used to create packages for different stores and must meet certain formatting requirements.", displayString: "Manifest has suitable icons", category: 'required', member: 'suitable-icons', valid: !!icon, errorString: "Can't find a suitable icon to use for the package stores. Ensure your manifest has a square, large (512x512 or better) PNG icon; Check if the proposed any or maskable is set. And if the format of the image matches the mimetype.", testRequired: true, quickFix: true});


    //  This just makes it so that the valid things are first
    // and the invalid things show after.
    this.validationResults.sort((a, b) => {
      if(a.valid && !b.valid){
        return 1;
      } else if(b.valid && !a.valid){
        return -1;
      } else {
        return a.member.localeCompare(b.member);
      }
    });
    this.manifestTotalScore = this.validationResults.length;
    this.manifestValidCounter = 0;
    this.manifestRequiredCounter = 0;
    this.enhancementTotalScore = 0;
    this.manifestRecCounter = 0;

    this.validationResults.forEach((test: Validation) => {
      if(test.valid){
        if(test.category === "enhancement"){
          this.enhancementTotalScore++;
        }
        this.manifestValidCounter++;
      } else {
        let status ="";
        if(test.category === "required" || test.testRequired){
          status = "required";
          this.manifestRequiredCounter++;
        } else if(test.category === "recommended"){
          this.manifestRecCounter++;
        }
        if(status === "") {
          status = test.category;
        }
        if(status === "enhancement"){
          // fetch special display string
          let specialString: string = this.specialManifestTodos[test.member!];
          todos.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": specialString, "status": status});
        } else {
          todos.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": test.errorString, "status": status});
        }
      }
    });

    if(this.manifestRequiredCounter > 0){
      this.canPackageList[0] = false;
    } else {
      this.canPackageList[0] = true;
    }

    this.manifestDataLoading = false;
    // details?.disabled && (details.disabled = false);

    sessionStorage.setItem(
      'manifest_tests',
      JSON.stringify(this.validationResults)
    );
    //TODO: Fire event when ready
    // this.requestUpdate();
    return todos;
  }

  // Tests the SW and populates the SW card detail dropdown
  async createServiceWorkerResults(serviceWorkerResults: TestResult[]) {

    let todos: unknown[] = [];

    const prevServiceWorkerResults = this.serviceWorkerResults;
    if (prevServiceWorkerResults && prevServiceWorkerResults.length > 0) {
      //Compare processed service worker results with the new ones

      const reducerServiceWorkerResult: Record<string, TestResult> = prevServiceWorkerResults.reduce((acc, curr) => {
        return {...acc, [curr.member]: curr}
      },{});

      this.serviceWorkerResults = serviceWorkerResults.map((value) => {
        const prevResult = reducerServiceWorkerResult[value.member!];

        //Validate if the service worker result has changed for some reason
        if (value.member == 'has_service_worker' && prevResult && prevResult.result && !value.result ) {
          this.showServiceWorkerWarningBanner = true;
          return prevResult;
        }

        return value;
      });

    } else {
      this.serviceWorkerResults = serviceWorkerResults;
    }


    this.swValidCounter = 0;
    this.swRequiredCounter = 0;
    this.serviceWorkerResults.forEach((result: any) => {
      if(result.result){
        this.swValidCounter++;
      } else {
        let status = "";
        let card = "sw-details";
        let missing = false;
        switch(result.category){
          case "highly recommended":
            missing = true;
            status = "highly recommended";
            this.swRecCounter++;
            todos.push({"card": card, "field": "Open SW Modal", "fix": "Add Service Worker to Base Package (SW not found before detection tests timed out)", "status": status});
            break;
          case "recommended":
            status = "recommended";
            this.swRecCounter++;
            break;
          case "required":
            status = "required";
            this.swRequiredCounter++;
            break;
          default:
            status = "optional";
        }

        if(!missing){
          let fix = this.specialSWTodos[result.member];
          todos.push({"card": card, "field": result.member, "fix": fix, "status": status});
        }
      }
    })

    if(this.swRequiredCounter > 0){
      this.canPackageList[1] = false;
    } else {
      this.canPackageList[1] = true;
    }

    this.swTotalScore = this.serviceWorkerResults.length;

    this.swDataLoading = false;

    //save serviceworker tests in session storage
    sessionStorage.setItem(
      'service_worker_tests',
      JSON.stringify(serviceWorkerResults)
    );
    // this.requestUpdate();
    return todos;
  }

  // Tests the Security and populates the Security card detail dropdown
  async createSecurityResults(securityAudit: TestResult[]) {

    //Call security tests
    let todos: unknown[] = [];

    const securityTests = securityAudit;

    securityTests.forEach((result: any) => {
      if(!result.result){
        if(result.member === "https"){
          this.showSecurityErrorBanner = true;
        } else if(result.member === "mixed_content") {
          this.showSecurityWarningBanner = true;
        }
        todos.push({"card": "security", "field": result.member, "fix": result.infoString, "status": "required"});
      }
    });

    this.canPackageList[2] = !this.showSecurityErrorBanner;

    this.secDataLoading = false;

    //save security tests in session storage
    sessionStorage.setItem('security_tests', JSON.stringify(securityTests));
    this.requestUpdate();
    return todos;
  }

  async createTestsImagesResults(imagesValidation: Validation[]) {
    let todos: unknown[] = [];

    imagesValidation.forEach((result: Validation) => {
      if (!result.valid) {
        if (result.member === "icons") {
          this.showIconsErrorBanner = true;
        } else if (result.member === "screenshots" || result.category === "required") {
          this.showScreenshotsErrorBanner = true;
        }
        todos.push({ "card": "mani-details", "field": result.member, "fix": result.errorString, "status": "required" });
      }
    });

    this.canPackageList[3] = !(this.showSecurityErrorBanner);

    //save security tests in session storage
    sessionStorage.setItem('image_tests', JSON.stringify(imagesValidation));
    this.requestUpdate();
    return todos;
  }

  // If some manifest fields are missing it adds it to the drop down and returns the number that were missing
  async handleMissingFields(manifest: Manifest){
    let missing = await reportMissing(manifest);
    let todos: unknown[] = [];
    this.requiredMissingFields, this.recMissingFields, this.optMissingFields = [];

    missing.forEach((field: string) => {

      let isRecommended = false;

      if(required_fields.includes(field)){
        this.requiredMissingFields.push(field);
        this.manifestRequiredCounter++;
        todos.push({"card": "mani-details", "field": field, "fix": `Add ${field} to your manifest`, status: "required"})
      } else if(recommended_fields.includes(field)){
        this.recMissingFields.push(field);
        this.manifestRecCounter++;
        isRecommended = true;
      } else if(optional_fields.includes(field)){
        this.optMissingFields.push(field)
      }
      if(!this.createdManifest && !required_fields.includes(field)){
        todos.push({"card": "mani-details", "field": field, "fix": `Add ${field} to your manifest`, "status": isRecommended ? "recommended" : "optional"})
      }
    });
    let num_missing = missing.length;
    return {
      details: todos,
      num_missing
    }
  }

  /**
  * Triggers all tests to retest
  * If coming from confirmation is true, we have to delay a bit so a special message can show
  * @param {boolean} comingFromConfirmation
  * @return {void}
  */
  async retest(comingFromConfirmation: boolean) {
    recordPWABuilderProcessStep("retest_clicked", AnalyticsBehavior.ProcessCheckpoint);
    this.retestConfirmed = true;
    if(comingFromConfirmation){
      await this.delay(3000)
    }
    (this.shadowRoot!.querySelector(".dialog") as any)!.hide();
    if (this.siteURL) {
      this.resetData();
      this.runAllTests(this.siteURL);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }
  }

  // Delay function. Delays a given amt of ms
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Resets all data btwn tests
  resetData(){
    // reset scores
    this.manifestValidCounter = 0;
    this.manifestTotalScore = 0;
    this.manifestRequiredCounter = 0;
    this.swValidCounter = 0;
    this.swTotalScore = 0;
    this.swRequiredCounter = 0;
    this.enhancementTotalScore = 0;

    // reset todo lsit
    this.allTodoItems = [];

    // reset missing lists
    this.requiredMissingFields = [];
    this.recMissingFields = [];
    this.optMissingFields = [];

    // reset results
    this.validationResults = [];
    this.serviceWorkerResults = [];

    // activate loaders
    this.manifestDataLoading = true;
    this.swDataLoading = true;
    this.secDataLoading = true;
    this.canPackage = false;

    // last tested
    this.lastTested = "Last tested seconds ago"

    // hide the detail lists
    let details = this.shadowRoot!.querySelectorAll('sl-details');

    this.showConfirmationModal = false;

    details.forEach((detail: any) => {
      detail.hide();
    });

    // reset retest data
    this.retestConfirmed = false;

    // reset action items page;
    this.pageNumber = 1;
  }

  // Opens share card modal and tracks analytics
  async openShareCardModal() {
    this.closeOpenTooltips = false;
    let dialog: any = this.shadowRoot!.querySelector("share-card")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("share_card_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  // Opens manifest editor and tracks analytics
  async openManifestEditorModal(focusOn = "", tab: string = "info"): Promise<void | undefined> {
    this.closeOpenTooltips = false;
    this.startingManifestEditorTab = tab;
    this.focusOnME = focusOn;
    let dialog: any = this.shadowRoot!.querySelector("manifest-editor-frame")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("manifest_editor_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens SW Selector and tracks analytics
  async openSWSelectorModal() {
    this.closeOpenTooltips = false;
    let dialog: any = this.shadowRoot!.querySelector("sw-selector")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("sw_selector_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens publish pane and tracks analytics
  async openPublishModal() {
    this.closeOpenTooltips = false;
    let dialog: any = this.shadowRoot!.querySelector("publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens test publish modal and tracks analytics
  async openTestPublishModal() {
    this.closeOpenTooltips = false;
    let dialog: any = this.shadowRoot!.querySelector("test-publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("test_publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  // Gets full icon URL from manifest given a manifest icon object
  iconSrcListParse(icon: any) {
    let manifest = getManifestContext().manifest;
    let manifestURL = getManifestContext().manifestUrl;
    let iconURL: string = this.handleImageUrl(icon, manifest, manifestURL) || '';

    return iconURL;
  }

  // Makes sure the icon URL is valid
  handleImageUrl(icon: Icon, manifest: Manifest, manifestURL: string) {
    if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
      return icon.src;
    }

    let url = resolveUrl(manifestURL, manifest?.startUrl);
    url = resolveUrl(url?.href, icon.src);

    if (url) {
      return url.href;
    }

    return undefined;
  }

  // Decides color of Progress rings depending on required and recommended fields
  decideColor(card: string){

    let instantRed = false;
    if(card === "manifest"){
      instantRed = this.manifestRequiredCounter > 0;
    } else if(card === "sw"){
      instantRed = this.swRequiredCounter > 0;
    }

    let instantYellow = false;
    if(card === "manifest"){
      instantYellow = this.manifestRecCounter > 0;
    } else if(card === "sw"){
      instantYellow = this.swRecCounter > 0;
    }

    if(instantRed){
      return {"green": false, "red": true, "yellow": false};
    } else if(instantYellow){
      return {"green": false, "red": false, "yellow": true};
    } else {
      return {"green": true, "red": false, "yellow": false};
    }
  }

  getRingColor(card: string) {
    let ring = this.shadowRoot!.getElementById(`${card}ProgressRing`);
    if(ring){
      return ring.classList[0];
    }
    return;
  }

  // Swaps messages for each card depending on state of each card
  decideMessage(valid: number, total: number, card: string){

    let instantRed = false;
    let index = 0;
    if(card === "manifest"){
      instantRed = this.manifestRequiredCounter > 0;
    } else if(card === "sw"){
      index = 1;
      instantRed = this.swRequiredCounter > 0;
    }

    let ratio = parseFloat(JSON.stringify(valid)) / total;

    let messages = this.possible_messages[index].messages;

    if(this.createdManifest || ratio == 0 || (card ==="sec" && ratio != 1)){
      return messages["none"];
    } else if(instantRed){
      return messages["blocked"];
    } else if(ratio != 1){
      return messages["yellow"];
    } else {
      return messages["green"];
    }
  }

  formatSWStrings(member: string){
    const words = member.split('_');
    // Capitalize first letter of each word (handles single characters correctly)
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    const joined = capitalizedWords.join(" ");
    return joined;
  }

  // Scrolls and Shakes the respective item from a click of an action item
  async animateItem(e: CustomEvent){
    e.preventDefault;
    recordPWABuilderProcessStep("todo_item_clicked", AnalyticsBehavior.ProcessCheckpoint);

    // if its not a manifest field
    if(!manifest_fields[e.detail.field]){
      let frame;
      switch(e.detail.field){
        case "Manifest":
        case "Service Worker":
          this.thingToAdd = e.detail.displayString;
          this.showConfirmationModal = true;
          return;

        case "Open Manifest Modal":
          frame = this.shadowRoot!.querySelector("manifest-editor-frame");
          (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
          return;

        case "Open SW Modal":
          frame = this.shadowRoot!.querySelector("sw-selector");
          (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
          return;
      }
    }
    return;
  }

  // Function to add a special to do to the action items list that tells the user to retest their site.
  addRetestTodo(toAdd: string){
    if(!this.hasItemBeenAdded(toAdd)) {
      this.allTodoItems.push({"card": "retest", "field": toAdd, "fix": `We've noticed you've updated your ${toAdd}. Make sure to add your new ${toAdd} to your server and retest your site!`, "status": "retest", "displayString": toAdd});
      this.requestUpdate();
    }
  }

  // function to validate whether or not an retest item has already been added to the ToDo list
  hasItemBeenAdded(toAdd: string): boolean {
    var isItemPresent = false;
    for(var toDoItem of this.allTodoItems) {
      if(toDoItem.field == toAdd) {
        isItemPresent = true;
        break;
      }
    }
    return isItemPresent;
  }

  // Rotates the icon on each details drop down to 0 degrees
  rotateZero(card: string, e?: Event){
    recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;
    let target: Node = (e!.target as unknown as Node);
    let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
    let allowed: boolean = false;

    // added this code because the tooltips that exist on the action items emit the sl-show and
    // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
    // so this ensures that the target for rotating is a detail card and not a tooltip.
    for (let i = 0; i < collapsable.length; i++) {
      if (collapsable[i].isEqualNode(target!)) {
        allowed = true;
        break
      }
    }

    if(icon && allowed){
      icon!.style.transform = "rotate(0deg)";
    }
  }

  // Rotates the icon on each details drop down to 90 degrees
  rotateNinety(card: string, e?: Event, init?: boolean){
    recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;

    if(icon && init) {
      icon!.style.transform = "rotate(90deg)";
      return;
    }

    let target: Node = (e!.target as unknown as Node);
    let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
    let allowed: boolean = false;

    // added this code because the tooltips that exist on the action items emit the sl-show and
    // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
    // so this ensures that the target for rotating is a detail card and not a tooltip.
    for (let i = 0; i < collapsable.length; i++) {
      if (collapsable[i].isEqualNode(target!)) {
        allowed = true;
        break
      }
    }

    if(icon && allowed){
      icon!.style.transform = "rotate(90deg)";
    }
  }

  // Sorts the action items list with the required stuff first
  // -1 = a wins
  // 1 = b wins
  sortTodos(){
    let rank: { [key: string]: number } = {
      "retest": 0,
      "missing": 1,
      "required": 2,
      "enhancement": 3,
      "highly recommended": 4,
      "recommended": 5,
      "optional": 6
    };

    // If the manifest is missing more than half of the recommended fields, show those first
    if((this.manifestRecCounter / recommended_fields.length) > .5){
      rank = {
        "retest": 0,
        "missing": 1,
        "required": 2,
        "highly recommended": 3,
        "recommended": 4,
        "enhancement": 5,
        "optional": 6
      };
    }

    this.filteredTodoItems.sort((a, b) => {
      if (rank[a.status] < rank[b.status]) {
        return -1;
      } else if (rank[a.status] > rank[b.status]) {
        return 1;
      } else {
        return a.field.localeCompare(b.field);
      }
    }
    );

    return this.filteredTodoItems;
  }

  // Pages the action items
  paginate() {
    let array = this.sortTodos();
    let itemsOnPage = array.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize);

    let holder = (this.shadowRoot?.querySelector(".todo-items-holder") as HTMLElement);
    if(itemsOnPage.length < this.pageSize && this.pageNumber == 1){
      holder.style.display = 'flex';
      holder.style.flexDirection = 'column';
      holder.style.gridTemplateRows = 'unset';
    } else {
      holder.style.height = '280px;'
      holder.style.display = 'grid';
      holder.style.gridTemplateRows = 'repeat(5, 1fr)';
      holder.style.flexDirection = 'unset';
    }
    return itemsOnPage;
  }

  // Moves to the next window in the action items list
  switchPage(up: boolean){
    if(up && this.pageNumber * this.pageSize < this.filteredTodoItems.length){
      this.pageNumber++;
    } else if(!up && this.pageNumber != 1){
      this.pageNumber--;
    }

    const pageStatus = this.shadowRoot!.getElementById('pageStatus')!;
    const totalPages = Math.ceil(this.filteredTodoItems.length / this.pageSize) // Calculate total pages
    pageStatus.textContent = `Action Items Page ${this.pageNumber} of ${totalPages}`;

    this.requestUpdate();
  }

  // Returns a list that represents the number of dots need for pagination
  getDots(){
    let dots: any[] = [];

    let totalPages = Math.ceil(this.filteredTodoItems.length / this.pageSize);

    for(let i = 0; i < totalPages; i++){
      dots.push("dot");
    }
    return dots;
  }

  // Renders the indicators for each action item
  renderIndicators(){
    let yellow = 0;
    let purple = 0;
    let red = 0;

    this.allTodoItems.forEach((todo: any) => {
      if(todo.status == "required"){
        red++;
      } else if(todo.status == "enhancement"){
        purple++;
      } else if(todo.status === "optional" || todo.status === "recommended") {
        yellow++;
      }
    })

    if(yellow + purple + red != 0){

      let redSelected = this.filterList.includes("required");
      let yellowSelected = this.filterList.includes("recommended");
      let purpleSelected = this.filterList.includes("enhancement");

      let redClassMap = classMap({'indicator' : true, 'selected': redSelected});
      let yellowClassMap = classMap({'indicator' : true, 'selected': yellowSelected});
      let purpleClassMap = classMap({'indicator' : true, 'selected': purpleSelected});

      return html`
      <div id="indicators-holder">
        ${red != 0 ?
          html`<button type="button" class=${redClassMap} data-indicator="required" aria-pressed="${redSelected}" tabindex="0" @click=${(e: Event) => this.filterTodoItems("required", e)}><img src=${redSelected ? stop_white_src : stop_src} alt="invalid result icon"/><p>${red}</p></button>`
          : null
        }
        ${yellow != 0 ?
          html`<button type="button" class=${yellowClassMap} data-indicator="yellow" aria-pressed="${yellowSelected}" tabindex="0" @click=${(e: Event) => this.filterTodoItems("yellow", e)}><img src=${yellowSelected ? yield_white_src : yield_src} alt="yield result icon"/><p>${yellow}</p></button>`
          : null
        }
        ${purple != 0 ?
          html`<button type="button" class=${purpleClassMap} data-indicator="enhancement" aria-pressed="${purpleSelected}" tabindex="0" @click=${(e: Event) => this.filterTodoItems("enhancement", e)}><img src=${purpleSelected ? enhancement_white_src : enhancement_src} alt="enhancement result icon"/><p>${purple}</p></button>`
          : null
        }
      </div>`
    }
    return null;

  }

  // filter todos by severity
  filterTodoItems(filter: string, e: Event){
    e.stopPropagation();

    /* let button = this.shadowRoot!.querySelector('[data-indicator="' + filter + '"]');
    let isPressed = button!.getAttribute("aria-pressed") === "true";
    button!.setAttribute("aria-pressed", isPressed ? "false" : "true"); */

    recordPWABuilderProcessStep(`${filter}_indicator_clicked`, AnalyticsBehavior.ProcessCheckpoint);

    this.pageNumber = 1;

    this.stopShowingNotificationTooltip = true;
    // if its in the list, remove it, else add it
    // yellow means optional and recommended
    if(filter === "yellow"){
      if(this.filterList.includes("optional")){
        this.filterList = this.filterList.filter((x: string) => (x !== "optional") && (x !== "recommended"))
      } else {
        this.filterList.push("optional")
        this.filterList.push("recommended")
      }
    } else if(this.filterList.includes(filter)){
      this.filterList = this.filterList.filter((x: string) => x !== filter)
    } else {
      this.filterList.push(filter)
    }
    // if filter list is empty, show everything
    if(this.filterList.length === 0 ){
      this.filteredTodoItems = this.allTodoItems;
      return;
    }


    this.filteredTodoItems = this.allTodoItems.filter((x: any) => this.filterList.includes(x.status));
  }

//truncate app card discription
  truncateString(str: String) {
    if (str.length > 125) {
      return str.substring(0, 125) + "...";
    } else {
      return str;
    }
  }

  handleShowingTooltip(e: CustomEvent, origin: string, field: string){
    // general counter
    recordPWABuilderProcessStep(`${origin}.tooltip_opened`, AnalyticsBehavior.ProcessCheckpoint);

    field = field.split(" ").join("_");

    //specific field counter
    recordPWABuilderProcessStep(`${origin}.${field}_tooltip_opened`, AnalyticsBehavior.ProcessCheckpoint);

    if(e.detail.entering){
      if(this.openTooltips.length > 0){
        this.openTooltips[0].hide();
        this.openTooltips = [];
      }

      e.detail.tooltip.show();
      this.openTooltips.push(e.detail.tooltip)
    } else {
      e.detail.tooltip.hide();
      this.openTooltips = [];
    }
  }

  closeTooltipOnScroll() {
    if(this.openTooltips.length > 0){
      this.openTooltips[0].hide();
      this.openTooltips = [];
    }
  }

  renderReaddDialog() {
    var dialogContent = html`
      <p>Have you added your new ${this.thingToAdd} to your site?</p>
      <div id="confirmationButtons">
        <sl-button @click=${() => this.retest(true)}> Yes </sl-button>
        <sl-button @click=${() => this.readdDenied = true}> No </sl-button>
      </div>
    `

    if(this.retestConfirmed) {
      dialogContent = html`
        <p>Retesting your site now!</p>
      `;
    }
    else if (this.readdDenied) {
      dialogContent = html`
        <p>Add your new ${this.thingToAdd}, and then we can retest your site. </p>
      `;
    }

    return dialogContent;
  }

  render() {
    return html`
      <app-header .page=${"report"}></app-header>
      <div id="report-wrapper">
        <div id="content-holder">
          <div id="header-row">
          ${this.isAppCardInfoLoading ?
          html`
            <div id="app-card" class="flex-col skeleton-effects">
              <div id="app-card-header" class="skeleton">
                <sl-skeleton id="app-image-skeleton" effect="pulse"></sl-skeleton>
                <div id="card-info" class="flex-col">
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                </div>
                <!-- <sl-skeleton class="app-info-skeleton skeleton-desc" effect="pulse"></sl-skeleton> -->
              </div>
              <div id="app-card-footer">
                <sl-skeleton class="app-info-skeleton-half" effect="pulse"></sl-skeleton>
              </div>
            </div>`
            :
            html`
            <div id="app-card" class="flex-col" style=${this.createdManifest ? styleMap({ backgroundColor: '#ffffff', color: '#757575' }) : styleMap(this.CardStyles)}>
              <div id="app-card-header">
                <div id="app-card-header-col">
                  <div id="pwa-image-holder">
                    ${this.proxyLoadingImage || this.appCard.iconURL.length === 0 ? html`<span class="proxy-loader"></span>` : html`<img src=${this.appCard.iconURL} alt=${this.appCard.iconAlt} />`}
                  </div>
                  <div id="card-info" class="flex-row">
                    <h1 id="site-name">
                      ${this.appCard.siteName}
                      <span class="visually-hidden" aria-live="polite">Report card page for ${this.appCard.siteName}</span>
                    </h1>
                    <p id="site-url">${this.appCard.siteUrl}</p>
                    <p id="app-card-desc" class="app-card-desc-desktop">${this.truncateString(this.appCard.description)}</p>
                  </div>
                  <div id="app-card-share-cta">
                    <button type="button" id="share-button-desktop" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
                    ${this.runningTests ?
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>` :
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
                    } Share score
                    </button>
                  </div>
                </div>
                <div id="app-card-desc-mobile">
                  <p id="app-card-desc">${this.truncateString(this.appCard.description)}</p>
                  <button type="button" id="share-button-mobile" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
                    ${this.runningTests ?
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>` :
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
                    } Share score
                    </button>

                </div>
              </div>
              <div id="app-card-footer">
                ${this.runningTests ? html`
                    <div id="test" class="in-progress">
                      <span>testing in progress</span>
                      <div class="loader-round"></div>
                    </div>
                `:
                  html`
                  <div id="test" style=${styleMap(this.CardStyles)}>
                    <button
                      type="button"
                      id="retest"
                      @click=${() => {
                        this.retest(false);
                      }}>
                      <p id="last-edited" style=${styleMap(this.LastEditedStyles)}>${this.lastTested}</p>

                      <img
                        src=${`/assets/new/retest-icon${this.darkMode ? "_light" : ""}.svg`}
                        alt="retest site"
                      />
                    </button>
                  </div>`
                }
              </div>

            </div>`}
            <div id="app-actions" class="flex-col">
              <div id="package" class="flex-col-center">
                  ${this.canPackage ?
                    html`
                    <button
                      type="button"
                      id="pfs"
                      @click=${() => this.openPublishModal()}
                    >
                      Package For Stores
                    </button>
                    ` :
                    html`
                    <sl-tooltip class="mani-tooltip">
                    ${this.runningTests ?
                      html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>Running tests...</p></div>` :
                      html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /><p>Your PWA is not store ready! Check your To-do-list and handle all required items!</p></div>`}
                        <button
                          type="button"
                          id="pfs-disabled"
                          aria-disabled="true"
                        >
                          ${this.renderPackageSpinner()}
                          Package For Stores
                        </button>
                    </sl-tooltip>
                    `}
                <button type="button" id="test-download" @click=${() => this.openTestPublishModal()} ?disabled=${!this.canPackage || this.createdManifest}>
                  <p class="arrow_link">Download Test Package</p>
                </button>
              </div>
              <div id="actions-footer" class="flex-center">
                <p>Available stores:</p>
                <img
                  title="Windows"
                  src=${`/assets/windows_icon${this.darkMode ? "_light" : ""}.svg`}
                  alt="Windows"
                />
                <img
                  title="iOS"
                  src=${`/assets/apple_icon${this.darkMode ? "_light" : ""}.svg`}
                  alt="iOS" />
                <img
                  title="Android"
                  src=${`/assets/android_icon_full${this.darkMode ? "_light" : ""}.svg`}
                  alt="Android"
                />
                <img
                  title="Meta Quest"
                  src=${`/assets/meta_icon${this.darkMode ? "_light" : ""}.svg`}
                  alt="Meta Quest"
                />
              </div>
            </div>
          </div>

          ${this.showSecurityErrorBanner ?
            html`
              <div class="feedback-holder type-error">
                <img src="/assets/new/stop.svg" alt="invalid result icon" />
                <div class="error-info">
                  <p class="error-title">You do not have a secure HTTPS server</p>
                  <p class="error-desc">PWABuilder has done a basic analysis of your HTTPS setup and has identified required actions before you can package. Check out the documentation linked below to learn more.</p>
                  <div class="error-actions">
                    <a href="https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/04" target="_blank" rel="noopener">Security Documentation</a>
                  </div>
                </div>
              </div>
            ` :
            null
          }

          ${this.showSecurityWarningBanner && !this.showSecurityErrorBanner ?
            html`
              <div class="feedback-holder type-warning">
                <img src="/assets/new/yield.svg" alt="warning result icon" />
                <div class="error-info">
                  <p class="error-title">Mixed content is loading on your PWA</p>
                  <p class="error-desc">PWABuilder has done a basic analysis of your HTTPS setup and has identified that you are delivering mixed resources when your PWA is loading. Check out the documentation linked below to learn more.</p>
                  <div class="error-actions">
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content" target="_blank" rel="noopener">Mixed Content Documentation</a>
                  </div>
                </div>
              </div>
            ` :
            null
          }

          ${this.showServiceWorkerWarningBanner ?
            html`
              <div class="feedback-holder type-warning">
                <img src="/assets/new/yield.svg" alt="warning result icon" />
                <div class="error-info">
                  <p class="error-title">Service worker registration timeout</p>
                  <p class="error-desc">We detected a link to your service worker however, our tests timed out waiting for it to be registered. This can happen for a number of reasons and may even be intentional. To learn more about site load times and when you should be registering your service worker, follow the link below.</p>
                  <div class="error-actions">
                    <a href="https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration" target="_blank" rel="noopener">Service Worker Registration Documentation</a>
                  </div>
                </div>
              </div>
            ` :
            null
          }

              ${this.showIconsErrorBanner ?
            html`
                  <div class="feedback-holder type-error">
                  <img src="/assets/new/stop.svg" alt="invalid result icon" />
                    <div class="error-info">
                      <p class="error-title">Manifest icons could not be fetched</p>
                      <p class="error-desc">PWABuilder has done a basic analysis of the manifest images and has identified required actions before you can package. Check out the documentation linked below to learn more.</p>
                      <div class="error-actions">
                        <a href="https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/03" target="_blank" rel="noopener">Manifest Documentation</a>
                      </div>
                    </div>
                  </div>
                ` :
            null
          }

          <div id="todo">
            <div
              id="todo-detail"
              >
              <div id="todo-summary">
                <div id="todo-summary-left">
                  <h2>Action Items</h2>
                </div>
                <div id="todo-indicators">
                    ${this.allTodoItems.length > 0 ?
                      this.stopShowingNotificationTooltip ?
                        // if they interact with the inicators, we no longer need to show the tooltip
                        this.renderIndicators() :

                        // showing tooltip until they click an indicator which will remove the tooltip
                        html`
                          <sl-tooltip class="mani-tooltip" id="notifications" ?open=${this.closeOpenTooltips}>
                            <div slot="content" class="mani-tooltip-content">
                              <img src="/assets/new/waivingMani.svg" alt="Waiving Mani" />
                              <p class="mani-tooltip-p"> Filter through notifications <br> as and when you need! </p>
                            </div>
                            ${this.renderIndicators()}
                          </sl-tooltip>
                        `
                      :
                      null}
                </div>
              </div>
              <div class="todo-items-holder">
                ${this.filteredTodoItems.length > 0 ? this.paginate().map((todo: any) =>
                    html`
                      <todo-item
                        .status=${todo.status}
                        .field=${todo.field}
                        .fix=${todo.fix}
                        .card=${todo.card}
                        .displayString=${todo.displayString}
                        @todo-clicked=${(e: CustomEvent) => this.animateItem(e)}
                        @open-manifest-editor=${(e: CustomEvent) => this.openManifestEditorModal(e.detail.field, e.detail.tab)}
                        @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e, "action_items", todo.field)}
                      >

                      </todo-item>`
                  ) : html`<span class="loader"></span>`}
              </div>
            ${(this.filteredTodoItems.length > this.pageSize) ?
              html`
              <div id="pagination-actions">
                <button
                  class="pagination-buttons"
                  name="action-items-previous-page-button"
                  aria-label="Previous page button for action items list"
                  type="button"
                  @click=${() => this.switchPage(false)}
                  ><sl-icon class="pageToggles" name="chevron-left"></sl-icon>
                </button>
                <div id="dots">
                  ${this.getDots().map((_dot: any, index: number) =>
                    this.pageNumber == index + 1 ?
                      html`
                        <img src="/assets/new/active_dot.svg" alt="active dot" />
                      ` :
                      html`
                        <img src="/assets/new/inactive_dot.svg" alt="inactive dot" />
                      `)}
                </div>
                <button
                  class="pagination-buttons"
                  name="action-items-next-page-button"
                  aria-label="Next page button for action items list"
                  aria-live="polite"
                  type="button"
                  @click=${() => this.switchPage(true)}><sl-icon class="pageToggles" name="chevron-right"></sl-icon>
                </button>
              </div>` : null}
              <div id="pageStatus" aria-live="polite" aria-atomic="true"></div>
            </div>
          </div>

          <div id="manifest" class="flex-col">
            <div id="manifest-header">
              <div id="mh-content">
                <div id="mh-text" class="flex-col">
                  <h2 class="card-header">Manifest</h2>
                  ${this.manifestDataLoading ?
                    html`
                      <div class="flex-col gap">
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                      </div>
                    ` :
                    html`
                    <p class="card-desc">
                      ${this.decideMessage(this.manifestValidCounter, this.manifestTotalScore, "manifest")}
                    </p>
                  `}
                </div>
              </div>

              <div id="mh-right">
                ${this.manifestDataLoading ?
                    html`<div class="loader-round large"></div>` :
                    html`<sl-progress-ring
                            id="manifestProgressRing"
                            class=${classMap(this.decideColor("manifest"))}
                            value="${this.createdManifest ? 0 : (parseFloat(JSON.stringify(this.manifestValidCounter)) / this.manifestTotalScore) * 100}"
                          >${this.createdManifest ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing manifest requirements" />` : html`<div>${this.manifestValidCounter} / ${this.manifestTotalScore}</div>`}</sl-progress-ring>`
                }
              </div>
              <div id="mh-actions" class="flex-col">
                ${this.manifestDataLoading ?
                  html`
                    <div class="flex-col gap">
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                    </div>
                  ` :
                  html`
                    ${this.createdManifest ?
                    html`
                        <sl-tooltip class="mani-tooltip" ?open=${this.closeOpenTooltips}>
                          <div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>We did not find a manifest on your site before our tests timed out so we have created a manifest for you! <br> Click here to customize it!</p></div>
                          <button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>
                        </sl-tooltip>` :
                    html`<button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>`
                    }

                    <a
                      class="arrow_anchor"
                      href="https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests"
                      rel="noopener"
                      target="_blank"
                      @click=${() => recordPWABuilderProcessStep("manifest_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}
                    >
                      <p class="arrow_link">Manifest Documentation</p>
                      <img
                        src="/assets/new/arrow.svg"
                        alt="arrow"
                      />
                    </a>
                `}

                </div>
            </div>
            <sl-details
              id="mani-details"
              class="details"
              ?disabled=${this.manifestDataLoading}
              @sl-show=${(e: Event) => this.rotateNinety("mani-details", e)}
              @sl-hide=${(e: Event) => this.rotateZero("mani-details", e)}
              >
              ${this.manifestDataLoading ? html`
              <div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` :
              html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="mani-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>
              <div id="manifest-detail-grid">
                <div class="detail-list">
                  <p class="detail-list-header">Required</p>

                  ${this.requiredMissingFields.length > 0 ?
                  html`
                    ${this.requiredMissingFields.map((field: string) =>
                    html`<div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${stop_src} alt="invalid result icon"/>
                          </sl-tooltip>
                      <p>Manifest includes ${field} field</p>
                    </div>`
                    )}
                  ` :
                  null}

                  ${this.validationResults.map((result: Validation) => result.category === "required" || (result.testRequired && !result.valid) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`<sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                                <img src=${stop_src} alt="invalid result icon"/>
                              </sl-tooltip>`
                      }
                      <p>${result.displayString}</p>
                    </div>
                  ` :
                  null)}
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Recommended</p>
                  ${this.recMissingFields.length > 0 ?
                  html`
                    ${this.recMissingFields.map((field: string) =>
                    html`<div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                      <p>Manifest includes ${field} field</p>
                    </div>`
                    )}
                  ` :
                  null}
                  ${this.validationResults.map((result: Validation) => result.category === "recommended"  && ((result.testRequired && result.valid) || !result.testRequired) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`<sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                                <img src=${yield_src} alt="yield result icon"/>
                              </sl-tooltip>
                        `}
                      <p>${result.displayString}</p>
                    </div>
                  ` : null)}
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Optional</p>
                  ${this.optMissingFields.length > 0 ?
                  html`
                    ${this.optMissingFields.map((field: string) =>
                    html`
                        <div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                          <p>Manifest includes ${field} field</p>
                        </div>`
                    )}
                  ` :
                  null}

                  ${this.validationResults.map((result: Validation) => result.category === "optional" && ((result.testRequired && result.valid) || !result.testRequired) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`
                          <sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                        `}
                      <p>${result.displayString}</p>
                    </div>
                  ` : null)}
                </div>
              </div>`}
            </sl-details>
          </div>

          <div id="two-cell-row">
            <div id="sw" class="half-width-cards">
              <div id="sw-header" class="flex-col">
                <div id="swh-top">
                  <div id="swh-text" class="flex-col">
                    <h2 class="card-header">Service Worker</h2>
                    ${this.swDataLoading ?
                      html`
                        <div class="flex-col gap">
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        </div>
                      ` :
                      html`
                        <p class="card-desc">
                          ${this.decideMessage(this.swValidCounter, this.swTotalScore, "sw")}
                        </p>
                      `
                        }
                  </div>
                  ${this.swDataLoading ?
                    html`<div class="loader-round large"></div>` :
                    html`<sl-progress-ring
                      id="swProgressRing"
                      class="counterRing"
                      value="${this.swValidCounter > 0 ? 100 : 0}"
                      >+${this.swValidCounter}
                    </sl-progress-ring>
                    `
                  }
                </div>
                  <div class="icons-holder sw">
                    ${this.serviceWorkerResults.map((result: any) =>
                      html`
                        <div class="icon-and-name"  @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e, "service_worker", result.member)}>
                          <sw-info-card .field=${result.member}>
                            <div class="circle-icon" tabindex="0" role="button" slot="trigger">
                              <img class="circle-icon-img" src="${"/assets/new/" + result.member + '_icon.svg'}" alt="${this.formatSWStrings(result.member) + ' icon'}" />
                              ${result.result ? html`<img class="valid-marker" src="${valid_src}" alt="valid result indicator" />` : null}
                            </div>
                          </sw-info-card>
                          <p>${this.formatSWStrings(result.member)}</p>
                        </div>
                      `
                      )
                    }
                  </div>
                <div id="sw-actions" class="flex-col">
                  ${this.swDataLoading ?
                  html`
                    <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                  ` :
                  html`
                    <button type="button" class="alternate" @click=${() => this.openSWSelectorModal()}>
                      Generate Service Worker
                    </button>
                  `}

                  ${this.swDataLoading ?
                    html`
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                    ` :
                    html`
                      <a
                        class="arrow_anchor"
                        rel="noopener"
                        target="_blank"
                        href="https://docs.pwabuilder.com/#/home/sw-intro"
                        @click=${() => recordPWABuilderProcessStep("sw_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                        <p class="arrow_link">Service Worker Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                    `
                  }

                </div>
              </div>

            </div>
            <div id="security" class="half-width-cards">
              <div id="sec-header" class="flex-col">
                <div id="sec-top">
                  <div id="sec-text" class="flex-col">
                    <h2 class="card-header">App Capabilities</h2>
                    ${this.manifestDataLoading ?
                      html`
                        <div class="flex-col gap">
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        </div>
                      ` :
                      html`
                        <p class="card-desc">
                          PWABuilder has analyzed your PWA and has identified some app capabilities that could enhance your PWA
                        </p>
                      `
                        }
                  </div>
                  ${this.manifestDataLoading ?
                    html`<div class="loader-round large"></div>` :
                    html`<sl-progress-ring class="counterRing" value="${this.enhancementTotalScore > 0 ? 100 : 0}">+${this.enhancementTotalScore}</sl-progress-ring>
                    `
                  }

                </div>
                <div class="icons-holder">
                  ${this.validationResults.map((result: Validation) => result.category === "enhancement" ?
                    html`
                      <div class="icon-and-name" @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e, "app_caps", result.member)} @open-manifest-editor=${(e: CustomEvent) => this.openManifestEditorModal(e.detail.field, e.detail.tab)}>
                        <manifest-info-card .field=${result.member} .placement=${"bottom"}>
                          <div class="circle-icon" tabindex="0" role="button" slot="trigger">
                            <img class="circle-icon-img" src="${"/assets/new/" + result.member + '_icon.svg'}" alt="${this.formatSWStrings(result.member) + ' icon'}" />
                            ${result.valid ? html`<img class="valid-marker" src="${valid_src}" alt="valid result indicator" />` : null}
                          </div>
                        </manifest-info-card>
                        <p>${this.formatSWStrings(result.member)}</p>
                    </div>
                    `
                    : null )
                  }
                </div>
                ${this.manifestDataLoading ?
                  html`<sl-skeleton class="desc-skeleton half" effect="pulse"></sl-skeleton>` :
                  html`<arrow-link .link=${"https://docs.pwabuilder.com/#/builder/manifest"} .text=${"App Capabilities documentation"}></arrow-link>`
                }
              </div>
            </div>
          </div>
        </div>
      </div>


      <sl-dialog class="dialog" ?open=${this.showConfirmationModal} @sl-hide=${() => {this.showConfirmationModal = false; this.readdDenied = false;}} noHeader>
        ${this.renderReaddDialog()}
      </sl-dialog>

      <share-card
        .manifestData=${`${this.manifestValidCounter}/${this.manifestTotalScore}/${this.getRingColor("manifest")}/Manifest`}
        .swData=${`${this.swValidCounter}/purple/Service Worker`}
        .enhancementsData=${`${this.enhancementTotalScore}/purple/App Capabilities`}
        .siteName=${this.appCard.siteName}
      > </share-card>

      <publish-pane></publish-pane>
      <test-publish-pane></test-publish-pane>
      ${this.manifestDataLoading ? null : html`<manifest-editor-frame .isGenerated=${this.createdManifest} .startingTab=${this.startingManifestEditorTab} .focusOn=${this.focusOnME} @readyForRetest=${() => this.addRetestTodo("Manifest")}></manifest-editor-frame>`}
      <sw-selector @readyForRetest=${() => this.addRetestTodo("Service Worker")}></sw-selector>

    `;
  }

  renderPackageSpinner(): TemplateResult {
    const visibleClass = this.runningTests ? '' : 'd-none';
    return html`
      <sl-spinner class="${visibleClass}"></sl-spinner>
    `;
  }
}

