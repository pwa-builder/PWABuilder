import * as zip from "@zip.js/zip.js";

import { WindowsOptions } from "./interfaces/windowsOptions";

function log(...args: any[]) {
    console.log("PWA Builder Extension:", ...args);
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidHttpsUrl(str: string) {
    let url;
    
    try {
        url = new URL(str);
    } catch (_) {
        return false;  
    }

    return url.protocol === "https:";
}

async function loadExtension() {

    log('Loading extension...');

    const partnerCenterRegex = /https:\/\/partner\.microsoft\.com\/[\w-]+\/dashboard\/products\/(\w+)\/submissions\/\d+\/packages/g;
    const match = partnerCenterRegex.exec(window.location.href);
    
    if (!match || match.length <= 1) {
        log('Not on packaging page');
        return;
    }
    
    let header = document.querySelector('.page-title-header');
    
    let currentDelay = 0
    while (!header && currentDelay < 10) {
        await delay(1000);
        currentDelay++;
        header = document.querySelector('.page-title-header');
    }
    
    let ourForm = document.querySelector("div[data-pwa-form]") as HTMLDivElement;
    const packageName = match[1];   
    
    if (ourForm) {
        return;
    }
    
    ourForm = document.createElement('div');
    ourForm.dataset.pwaForm = 'true';
    
    ourForm.innerHTML = `
        <style>
            .pwa-builder-fieldset {
                display: flex;
                flex-direction: column;
                margin-top: 10px;
            }
            .pwa-builder-header {
                margin-top: 10px;
            }

            .pwa-builder-input {
                margin-bottom: 10px;
            }

            .pwa-builder-form button {
                max-width: 250px;
            }

            .pwa-builder-form input {
                max-width: 730px;
            }

            .pwa-builder-hidden {
                display: none ;
            }
        </style>
        <h4 class="pwa-builder-header">Package a Progressive Web App (PWA)</h4>
        <div>
            You can package and upload a PWA directly from here by entering the URL of your app. (ex: https://webboard.app). <a href="https://pwabuilder.com" target="_blank">Learn more</a>
        </div>
        <form class="pwa-builder-form" onsubmit="return false;">
            <fieldset class="pwa-builder-fieldset">
                <input class="pwa-builder-input" 
                        type="url" 
                        name="url" 
                        pattern="https://.*"
                        required
                        placeholder="Enter the URL to your PWA (ex: https://webboard.app)"></input>
                <button>Package and Upload PWA package</button>
            </fieldset>
        </div>
        <div class="pwa-builder-loading pwa-builder-hidden">
            This part is hidden
        </div>
    `;

    const input = ourForm.querySelector('input') as HTMLInputElement;
    const loadingDiv = ourForm.querySelector('.pwa-builder-loading');
    const form = ourForm.querySelector('.pwa-builder-form');
    const formSet = ourForm.querySelector('.pwa-builder-fieldset') as HTMLFieldSetElement;


    form?.addEventListener('submit', async () => {
        const url = input.value;
        if (!url || !isValidHttpsUrl(url)) {
            console.log("url is not a valid https url");
            return;
        }

        log('Trying to package', url);

        formSet.disabled = true;
        loadingDiv!.textContent = "Generating package...";
        loadingDiv!.classList.remove('pwa-builder-hidden');

        const publisherDataResponse = await fetch("https://partner.microsoft.com/dashboard/packages/api/pkg/v2.0/packageidentities?productbigid=" + packageName);
        const publisherData = await publisherDataResponse.json();
        
        log('Publisher data fetched', publisherData);
        
        let nameList = publisherData.Name.split('.');
        let name = nameList[nameList.length - 1];

        // TODO for version
        // we should provide option for dev to enter version
        // but we can also be smart and use the partner center api to see what package versions are already submitted 
        // and generate a new version that's higher
        // https://partner.microsoft.com/dashboard/packages/api/pkg/v2.0/packagesets?productId=9PGB0X13X6QZ&submissionId=1152921505694665183&select=Validations
        
        const windowsOptions: WindowsOptions = {
            url,
            name,
            packageId: publisherData.Name,
            version: "1.0.0",
            allowSigning: true,
            classicPackage: {
                generate: false,
                version: "1.0.0"
            },
            publisher: {
                displayName: publisherData.PublisherDisplayName,
                commonName: publisherData.Publisher,
            }
        }
            
        try {
            const packageResponse = await fetch("https://pwabuilder-winserver.centralus.cloudapp.azure.com/msix/generatezip", {
                method: "POST",
                body: JSON.stringify(windowsOptions),
                headers: new Headers({ "content-type": "application/json" }),
            });
            if (packageResponse) {
                log('App Packaged and received');
                const data = await packageResponse.blob();
                
                const blobReader = new zip.ZipReader(new zip.BlobReader(data));
                const entries = await blobReader.getEntries();
                
                if (entries.length > 0) {
                    log('Package unzipped');

                    const uploader = document.querySelector('input[type="file"]') as HTMLInputElement;
                    const bundles = entries.filter(entry => entry.filename.endsWith('.msixbundle'));
                    if (bundles.length > 0) {
                        log('Found .msixbundle file');
                        loadingDiv!.textContent = "Uploading package...";
                        const bundle = bundles[0];
                        const bundleBlob: Blob = await (bundle as any).getData(new zip.BlobWriter());
                        
                        let file = new File([bundleBlob], bundle.filename);
                        let container = new DataTransfer();
                        container.items.add(file);
                        uploader.files = container.files;
                        uploader.dispatchEvent(new Event('change'));
                        log('File passed to partner center uploader');
                    }
                }
            }
        } catch (err) {
            log("Error fetching package from PWA Builder service", err);
        }

        formSet.disabled = false;
        loadingDiv!.classList.add('pwa-builder-hidden');
    });

    header?.appendChild(ourForm);
    log('Extension loaded...');
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request && request.urlChanged) {
        log('navigated to packages page');
        loadExtension();
    }

    sendResponse(true);
});

loadExtension();