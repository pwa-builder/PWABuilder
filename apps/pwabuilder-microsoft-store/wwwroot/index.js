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
const actionCustomEntityFile = document.querySelector("#actionCustomEntitiesFile");
const actionLocalizedEntitiesFolder = document.querySelector("#actionLocalizedCustomEntitiesFolder");
const fileStatus = document.querySelector("#fileStatus");

simpleBtn.addEventListener("click", () => setCode(getSimpleMsix()));
actionsBtn.addEventListener("click", () => setCode(getActionsMsix()));
publisherBtn.addEventListener("click", () => setCode(getPublisherMsix()));
imagesBtn.addEventListener("click", () => setCode(getImagesArgsMsix()));
edgeHtmlBtn.addEventListener("click", () => setCode(getEdgeHtmlMsix()));
widgetsBtn.addEventListener("click", () => setCode(getWidgetsMsix()));
kitchenSinkBtn.addEventListener("click", () => setCode(getKitchenSinkMsix()));
submitBtn.addEventListener("click", () => submit());

// Handle file upload and clearing
actionManifestFile.addEventListener("change", actionsManifestChosen);
actionCustomEntityFile.addEventListener("change", actionsCustomEntitiesChosen);
actionLocalizedEntitiesFolder.addEventListener("change", actionsLocalizedEntitiesChosen);

setCode(getSimpleMsix());
codeArea.scrollTop = 0;

function setCode(options) {
    const code = JSON.stringify(options, undefined, 4);
    codeArea.value = code;
    codeArea.scrollTop = 1000000;
}

// Handle file selection for web action manifest
function actionsManifestChosen(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Validate JSON content
                const actionsManifest = JSON.parse(e.target.result);
                fileStatus.textContent = `File loaded: ${file.name} (${formatFileSize(file.size)})`;
                fileStatus.classList.remove("text-danger");
                fileStatus.classList.add("text-success");
                
                // Update the file input label
                const fileLabel = document.querySelector(".custom-file-label");
                fileLabel.textContent = file.name;
                
                // Update the current JSON in the textarea to include the file
                updateCodeWithJson("windowsActions.manifest", actionsManifest);
            } catch (error) {
                fileStatus.textContent = "Error: Invalid JSON file";
                fileStatus.classList.remove("text-success");
                fileStatus.classList.add("text-danger");
            }
        };
        reader.readAsText(file);
    }
}

function actionsCustomEntitiesChosen(e) {
    const file = e.target.files[0];
    if (file) {
        readFileAsync(file).then(fileContents => {
            try {
                // Validate JSON content
                const customEntities = JSON.parse(fileContents);
                fileStatus.textContent = `File loaded: ${file.name} (${formatFileSize(file.size)})`;
                fileStatus.classList.remove("text-danger");
                fileStatus.classList.add("text-success");
                
                // Update the file input label
                const fileLabel = document.querySelector(".custom-file-label");
                fileLabel.textContent = file.name;
                
                // Update the current JSON in the textarea to include the file
                updateCodeWithJson("windowsActions.customEntities", customEntities);
            } catch (error) {
                fileStatus.textContent = "Error: Invalid JSON file";
                fileStatus.classList.remove("text-success");
                fileStatus.classList.add("text-danger");
            }
        })
    }
}

