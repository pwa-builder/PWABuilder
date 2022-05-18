import { Manifest, Validation } from "./interfaces";
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
    const requiredValidationErrors: Validation[] = [];

    for await (const test of maniTests) {
        if (test.category === "required") {
            if (Object.keys(manifest).includes(test.member) === false) {
                requiredValidationErrors.push(test);
            }
        }
    }

    return requiredValidationErrors;
}
