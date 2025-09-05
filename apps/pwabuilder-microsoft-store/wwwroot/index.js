const simpleBtn = document.querySelector("#simpleBtn");
const actionsBtn = document.querySelector("#actionsBtn");
const publisherBtn = document.querySelector("#publisherBtn");
const imagesBtn = document.querySelector("#imagesBtn");
const edgeHtmlBtn = document.querySelector("#edgeHtmlBtn");
const widgetsBtn = document.querySelector("#widgetsBtn");
const kitchenSinkBtn = document.querySelector("#kitchenSinkBtn");

const codeArea = document.querySelector("textarea");
const submitBtn = document.querySelector("#submitBtn");
const resultsDiv = document.querySelector("#results");
const spinner = document.querySelector(".spinner-border");

// Action manifest file upload elements
const actionManifestFile = document.querySelector("#actionManifestFile");
const fileStatus = document.querySelector("#fileStatus");
const clearFileBtn = document.querySelector("#clearFileBtn");

// Track the file content
let webActionManifestContent = null;

simpleBtn.addEventListener("click", () => setCode(getSimpleMsix()));
actionsBtn.addEventListener("click", () => setCode(getActionsMsix()));
publisherBtn.addEventListener("click", () => setCode(getPublisherMsix()));
imagesBtn.addEventListener("click", () => setCode(getImagesArgsMsix()));
edgeHtmlBtn.addEventListener("click", () => setCode(getEdgeHtmlMsix()));
widgetsBtn.addEventListener("click", () => setCode(getWidgetsMsix()));
kitchenSinkBtn.addEventListener("click", () => setCode(getKitchenSinkMsix()));
submitBtn.addEventListener("click", () => submit());

// Handle file upload and clearing
actionManifestFile.addEventListener("change", handleFileSelect);
clearFileBtn.addEventListener("click", clearFileSelection);

setCode(getSimpleMsix());
codeArea.scrollTop = 0;

function setCode(options) {
    const code = JSON.stringify(options, undefined, 4);
    codeArea.value = code;
    codeArea.scrollTop = 1000000;
}

// Handle file selection for web action manifest
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Validate JSON content
                JSON.parse(e.target.result);
                webActionManifestContent = e.target.result;
                fileStatus.textContent = `File loaded: ${file.name} (${formatFileSize(file.size)})`;
                fileStatus.classList.remove("text-danger");
                fileStatus.classList.add("text-success");
                
                // Update the file input label
                const fileLabel = document.querySelector(".custom-file-label");
                fileLabel.textContent = file.name;
                
                // Update the current JSON in the textarea to include the file
                updateJsonWithFile();
            } catch (error) {
                fileStatus.textContent = "Error: Invalid JSON file";
                fileStatus.classList.remove("text-success");
                fileStatus.classList.add("text-danger");
                webActionManifestContent = null;
            }
        };
        reader.readAsText(file);
    }
}

// Clear the selected file
function clearFileSelection() {
    actionManifestFile.value = "";
    webActionManifestContent = null;
    fileStatus.textContent = "No file selected";
    fileStatus.classList.remove("text-success", "text-danger");
    
    // Reset the file input label
    const fileLabel = document.querySelector(".custom-file-label");
    fileLabel.textContent = "Choose file";
    
    // Update the JSON to remove the file reference
    updateJsonWithFile();
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " bytes";
    } else if (bytes < 1048576) {
        return (bytes / 1024).toFixed(1) + " KB";
    } else {
        return (bytes / 1048576).toFixed(1) + " MB";
    }
}

// Update the current JSON with the selected file content
function updateJsonWithFile() {
    try {
        const currentJson = JSON.parse(codeArea.value);
        
        if (webActionManifestContent) {
            // If we have file content, add it to the JSON
            currentJson.windowsActions = { manifestFile: webActionManifestContent };
        } else {
            // If no file content, remove the property if it exists
            if (currentJson.windowsActions?.manifestFile && !currentJson.windowsActions.manifestFile.startsWith("http")) {
                delete currentJson.windowsActions.manifestFile;
            }
        }
        
        setCode(currentJson);
    } catch (error) {
        console.error("Error updating JSON with file:", error);
    }
}

