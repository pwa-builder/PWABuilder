var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { findMissingKeys, isValidJSON, isValidURL, validProtocols } from "./utils/validation-utils.js";
export { required_fields, recommended_fields, optional_fields, validateSingleRelatedApp } from "./utils/validation-utils.js";
import { maniTests, findSingleField, loopThroughKeys, loopThroughRequiredKeys } from "./validations.js";
export let currentManifest;
export async function validateManifest(manifest) {
    return new Promise(async (resolve, reject) => {
        const validJSON = isValidJSON(manifest);
        if (validJSON === false) {
            reject('Manifest is not valid JSON');
        }
        currentManifest = manifest;
        let data = await loopThroughKeys(manifest);
        resolve(data);
    });
}
export async function validateSingleField(field, value) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await findSingleField(field, value);
            resolve(data);
        }
        catch (err) {
            reject(err);
        }
    });
}
export async function reportMissing(manifest) {
    return new Promise(async (resolve) => {
        const data = await findMissingKeys(manifest);
        if (data && data.length > 0) {
            resolve(data);
        }
        else {
            resolve([]);
        }
    });
}
export async function validateRequiredFields(manifest) {
    return new Promise(async (resolve, reject) => {
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
export async function validateImprovements(manifest) {
    var _a, e_1, _b, _c;
    const optionalValidationErrors = [];
    const validJSON = isValidJSON(manifest);
    if (validJSON === false) {
        throw new Error('Manifest is not valid JSON');
    }
    try {
        for (var _d = true, maniTests_1 = __asyncValues(maniTests), maniTests_1_1; maniTests_1_1 = await maniTests_1.next(), _a = maniTests_1_1.done, !_a;) {
            _c = maniTests_1_1.value;
            _d = false;
            try {
                const test = _c;
                if (test && test.category === "optional" && test.test) {
                    if (Object.keys(manifest).includes(test.member) === true) {
                        const testResult = await test.test(manifest[test.member]);
                        if (testResult === false) {
                            optionalValidationErrors.push(test);
                        }
                    }
                }
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = maniTests_1.return)) await _b.call(maniTests_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return optionalValidationErrors;
}
export async function isInstallReady(manifest) {
    const validJSON = isValidJSON(manifest);
    if (validJSON === false) {
        throw new Error('Manifest is not valid JSON');
    }
    const validations = await validateRequiredFields(manifest);
    return validations.length === 0;
}
function isValidRelativeURL(str) {
    var pattern = new RegExp('^(?!www\.|(?:http|ftp)s?://|[A-Za-z]:\\|//).*');
    return !!pattern.test(str);
}
export function validateSingleProtocol(proto) {
    let validProtocol = validProtocols.includes(proto.protocol) || proto.protocol.startsWith("web+") || proto.protocol.startsWith("web+");
    if (!validProtocol) {
        return "protocol";
    }
    let validURL = isValidURL(proto.url) || isValidRelativeURL(proto.url);
    if (!validURL) {
        return "url";
    }
    return "valid";
}
export * from './interfaces.js';
//# sourceMappingURL=index.js.map