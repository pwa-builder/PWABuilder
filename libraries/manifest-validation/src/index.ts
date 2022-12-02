import { Manifest, singleFieldValidation, Validation } from "./interfaces";
export { Manifest, Validation, singleFieldValidation } from "./interfaces";
import { findMissingKeys, isValidJSON } from "./utils/validation-utils";
export { required_fields, reccommended_fields, optional_fields, validateSingleRelatedApp, validateSingleProtocol } from "./utils/validation-utils";
import { maniTests, findSingleField, loopThroughKeys, loopThroughRequiredKeys } from "./validations";

export async function validateManifest(manifest: Manifest): Promise<Validation[]> {
    return new Promise(async(resolve, reject) => {
        const validJSON = isValidJSON(manifest);


        if (validJSON === false) {
            reject('Manifest is not valid JSON');
        }

        let data = await loopThroughKeys(manifest);

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

        let data = await loopThroughRequiredKeys(manifest);
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

export * from './interfaces';