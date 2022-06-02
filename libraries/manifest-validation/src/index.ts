import { Manifest, Validation } from "./interfaces";
import { isValidJSON } from "./utils/validation-utils";
import { maniTests } from "./validations";

export async function validateManifest(manifest: Manifest): Promise<Validation[]> {
    const validationErrors: Validation[] = [];
    console.log('validating manifest', manifest);

    const validJSON = isValidJSON(manifest);
    
    if (validJSON === false) {
        throw new Error('Manifest is not valid JSON');
    }

    Object.keys(manifest).forEach(async (key) => {
        for await (const test of maniTests) {
            if (test.member === key && test.test) {
                const testResult = await test.test(manifest[key]);


                if (testResult === false) {
                    test.valid = false;
                    validationErrors.push(test);
                }
                else {
                    test.valid = true;
                    validationErrors.push(test);
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

            return testResult;
        }
    }

    return undefined;
}

export async function validateRequiredFields(manifest: Manifest): Promise<Validation[]> {
    const requiredValidationErrors: Validation[] = [];

    const validJSON = isValidJSON(manifest);
    
    if (validJSON === false) {
        throw new Error('Manifest is not valid JSON');
    }

    for await (const test of maniTests) {
        if (test && test.category === "required" && test.test) {
            if (Object.keys(manifest).includes(test.member) === false) {
                const testResult = await test.test(manifest[test.member]);

                if (testResult === false) {
                  requiredValidationErrors.push(test);
                }
            }
        }
    }

    return requiredValidationErrors;
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