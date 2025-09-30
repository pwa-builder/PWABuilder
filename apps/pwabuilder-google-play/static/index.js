const unsignedBtn = document.querySelector("#unsignedBtn");
const signedBtn = document.querySelector("#signedBtn");
const chooseKeyBtn = document.querySelector("#chooseKeyBtn");
const existingKeyBtn = document.querySelector("#existingKeyBtn");
const filePicker = document.querySelector("#filePicker");
const codeArea = document.querySelector("textarea");
const submitBtn = document.querySelector("#submitBtn")
const resultsDiv = document.querySelector("#results");
const spinner = document.querySelector(".spinner-border");

unsignedBtn.addEventListener("click", () => setCode(getUnsignedApkOptions()));
signedBtn.addEventListener("click", () => setCode(getSignedApk()));
existingKeyBtn.addEventListener("click", () => setCode(getExistingKeySignedApk()))
chooseKeyBtn.addEventListener("click", () => filePicker.click());
filePicker.addEventListener("change", (e) => keyFileChosen(e));
submitBtn.addEventListener("click", () => submit());

setCode(getSignedApk());
codeArea.scrollTop = 0;
packagingStartMs = 0;

function setCode(options) {
    const code = JSON.stringify(options, undefined, 4);
    codeArea.value = code;
    codeArea.scrollTop = 1000000;
}

function getUnsignedApkOptions() {
    return {
        "additionalTrustedOrigins": [],
        "appVersion": "1.0.0.0",
        "appVersionCode": 1,
        "backgroundColor": "#FFFFFF",
        "display": "standalone",
        "enableSiteSettingsShortcut": true,
        "enableNotifications": false,
        "includeSourceCode": false,
        "fallbackType": "customtabs",
        "features": {
            "locationDelegation": {
                "enabled": true
            },
            "playBilling": {
                "enabled": false
            }
        },
        "host": "https://webboard.app",
        "iconUrl": "https://webboard.app/icons/android/android-launchericon-512-512.png",
        "launcherName": "Webboard",
        "name": "Webboard",
        "maskableIconUrl": "https://webboard.app/icons/android/maskable_icon_192.png",
        "navigationColor": "#1976d2",
        "navigationColorDark": "#1976d2",
        "navigationDividerColor": "#1976d2",
        "navigationDividerColorDark": "#1976d2",
        "orientation": "default",
        "packageId": "app.webboard",
        "pwaUrl": "https://webboard.app",
        "serviceAccountJsonFile": undefined,
        "shortcuts": [
            {
                "name": "Start Live Session",
                "short_name": "Start Live",
                "url": "/?startLive",
                "icons": [
                    {
                        "sizes": "192x192",
                        "src": "/icons/android/maskable_icon_192.png"
                    }
                ]
            }
        ],
        "signingMode": "none",
        "signing": {
            "file": null,
            "alias": "my-android-key",
            "fullName": "John Doe",
            "organization": "Contoso",
            "organizationalUnit": "Engineering Department",
            "countryCode": "US",
            "keyPassword": "aBc123$%",
            "storePassword": "iOp987#@"
        },
        "splashScreenFadeOutDuration": 300,
        "startUrl": "/",
        "themeColor": "#1976d2",
        "themeColorDark": "#0d1117",
        "webManifestUrl": "https://webboard.app/manifest.json"
    };
}

function getSignedApk() {
    const options = getUnsignedApkOptions();
    options.signingMode = "new";
    options.signing = {
        file: null,
        alias: "my-android-key",
        fullName: "John Doe",
        organization: "Contoso",
        organizationalUnit: "Engineering Department",
        countryCode: "US",
        keyPassword: "aBc123$%",
        storePassword: "iOp987#@"
    };
    return options;
}

