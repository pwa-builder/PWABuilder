// Local copy of the singleFieldValidation type originally sourced from
// @pwabuilder/manifest-validation. Copied here so the frontend can drop the
// runtime dependency on that package for type-only usage.

export interface singleFieldValidation {
    valid: Boolean;
    errors?: string[];
}
