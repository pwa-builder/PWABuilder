# Android Package ID Java Keyword Fix

## Problem
Google Play packaging was failing when domains contained Java keywords like 'new', resulting in invalid package names such as `com.kpr_co.new.twa` where `new` is a reserved Java keyword.

## Solution
Modified the `generatePackageId` function in `android-validation.ts` to detect Java keywords and append an underscore to make them valid Java identifiers.

## Test Cases
The following test cases demonstrate the fix:

### Original Failing Case
- **Input**: `new.kpr-co.com`
- **Before**: `com.kpr_co.new.twa` ❌ (contains Java keyword 'new')
- **After**: `com.kpr_co.new_.twa` ✅ (valid Java package name)

### Additional Java Keywords
- **Input**: `if.example.com` → **Output**: `com.example.if_.twa` ✅
- **Input**: `class.myapp.org` → **Output**: `org.myapp.class_.twa` ✅
- **Input**: `interface.api.com` → **Output**: `com.api.interface_.twa` ✅
- **Input**: `public.static.com` → **Output**: `com.static_.public_.twa` ✅

### Multiple Keywords
- **Input**: `new.if.complex.com` → **Output**: `com.complex.if_.new_.twa` ✅

### Non-Keywords (Unchanged)
- **Input**: `example.com` → **Output**: `com.example.twa` ✅
- **Input**: `my-app.org` → **Output**: `org.my_app.twa` ✅

## Technical Details
- Added comprehensive list of 54 Java keywords
- Implemented `avoidJavaKeywords()` helper function
- Enhanced validation to catch manually entered Java keywords
- Maintains compatibility with existing features (leading digit handling, character replacement)

## Files Modified
- `/apps/pwabuilder/src/script/utils/android-validation.ts` - Main implementation
- `/apps/pwabuilder/utils/android-validation.test.ts` - Test suite

The fix is minimal and surgical, only modifying domain parts that are Java keywords while preserving all other functionality.