function actionsLocalizedEntitiesChosen(e) {
    const files = Array.from(e.target.files);
    const fileReads = files.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = readerEvent => resolve({ fileName: file.name, contents: JSON.parse(readerEvent.target.result) });
            reader.onerror = error => reject(error);
        });
    });

    Promise.all(fileReads)
        .then(
            results => updateCodeWithJson("windowsActions.customEntitiesLocalizations", results), 
            error => {
                fileStatus.textContent = "Error reading files: " + error;
                fileStatus.classList.remove("text-success");
                fileStatus.classList.add("text-danger");
            });
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
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
function updateCodeWithJson(prop, val) {
    try {
        const currentJson = JSON.parse(codeArea.value);
        
        // Check if the property is nested, e.g. "windowsActions.manifest".
        // If so, make sure we have the full object structure.
        const props = prop.split(".");
        let currentObj = currentJson;
        props.forEach((p, index) => {
            if (currentObj[p] === undefined || currentObj[p] === null) {
                const isFinalProp = index === props.length - 1;
                currentObj[p] = isFinalProp ? val : {};
            }

            currentObj = currentObj[p];
        }); 
        
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
    options.name = "WAMI";
    options.url = "https://microsoftedge.github.io/Demos/wami/";
    options.packageId = "Edge.WAMI";
    options.windowsActions= { 
        manifest: getActionsManifest(),
        customEntities: getActionsCustomEntities(),
        customEntitiesLocalizations: getActionsLocalizedCustomEntities()
    };
    return options;
}

function getActionsManifest() {
    return {
        "version": 1,
        "actions": [
            {
                "id": "Wami.Resize.Width",
                "description": "Resize the image to a specific width",
                "kind": "Search",
                "inputs": [
                    {
                        "name": "File",
                        "kind": "Photo"
                    }
                ],
                "outputs": [],
                "invocation": {
                    "type": "Uri",
                    "uri": "web+wami://resize"
                },
                "inputCombinations": [
                    {
                    "inputs": [
                        "File"
                    ],
                        "description": "Photo to be resized in Wami."
                    }
                ]
            },
            {
                "id": "Wami.Blur",
                "description": "Blur the image with a Gaussian operator",
                "kind": "Search",
                "inputs": [
                    {
                        "name": "File",
                        "kind": "Photo"
                    }
                ],
                "outputs": [],
                "invocation": {
                    "type": "Uri",
                    "uri": "web+wami://blur"
                },
                "inputCombinations": [
                    {
                    "inputs": [
                        "File"
                    ],
                        "description": "Photo to be blurred in Wami."
                    }
                ]
            },
            {
                "id": "Wami.Rotate",
                "description": "Rotate the image by 90 degrees",
                "kind": "Search",
                "inputs": [
                    {
                        "name": "File",
                        "kind": "Photo"
                    }
                ],
                "outputs": [],
                "invocation": {
                    "type": "Uri",
                    "uri": "web+wami://rotate"
                },
                "inputCombinations": [
                    {
                        "inputs": [
                            "File"
                        ],
                        "description": "Photo to be rotated in Wami."
                    }
                ]
            },
            {
                "id": "Wami.Paint",
                "description": "Convert the image to oil paint style",
                "kind": "Search",
                "inputs": [
                    {
                        "name": "File",
                        "kind": "Photo"
                    }
                ],
                "outputs": [],
                "invocation": {
                    "type": "Uri",
                    "uri": "web+wami://paint"
                },
                "inputCombinations": [
                    {
                    "inputs": [
                        "File"
                    ],
                    "description": "Photo to be converted to oil paint style."
                    }
                ]
            },
            
            {
                "id": "OpenAudioBook",
                "description": "Open an audio book in the Sample PWA. This is a dummy action for testing out custom entity support. See https://gist.github.com/JudahGabriel/8f97c1b4f9f3bbd480aa1cc45062cec4",
                "useGenerativeAI": false,
                "inputs": [
                    {
                        "name": "AudioBookToOpen",
                        "kind": "CustomText",
                        "customTextKind": "audiobook"
                    }
                ],
                "inputCombinations": [
                    {
                        "inputs": ["AudioBookToOpen"],
                        "description": "Open `${AudioBookToOpen.KeyPhrase}` by ${AudioBookToOpen.author} in Sample PWA"
                    }
                ],
                "outputs": [],
                "invocation": {
                    "type": "Uri",
                    "uri": "web+wami://audiobook/${AudioBookToOpen.isbn}/"
                }
            }
        ]
    };
}

function getActionsCustomEntities() {
    return { 
        "version": 1, 
        "entityDefinitions": { 
            "audiobook": "ms-resource://Files/LocalizedCustomEntities/AudioBookCustomEntity.json" 
        }
    };
}

function getActionsLocalizedCustomEntities() {
    return [
        {
            fileName: "AudioBookCustomEntity.json",
            contents: {
                "Atomic Habits": {
                    "author": "James Clear",
                    "isbn": "0735211299",
                    "language": "English",
                    "genre": "Self-help",
                    "published": "October 16, 2018"
                }
            }
        },
        {
            fileName: "AudioBookCustomEntity.language-es.json",
            contents: {
                    "Hábitos Atómicos": {
                    "author": "James Clear",
                    "isbn": "0735211299",
                    "language": "Español",
                    "genre": "Autoayuda",
                    "published": "11 de junio de 2019"
                }
            }
        }
    ]
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