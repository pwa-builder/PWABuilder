import { Manifest, Validation, enhanced_fields, enhancement_goals, optional_fields, recommended_fields, reportMissing, required_fields, validateManifest } from "@pwabuilder/manifest-validation";
import { createManifestContextFromEmpty, fetchOrCreateManifest } from "../../services/manifest";
import { Icon, ManifestContext } from "../../utils/interfaces";
import { resolveUrl } from "../../utils/url";
import { testSecurity } from "../../services/tests/security";
import { testServiceWorker } from "../../services/tests/service-worker";

// Polling function that updates the time that the site was last tested
export function pollLastTested(){
  let last = new Date(JSON.parse(sessionStorage.getItem('last_tested')!));
  let now = new Date();
  let diff = now.getTime() - last.getTime();

  let lastTested = "";

  if(diff < 60000){
    lastTested = "Last tested seconds ago";
  } else if (diff < 3600000) {
    let mins = Math.floor(diff / 60000);
    lastTested = "Last tested " + mins + " minutes ago";
  } else if (diff < 86400000) {
    let hours = Math.floor(diff / 3600000);
    lastTested = "Last tested " + hours + " hours ago";
  } else {
    let days = Math.floor(diff / 86400000);
    lastTested = "Last tested " + days + " days ago";
  }
  return lastTested;
}

// Fetches the sites manifest from the URL
// If it's missing it creates one and sets a flag
// If it's there then it saves it to sessionStorage
export async function getManifest(url: string): Promise<ManifestContext> {
  
  let manifestContext: ManifestContext | undefined;

  manifestContext = await fetchOrCreateManifest(url);

  if(!manifestContext){
    manifestContext = await createManifestContextFromEmpty(url);
  }

  return manifestContext!;
}

// Populates the "App Card" from the manifest.
// Uses the URL for loading the image.
export async function populateAppCard(manifestContext: ManifestContext, url: string) {
  let cleanURL = url.replace(/(^\w+:|^)\/\//, '')

  let appCard = {
    siteName: "Missing Name",
    siteUrl: cleanURL,
    description: "Your manifest description is missing.",
    iconURL: "/assets/new/icon_placeholder.png",
    iconAlt: "A placeholder for you sites icon"
  };

  if (manifestContext && !manifestContext.isGenerated) {
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
      iconUrl = iconSrcListParse(chosenIcon, manifestContext);
    } else {
      iconUrl = "/assets/icons/icon_512.png"
    }

    await testImage(iconUrl).then(
      function fulfilled(_img: any) {
        //console.log('That image is found and loaded', img);
      },

      function rejected() {
        //console.log('That image was not found');
        iconUrl = `https://pwabuilder-safe-url.azurewebsites.net/api/getSafeUrl?url=${iconUrl}`;
      }
    );

    appCard = {
      siteName: parsedManifestContext.manifest.short_name
        ? parsedManifestContext.manifest.short_name
        : (parsedManifestContext.manifest.name ? parsedManifestContext.manifest.name : 'Untitled App'),
      siteUrl: cleanURL,
      iconURL: iconUrl,
      iconAlt: "Your sites logo",
      description: parsedManifestContext.manifest.description
        ? parsedManifestContext.manifest.description
        : 'Add an app description to your manifest',
    }
  }
  return appCard;
}

// Gets full icon URL from manifest given a manifest icon object
function iconSrcListParse(icon: any, manifestContext: ManifestContext) {
  let manifest = manifestContext.manifest;
  let manifestURL = manifestContext.manifestUrl;
  let iconURL: string = handleImageUrl(icon, manifest, manifestURL) || '';

  return iconURL;
}

