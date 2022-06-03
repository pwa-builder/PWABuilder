import { Manifest, Validation } from "./interfaces";
import { isValidJSON, loopThroughKeys, loopThroughRequiredKeys } from "./utils/validation-utils";
import { maniTests } from "./validations";

export async function validateManifest(manifest: Manifest): Promise<Validation[]> {
    return new Promise(async(resolve, reject) => {
        const validJSON = isValidJSON(manifest);

        if (validJSON === false) {
            reject('Manifest is not valid JSON');
        }

        let data = await loopThroughKeys(manifest);

        if (data && data.length > 0) {
            resolve(data);
        }
        let data = await loopThroughKeys(manifest);
        if (data && data.length > 0) {
            resolve(data);
        }
        // resolve(validationErrors);
    });
}

export async function validateSingleField(field: string, value: any): Promise<Validation | boolean | undefined> {
    for await (const test of maniTests) {
        if (test.member === field && test.test) {
            const testResult = await test.test(value);

            return testResult;
        }
    }

    return undefined;
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