function getExistingKeySignedApk() {
    const options = getSignedApk();
    options.signingMode = "mine";
    options.signing.file = "data:application/octet-stream;base64,/u3+7QAAAAIAAAABAAAAAQAMbXkta2V5LWFsaWFzAAABczGxKzAAAAUBMIIE/TAOBgorBgEEASoCEQEBBQAEggTpI6J2fYdH5unUHLQGi6kqfeneUwE8qoTAKv9H/VRinYzE/UH8/jT1XakZZ7PzPUgM+FjziG/SaGn+Fw0o4brC2SqCDTAX+MR6YYDEmp8U8zmVLoGXq2wOWzvRZi6oGxHO287VcSlRWITTMHfQUrACNtKXBuvxkzEDjU4K1iFHzpiOODpOTtvWPmWAJ96aTD8D09KOKbqDQcTwwrEx5+WX3B/EerLMa0O5TSWJ/d+MyPeJiW8Rkz8rk+TkD/johGro8z5hgjYH4P+mK4M5IhAk/acYb6p0P4xDUVLbCpcfptQOt9DVzTD1HSELcSw2SKR3NlHjujLX5pJomr2NQj47qPOyi6SskFmmLaQ/8XCV7w9yTV/RV6/YFiv2zbr70CuAlGZbJoCNQJbSimS66hCI7O4xYMFgeY/5RcTHSz48M97tswIO8A8ehRmugWbju2abGiOoQpQWlYo/d12a8khIHELRvDM9xhdl4KSQld34yinp663aV7jsdDAg7tuAP69//WaJutsFM/KdLGdSgy9oRd6OOKtAH1Eqi5NWPVN0F5ILtDPksW/cVVc0qly8diJYvBXvpb5GLQWcsjfzhgxlzq9wGLjAbJJ+8Ez6wubbk2t6GNuZLZj2TGrUUEsgCPe9ULnJGQz+EKKSjBPZ8NY93DnEk1E5/K2FRs4x70LCSEXjFKUzK8AR3S4s7WK/2zlYJrQbnZEshdHvBfcP+8x5UM8ma6IEudKOJA/ttGJnW/qjncI6Oqg+DTLylbyXSBGMfAcDXYY6faPW3XmmPS2N/4kX1QycrGEHnT4NgexT57TwvRl1MsYhmt2suPGW5RNUE1TGoc2cdMKziPj976UFMOM5U4tyMKMbEuJICWxlO70O9iDB/PbN39Pepv5BhD3lHH2TEZCNdG80ThZw9s9JSzziLDppxuVMTZ23iNJkH5dqHt236uuSQxFszXo16qIWyhcD1C4H0PMSax2FeBxh/sDRpCIdhE7UrFpqL9OB/97L8Rp8uzWpDQg+dAWZ8E09DYlS9KNVcZJFKoPXGCWvJU6spmLMzbiX+McH5me3ouDBhJxt7xULgYwASNT+hL9IySLh1jbfpgXnKab0XvDxtfZ/+3nOOiTTfc44G4ai4ZizrCe4j59v5OLUL074Hc7tYYK08oX7EPH8aDyJsUy6iqj1XXjl7J3Kg7bWsJOHmiYiQaQDdTdi3k9rqEu+pWp0Y56FTjtrm4DKu9HaNMEfpWXrR/robkterwuiChFVFzKJXIZHF33pAOI0WJjUTEkSla4InOijVJGfZhneuc6Q1COwF/4Ha5wmKE4ZnWZWDcFHDM2cpcN6KU3D2ndjSyq+ni2uEm3glubP3UUHa2wNwL//9UP2hvyRoWj2tmSW0U0gSnu6/lfiM7bv2Msg8L4+xaN6EYFkAHgIG2AtApn4YPlfQkhucCPuc+Tjtw7E5E+daAeN5S3WBm0/Fggd6mBpVGK3620yzebRnIY4PQZM/7DT7pDXZA9v2zAlmBfHeG9XmMCMvFGlsrAZ50v8nAvXjgEzqfb9aiQM+S+FkuMtRvoV3DQrHbw7C4p7JYZPWaK7biX1PvkkcTOUif9FRAQxCffNTqgm2YJDkjr0dS8GAl2+MjhgGc/hgzX5ircoTEs0tWdaiwWlE6Zk3LgnjB5tgsaCgNXgDMnGAAAAAQAFWC41MDkAAANfMIIDWzCCAkOgAwIBAgIEXZe6IDANBgkqhkiG9w0BAQsFADBdMQswCQYDVQQGEwJVUzETMBEGA1UEChMKcHdhYnVpbGRlcjEfMB0GA1UECxMWRW5naW5lZXJpbmcgRGVwYXJ0bWVudDEYMBYGA1UEAxMPUFdBQnVpbGRlciBVc2VyMCAXDTIwMDcwOTAzNDkyMVoYDzIwNzUwNDEyMDM0OTIxWjBdMQswCQYDVQQGEwJVUzETMBEGA1UEChMKcHdhYnVpbGRlcjEfMB0GA1UECxMWRW5naW5lZXJpbmcgRGVwYXJ0bWVudDEYMBYGA1UEAxMPUFdBQnVpbGRlciBVc2VyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqXnhK4AZ80RGrYotQQwmkqTJNh6L3SUE3AEAXgL73Jvtc/301d5zOWfPLdS137TEoeOGsa273c/jLi2J0pw5Qx6iNb9rebf2fE0xh/fYWYipXG2c/EE8hP6VGfMD1jLv2ciCSrS26aOGrGNcWDl6GUvYh3ZL98kN5E9ZhYGa3N+nT5SJXRVAlLQn9KdWbn3v71dhRIHFMDF1O+1OKNvy/raQMWupcGPJlvcoKn+istgbAiTzhYDeWnc7JxJzpZyJu3OIiG9mE3yS1zk3RzlInV1VCgSE/ePo5CXlYiYRluSmU7z2ePTg4f7xQOsHE4i+5yKPLe5QJ9lZ0TrG0qY2xwIDAQABoyEwHzAdBgNVHQ4EFgQUu1ubRq7PVR7b9UZGvkPmaeivqrcwDQYJKoZIhvcNAQELBQADggEBAJOUQGdQ8mA+dlsLsNHhLPLZvGpApbBlN/9ZEuArh/Sdwf77UtZNgjB2keCjhYcdJKc5Dd0c327qJGew3HN1ZE9YgjuM3NBtV0YYvOJhv3W7wcFJVZ8UPKTquc4fuROHL2OxsNQvvBbFypjfEb4QeYV/ro+CMUOrcjYEVLfk1nmMhyYjmEaazWefZUNcMpBK4LXECHsEugUbzuo4Pz5DuRcLjEb4s6MRcyI3sY2/ct/jDHZyUesQk63GpxrFDNq3+C50tD3xiukvKha6f6Fji8J1GFeNSEO/5DI/ED1TTg3ei/L9coqYWljXPeqCSFRu9a9VDYeV/wOABocTh8KDJ73ic0oKFN14vwPKvockFZiUSsgOSg==";
    options.signing.alias = "my-key-alias";
    options.signing.keyPassword = "52SO4fg9ZIsw";
    options.signing.storePassword = "o93619kHyx82";
    return options;
}

