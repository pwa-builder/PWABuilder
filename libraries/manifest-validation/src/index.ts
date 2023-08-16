import { TokensValidation, Manifest, singleFieldValidation, Validation } from "./interfaces.js";
export { Manifest, Validation, singleFieldValidation } from "./interfaces.js";
import { findMissingKeys, isValidJSON, isValidURL, validProtocols } from "./utils/validation-utils.js";
export { required_fields, recommended_fields, optional_fields, validateSingleRelatedApp } from "./utils/validation-utils.js";
import { maniTests, findSingleField, loopThroughKeys, loopThroughRequiredKeys } from "./validations.js";

export let currentManifest: Manifest | undefined;

export async function validateManifest(manifest: Manifest, includeMissedTests?: boolean): Promise<Validation[]> {
    return new Promise(async(resolve, reject) => {
        const validJSON = isValidJSON(manifest);

        if (validJSON === false) {
            reject('Manifest is not valid JSON');
        }

        currentManifest = manifest;
        let data = await loopThroughKeys(manifest, false, includeMissedTests);

        resolve(data);
    });
}

export async function validateSingleField(field: string, value: any): Promise<singleFieldValidation> {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await findSingleField(field, value);
            //console.log('data', data);
            resolve(data);
        }
        catch(err) {
            reject(err);
        }
    })
}

export async function reportMissing(manifest: Manifest): Promise<Array<string>> {
    return new Promise(async(resolve) => {
        const data = await findMissingKeys(manifest);
        if (data && data.length > 0) {
            resolve(data);
        } else {
            resolve([]);
        }
    })
}

export async function validateRequiredFields(manifest: Manifest): Promise<Validation[]> {
    return new Promise(async(resolve, reject) => {
        const validJSON = isValidJSON(manifest);
        if (validJSON === false) {
            reject('Manifest is not valid JSON');
        }

        let data = await loopThroughRequiredKeys(manifest, true);
        if (data && data.length > 0) {
            resolve(data);
        }
    });
}

export async function validateImprovements(manifest: Manifest): Promise<Validation[]> {
    const optionalValidationErrors: Validation[] = [];

    const validJSON = isValidJSON(manifest);

    if (validJSON === false) {
        throw new Error('Manifest is not valid JSON');
    }

    for await (const test of maniTests) {
        if (test && test.category === "optional" && test.test) {
            if (Object.keys(manifest).includes(test.member) === true) {
                const testResult = await test.test(manifest[test.member]);

                if (testResult === false) {
                    optionalValidationErrors.push(test);
                }
            }
        }
    }

    return optionalValidationErrors;
}

export async function isInstallReady(manifest: Manifest): Promise<boolean> {
    const validJSON = isValidJSON(manifest);

    if (validJSON === false) {
        throw new Error('Manifest is not valid JSON');
    }

    const validations = await validateRequiredFields(manifest);

    return validations.length === 0;
}

function isValidRelativeURL(str: string){
    var pattern = new RegExp('^(?!www\.|(?:http|ftp)s?://|[A-Za-z]:\\|//).*');
    return !!pattern.test(str);
}
  
export function validateSingleProtocol(proto: any){
    let validProtocol = validProtocols.includes(proto.protocol) || proto.protocol.startsWith("web+") || proto.protocol.startsWith("web+")
    if(!validProtocol){
        return "protocol";
    }

    // i guess more importantly we should check if its in the scope of the site.

    let validURL = isValidURL(proto.url) || isValidRelativeURL(proto.url);

    if(!validURL){
        return "url";
    }

    return "valid";
}

export async function groupedValidation(manifest: Manifest): Promise<TokensValidation> {
    return new Promise(async(resolve, reject) => {
        const validJSON = isValidJSON(manifest);

        if (validJSON === false) {
            reject('Manifest is not valid JSON');
        }

        currentManifest = manifest;
        const testResults = await loopThroughKeys(manifest, false, true);
        const resultsGrouped = testResults.reduce((acc, curr) => {
            const curTrimmed = { category: curr.category, member: curr.member, valid: curr.valid, displayString: curr.displayString, errorString: curr.errorString, infoString: curr.infoString, docsLink: curr.docsLink };
            if (acc[curr.member]) {
                acc[curr.member].push(curTrimmed);
            } else {
                acc[curr.member] = [curTrimmed];
            }
            return acc;
        }, {} as any);

        // remove duplicate icons and remove category after
        Object.keys(resultsGrouped).some(key => {
            if (key == 'icons' && (resultsGrouped[key].length > 1)) {
                resultsGrouped[key] = (resultsGrouped[key] as Validation[]).filter((item: Validation) => item.category === 'required');
                return true;
            }
            return false;
        });
        Object.keys(resultsGrouped).forEach(key => { delete resultsGrouped[key][0].category }  );

        const groupedValidation: TokensValidation = {
            installable: {
                short_name: resultsGrouped['short_name'][0],
                name: resultsGrouped['name'][0],
                description: resultsGrouped['description'][0],
                display: resultsGrouped['display'][0],
                icons: resultsGrouped['icons'][0],
            },
            additional: {
                id: resultsGrouped['id'][0],
                launch_handler: resultsGrouped['launch_handler'][0],
                orientation: resultsGrouped['orientation'][0],
                background_color: resultsGrouped['background_color'][0],
                theme_color: resultsGrouped['theme_color'][0],
                screenshots: resultsGrouped['screenshots'][0],
                categories: resultsGrouped['categories'][0]
            },
            progressive: {
                share_target: resultsGrouped['share_target'][0],
                protocol_handlers: resultsGrouped['protocol_handlers'][0],
                file_handlers: resultsGrouped['file_handlers'][0],
                shortcuts: resultsGrouped['shortcuts'][0],
                display_override: resultsGrouped['display_override'][0],
                edge_side_panel: resultsGrouped['edge_side_panel'][0],
                scope_extensions: resultsGrouped['scope_extensions'][0],
                widgets: resultsGrouped['widgets'][0]
            }
        }

        resolve(groupedValidation);
    });
}

export * from './interfaces.js';