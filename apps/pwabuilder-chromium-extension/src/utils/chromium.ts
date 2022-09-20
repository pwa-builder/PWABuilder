export async function getTabId() {
    var tabs = await chrome.tabs.query({active: true, currentWindow: true});
    return tabs[0].id;
}


export async function checkIfImageResolvesSuccesfully(url: string) : Promise<boolean> {
    const id = makeid(64);

    return new Promise(async (resolve, reject) => {
        const listener = (message: any, sender: any, sendResponse: any) => {
            if (message.type && message.type === id) {
                // we finally have all the info we need for the service worker
                resolve(message.result);
                chrome.runtime.onMessage.removeListener(listener);
                sendResponse(true);
            }
        }

        chrome.runtime.onMessage.addListener(listener)

        const tabId = await getTabId();
        if (tabId) {
            await chrome.scripting.executeScript({
                target: {tabId},
                func: resolvesSuccessfully,
                args: [id, url]
            });
        } else {
            reject("No active tab found");
        }
    });
}

async function resolvesSuccessfully(id: string, imgUrl: string) {
    const promise = new Promise((resolve) => {
        const imageEl = new Image();
        imageEl.src = imgUrl;

        imageEl.onload = () => {
            if (imageEl.complete && imageEl.naturalHeight > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        };

        imageEl.onerror = () => {
            resolve(false);
        };
    });

    chrome.runtime.sendMessage({type: id, result: await promise});
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}