import { Manifest, Validation } from "./interfaces";
import { isValidJSON, loopThroughRequiredKeys } from "./utils/validation-utils";
import { maniTests } from "./validations";

export async function validateManifest(manifest: Manifest): Promise<Validation[]> {
    const validationErrors: Validation[] = [];

    Object.keys(manifest).forEach(async (key) => {
        for await (const test of maniTests) {
            if (test.member === key && test.test) {
                const testResult = await test.test(manifest[key]);

                if (testResult === false) {
                    validationErrors.push(test)
                }
            }
        }
    });

    return validationErrors;
}

export async function validateSingleField(field: string, value: any): Promise<Validation | boolean | undefined> {
    for await (const test of maniTests) {
        if (test.member === field && test.test) {
            const testResult = await test.test(value);

            if (testResult === false) {
                return test;
            }
            else {
                return true
            }
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