function getSimpleMsix() {
    // This creates an unsigned package. Should be considered the bare minimum.
    return {
        name: "Webboard",
        packageId: "JustinWillis.Webboard",
        url: "https://webboard.app",
        version: "1.0.1",
        allowSigning: true,
        classicPackage: {
            generate: true,
            version: "1.0.0"
        }
    };
}

function getActionsMsix() {
    const options = getSimpleMsix();
    options.windowsActions= { manifest: "https://gist.githubusercontent.com/JudahGabriel/6aa27a8cd9cd95d71ea679c73f11a89c/raw/0a5662ef3cd438a5047c7039c3d3f9836d8f7c08/ActionsManifest.json" };
    return options;
}

function getPublisherMsix() {
    const options = getSimpleMsix();
    options.publisher = {
        displayName: "Webboard, Inc.",
        commonName: "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
    };
    return options;
}

function getImagesArgsMsix() {
    const options = getSimpleMsix();
    options.images = options.images = {
        baseImage: "https://webboard.app/icons/android/android-launchericon-512-512.png",
        backgroundColor: "transparent",
        padding: 0.3,
        splashScreen: {
            image: "/images/620x300.png",
            image125: "/images/775x375.png",
            image150: "/images/930x450.png",
            image200: "/images/1280x600.png",
            image400: "/images/2480x1200.png"
        },
        appIcon: {
            image: "/images/44x44.png",
            image125: "/images/55x55.png",
            image150: "/images/66x66.png",
            image200: "/images/88x88.png",
            image400: "/images/176x176.png"
        },
        smallTile: {
            image: "/images/71x71.png",
            image125: "/images/89x89.png",
            image150: "/images/107x107.png",
            image200: "/images/142x142.png",
            image400: "/images/284x284.png"
        },
        mediumTile: {
            image: "/images/150x150.png",
            image125: "/images/188x188.png",
            image150: "/images/255x255.png",
            image200: "/images/300x300.png",
            image400: "/images/600x600.png"
        },
        largeTile: {
            image: "/images/310x310.png",
            image125: "/images/388x388.png",
            image150: "/images/465x465.png",
            image200: "/images/620x620.png",
            image400: "/images/1240x1240.png"
        },
        wideTile: {
            image: "/images/310x150.png",
            image125: "/images/388x188.png",
            image150: "/images/465x225.png",
            image200: "/images/620x300.png",
            image400: "/images/1240x600.png"
        },
        storeLogo: {
            image: "/images/50x50.png",
            image125: "/images/63x63.png",
            image150: "/images/75x75.png",
            image200: "/images/100x100.png",
            image400: "/images/200x200.png"
        },
        appIcon16: {
            image: "/images/16x16.png",
            imageLightTheme: "/images/light-16x16.png",
            imageUnplated: "/images/unplated-16x16.png"
        },
        appIcon24: {
            image: "/images/24x24.png",
            imageLightTheme: "/images/light-24x24.png",
            imageUnplated: "/images/unplated-24x24.png"
        },
        appIcon48: {
            image: "/images/48x48.png",
            imageLightTheme: "/images/light-48x48.png",
            imageUnplated: "/images/unplated-48x48.png"
        },
        appIcon256: {
            image: "/images/256x256.png",
            imageLightTheme: "/images/light-256x256.png",
            imageUnplated: "/images/unplated-256x256.png"
        }
    };
    return options;
}

function getEdgeHtmlMsix() {
    const options = getSimpleMsix();
    options.edgeHtmlPackage = {
        generate: true,
        version: "1.0.1",
        url: "https://webboard.app/?v=legacy-edgehtml",
        urlsWithWindowsRuntimeAccess: [
            "https://webboard.app/*"
        ]
    };
    options.generateModernPackage = false;
    delete options.classicPackage;
    delete options.allowSigning;
    return options;
}

