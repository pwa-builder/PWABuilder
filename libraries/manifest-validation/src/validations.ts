// import { currentManifest } from ".";
import { Manifest, singleFieldValidation, Validation } from "./interfaces.js";
import { maniTests as Tests } from "./mani-tests.js"

export const maniTests: Array<Validation> = Tests;

export function loopThroughKeys(manifest: Manifest, requiredOnly = false, includeMissedTests = false): Array<Validation> {

    let data: Array<Validation> = [];

    const maniFields = Object.keys(manifest);

    maniTests.forEach((test) => {
        if (requiredOnly && test.category !== "required") {
            return;
        }
        const tested = maniFields.some((field) => {
            if (test.member === field && test.test) {
                const testResult = test.test(manifest[field]);

                test.valid = testResult? true: false;
                data.push(test);

                return true;
            }
            return false;
        });
        if (!tested && includeMissedTests) {
            test.test && test.test(undefined);
            data.push({...test, valid: false});
        }
    })

    return data;
}

export function loopThroughRequiredKeys(manifest: Manifest, includeMissedTests = false): Array<Validation> {
    return loopThroughKeys(manifest, true, includeMissedTests);


        // let data: Array<Validation> = [];

        // const maniFields = Object.keys(manifest);

        // maniTests.forEach((test) => {
        //     if (test.category === "required") {
        //         maniFields.some((field) => {
        //             if (test.member === field && test.test) {
        //                 const testResult = test.test(manifest[field]);

        //                 test.valid = testResult? true: false;
        //                 data.push(test);

        //                 return true;
        //             }
        //             return false;
        //         })
        //     }
        // })

        // resolve(data);
    //})
}

export async function findSingleField(field: string, value: any): Promise<singleFieldValidation> {
    return new Promise(async (resolve) => {

        // For && operations, true is the base.
        let singleField = true;
        let failedTests: string[] | undefined = [];

        maniTests.forEach((test) => {
            if (test.member === field && test.test) {

                const testResult = test.test(value);

                if (!testResult) {
                    failedTests!.push(test.errorString!);
                }

                // If the test passes true && true = true.
                // If the test fails true && false = false
                // If a field has MULTIPLE tests, they will stack
                // ie: true (base) && true (test 1) && false (ie test 2 fails).
                singleField = singleField && testResult;
            }
        });

        if (singleField) {
            resolve({ "valid": singleField })
        }

        resolve({ "valid": singleField, "errors": failedTests });
    })
}