// Makes sure the icon URL is valid
function handleImageUrl(icon: Icon, manifest: Manifest, manifestURL: string) {
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

// Tests if an image will load
// If it fails, we use our proxy service to fetch it
// If it succeeds, we load it
function testImage(url: string) {

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

// Tests the Manifest and populates the manifest card detail dropdown
export async function runManifestTests(manifestContext: ManifestContext) {
  //add manifest validation logic
  // note: wrap in try catch (can fail if invalid json)
  
  let manifest = manifestContext.manifest;
  
  // TO RETURN
  let todoItems = [];

  // TO RETURN
  let manifestBreakdown = {
    valid: 0,
    total: 0,
    failedRequired: 0,
    failedRecommended: 0,
    failedEnhancement: 0,
    canPacakge: false
  }

  let validationResults: Validation[] = [];

  if(!manifestContext.isGenerated){
    manifest = JSON.parse(sessionStorage.getItem("PWABuilderManifest")!).manifest;
    validationResults = await validateManifest(manifest);

    sessionStorage.setItem(
      'manifest_tests',
      JSON.stringify(validationResults)
    );

    //  This just makes it so that the valid things are first
    // and the invalid things show after.
    validationResults.sort((a:  Validation, b: Validation) => {
      if(a.valid && !b.valid){
        return 1;
      } else if(b.valid && !a.valid){
        return -1;
      } else {
        return a.member.localeCompare(b.member);
      }
    });

    manifestBreakdown.total = validationResults.length;

    validationResults.forEach((test: Validation) => {
      if(test.valid){
        manifestBreakdown.valid++;
      } else {
        let status = test.category;
        if(test.category === "required" || test.testRequired){
          manifestBreakdown.failedRequired++;
        } else if(test.category === "recommended"){
          manifestBreakdown.failedRecommended++;
        } else if(test.category === "desktop_enhancement"){
          manifestBreakdown.failedEnhancement++;
        } else {
        }
        todoItems.push({"card": "mani-details", "field": test.member, "displayString": test.displayString ?? "", "fix": test.errorString, "status": status});
        
      }
    });
  } else {
    manifest = {};
    todoItems.push({"card": "mani-details", "field": "Open Manifest Modal", "fix": "Edit and download your created manifest (Manifest not found before detection tests timed out)", "status": "required"});
  }
  
  // Update vars after accessing the missing fields
  let missingResults = await handleMissingFields(manifestContext, todoItems, manifestBreakdown);

  manifestBreakdown.total += missingResults.num_missing;

  manifestBreakdown = missingResults.manifestBreakdown;
  todoItems = missingResults.todoItems;

  manifestBreakdown.canPacakge = manifestBreakdown.failedRequired == 0;

  return {
    todoItems: todoItems,
    manifestBreakdown: manifestBreakdown,
    missingFields: missingResults.missingFields,
    validationResults: validationResults
  }
}

// If some manifest fields are missing it adds it to the drop down and returns the number that were missing
async function handleMissingFields(manifestContext: ManifestContext, todoItems: any[], manifestBreakdown: any){
  let manifest = manifestContext.manifest;
  let missing = await reportMissing(manifest);

  let requiredMissingFields: string[] = [];
  let recMissingFields: string[] = [];
  let optMissingFields: string[] = [];
  let enhMissingFields: string[] = [];

  missing.forEach((field: string) => {
    let status = "";
    if(required_fields.includes(field)){
      requiredMissingFields.push(field);
      manifestBreakdown.failedRequired++;
      todoItems.push({"card": "mani-details", "field": field, "fix": `Add ${field} to your manifest`, status: "required"})
    } else if(recommended_fields.includes(field)){
      recMissingFields.push(field);
      manifestBreakdown.failedRecommended++;
      status = "recommended";
    } else if(optional_fields.includes(field)){
      optMissingFields.push(field)
      status = "optional";
    } else if(enhanced_fields.includes(field)){
      enhMissingFields.push(field)
      status = "desktop_enhancement";
    }

    let fix = '';
    if(status === "desktop_enhancement"){
      fix = enhancement_goals[field];
    } else {
      fix = `Add ${field} to your manifest`;
    }

    if(!manifestContext.isGenerated && !required_fields.includes(field)){
      todoItems.push({"card": "mani-details", "field": field, "fix": fix, status: status})
    }
  });
  let num_missing = missing.length;
  return {
    num_missing: num_missing,
    manifestBreakdown: manifestBreakdown,
    todoItems: todoItems,
    missingFields: {
      requiredMissingFields: requiredMissingFields,
      recMissingFields: recMissingFields,
      optMissingFields: optMissingFields,
      enhMissingFields: enhMissingFields
    }
  }
}

// Tests the Security and populates the Security card detail dropdown 
export async function runSecurityTests(url: string) {
  //Call security tests

  const securityResults: any = await testSecurity(url);

  let failedFields: string[] = []
  
  securityResults.forEach((result: any) => {
    if(!result.result) {
      failedFields.push(result.infoString)
    }
  })

  let securityBreakDown = {
    canPackage: false,
    failedFields: failedFields
  };

  securityBreakDown.canPackage = securityBreakDown.failedFields.length == 0;

  //save security tests in session storage
  sessionStorage.setItem('security_tests', JSON.stringify(securityResults));
  
  return {
    securityResults: securityResults,
    securityBreakDown: securityBreakDown
  }
}

// Tests the SW and populates the SW card detail dropdown
export async function runSWTests(url: string) {
  //call service worker tests
  
  let swBreakdown = {
    valid: 0,
    total: 0,
    failedRequired: 0,
    failedRecommended: 0
  }

  let missing = false;

  let todoItems: any[] = [];

  const serviceWorkerTestResults = await testServiceWorker(url);

  serviceWorkerTestResults.forEach((result: any) => {
    if(result.result){
      swBreakdown.valid++;
    } else {
      let status = "";
      let card = "sw-details";
      if(result.category === "highly recommended"){
        missing = true;
        status = "highly recommended";
        swBreakdown.failedRequired++;
        todoItems.push({"card": card, "field": "Open SW Modal", "fix": "Add Service Worker to Base Package (SW not found before detection tests timed out)", "status": status});
      } else if(result.category === "recommended"){
        status = "recommended";
        swBreakdown.failedRecommended++;
      } else {
        status = "optional";
      }

      if(!missing){
        todoItems.push({"card": card, "field": result.infoString, "fix": result.infoString, "status": status});
      } 
    }
  })

  swBreakdown.total = serviceWorkerTestResults.length;

  //save serviceworker tests in session storage
  sessionStorage.setItem(
    'service_worker_tests',
    JSON.stringify(serviceWorkerTestResults)
  );

  return {
    testResults: serviceWorkerTestResults,
    swBreakdown: swBreakdown,
    todoItems: todoItems
  }
}