function getWidgetsMsix() {
    return {
        name: "Sample.Widgets",
        packageId: "Sample.Widgets",
        url: "https://gray-meadow-079c0131e.2.azurestaticapps.net/",
        version: "1.0.1",
        allowSigning: true,
        classicPackage: {
            "generate": true,
            "version": "1.0.0"
        },
        enableWebAppWidgets: true,
        manifestUrl: "https://gray-meadow-079c0131e.2.azurestaticapps.net/manifest.webmanifest"
    }
}

function getKitchenSinkMsix() {
    const options = getSimpleMsix();
    options.allowSigning = false;
    options.publisher = getPublisherMsix().publisher;
    options.edgeChannel = "dev";
    options.appUserModelId = "Microsoft.Dev_8wekyb3d8bbwe!MSEDGE";
    options.classicPackage = {
        generate: true,
        version: "1.0.0",
        url: "https://webboard.app/?v=classic",
    };
    options.edgeHtmlPackage = getEdgeHtmlMsix().edgeHtmlPackage;
    options.manifestUrl = "https://webboard.app/manifest.json";
    options.manifest = getManifest();
    options.images = getImagesArgsMsix().images;
    options.generateModernPackage = true;
    options.resourceLanguage = "EN-US";
    options.startUrl = "https://webboard.app";
    
    return options;
}


function getManifest() {
    return {
        "dir": "ltr",
        "lang": "en",
        "name": "Webboard",
        "scope": "/",
        "display": "standalone",
        "start_url": "/",
        "short_name": "Webboard",
        "theme_color": "#FFFFFF",
        "description": "Enhance your work day and solve your cross platform whiteboarding needs with webboard! Draw text, shapes, attach images and more and share those whiteboards with anyone through OneDrive!",
        "orientation": "any",
        "background_color": "#FFFFFF",
        "related_applications": [],
        "prefer_related_applications": false,
        "screenshots": [
            {
                "src": "assets/screen.png"
            },
            {
                "src": "assets/screen.png"
            },
            {
                "src": "assets/screen.png"
            }
        ],
        "features": [
            "Cross Platform",
            "low-latency inking",
            "fast",
            "useful AI"
        ],
        "shortcuts": [
            {
                "name": "Start Live Session",
                "short_name": "Start Live",
                "description": "Jump direction into starting or joining a live session",
                "url": "/?startLive",
                "icons": [{ "src": "icons/android/maskable_icon_192.png", "sizes": "192x192" }]
            }
        ],
        "icons": [
            {
                "src": "icons/android/android-launchericon-64-64.png",
                "sizes": "64x64"
            },
            {
                "src": "icons/android/maskable_icon_192.png",
                "sizes": "192x192",
                "purpose": "maskable"
            },
            {
                "src": "icons/android/android-launchericon-48-48.png",
                "sizes": "48x48"
            },
            {
                "src": "icons/android/android-launchericon-512-512.png",
                "sizes": "512x512"
            },
            {
                "src": "icons/android/android-launchericon-28-28.png",
                "sizes": "28x28"
            }
        ]
    }
}

async function submit() {
    resultsDiv.textContent = "";

    setLoading(true);
    try {
        // Get the options from the textarea
        const options = JSON.parse(codeArea.value);
        
        // If we have file content stored in memory, use that directly
        if (webActionManifestContent && options.windowsActions?.manifest === webActionManifestContent) {
            // The content is already in the JSON, so we can proceed
        }
        
        const response = await fetch("/msix/generatezip", {
            method: "POST",
            body: JSON.stringify(options),
            headers: new Headers({ 'content-type': 'application/json', 'platform-identifier': 'ServerUI', 'platform-identifier-version': '1.0.0' }),
        });
        if (response.status === 200) {
            const data = await response.blob();
            const url = window.URL.createObjectURL(data);
            window.location.assign(url);

            resultsDiv.textContent = "Success, download started 😎";
        } else {
            const responseText = await response.text();
            resultsDiv.textContent = `Failed. Status code ${response.status}, Error: ${response.statusText}, Details: ${responseText}`;
        }
    } catch (err) {
        resultsDiv.textContent = "Failed. Error: " + err;
    }
    finally {
        setLoading(false);
    }
}

function setLoading(state) {
    submitBtn.disabled = state;
    if (state) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}