function keyFileChosen(e) {
    if (filePicker.files) {
        const options = getSignedApk();

        // Read the file 
        const fileReader = new FileReader();
        fileReader.onload = () => {
            options.file = fileReader.result;
            setCode(options);
        }
        fileReader.readAsDataURL(filePicker.files[0]);

        filePicker.file = null;
    }
}

async function submit() {
    resultsDiv.textContent = "";
    packagingStartMs = Date.now();

    setLoading(true);
    try {
        // Convert the JSON to an object and back to a string to ensure proper formatting.
        const options = JSON.stringify(JSON.parse(codeArea.value));
        const response = await fetch("/enqueuePackageJob", {
            method: "POST",
            body: options,
            headers: new Headers({ 'content-type': 'application/json', 'platform-identifier': 'ServerUI', 'platform-identifier-version': '1.0.0' }),
        });

        if (!response.ok) {
            appendResults(`Failed to enqueue Google Play packaging job. Status code ${response.status}, Error: ${response.statusText}.`);
            setLoading(false);
            return;
        }

        const jobId = await response.text();
        appendResults(`Enqueued job ${jobId}. Waiting for processing...`);
        setTimeout(() => this.pollJob(jobId), 2000);
    } catch (err) {
        appendResults(`Failed. Error: ${err}`);
        setLoading(false);
    }
}

async function pollJob(jobId) {
    const jobFetch = await fetch("/getPackageJob?id=" + encodeURIComponent(jobId));
    if (!jobFetch.ok) {
        appendResults(`Failed to fetch job ${jobId}. Status code ${jobFetch.status}, Error: ${jobFetch.statusText}.`);
        setLoading(false);
        return;
    }

    const job = await jobFetch.json();

    // If it's completed, download the zip.
    if (job.status === "Completed") {
        appendResults(`Job completed in ${Date.now() - packagingStartMs}ms. Triggering download...`);
        downloadJobZip(jobId);
    } else if (job.status === "Failed") {
        appendResults(`Job failed in ${Date.now() - packagingStartMs}ms. See logs above for details.`);
        setLoading(false);
    } else {
        // If we're enqueued or in progress, show the logs from the packaging process and poll again in 2s.
        setTimeout(() => this.pollJob(jobId), 2000);
        job.logs.forEach(l => appendResultIfNotIncluded(l));
    }
}

async function downloadJobZip(jobId) {
    const zipFetch = await fetch("/downloadPackageZip?id=" + encodeURIComponent(jobId));
    if (zipFetch.ok) {
        const data = await zipFetch.blob();
        const url = window.URL.createObjectURL(data);
        window.location.assign(url);
        setLoading(false);
    } else {
        appendResults(`Failed to download package zip for job ${jobId}. Status code ${zipFetch.status}, Error: ${zipFetch.statusText}.`);
        setLoading(false);
    }
}

function appendResults(val) {
    resultsDiv.textContent = [resultsDiv.textContent, val].join("\n");
}

function appendResultIfNotIncluded(line) {
    const resultLines = resultsDiv.textContent.split("\n");
    if (!resultLines.includes(line)) {
        appendResults(line);
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
