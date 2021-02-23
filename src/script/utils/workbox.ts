export function compareImg(url: URL, request: Request): boolean {
  let cachedFile: File | undefined;

  return (function () {
    const fileIsDifferent =
      request.body instanceof FormData &&
      compareBlobs(
        cachedFile,
        (request.body as FormData).get('fileName') as File
      );

    return (
      url.origin ===
        'https://appimagegenerator-prod.azurewebsites.net/api/image' &&
      request.bodyUsed &&
      fileIsDifferent
    );
  })();
}

function compareBlobs(
  cachedFile: File | undefined,
  formDataFile: File
): boolean {
  if (!cachedFile) {
    cachedFile = formDataFile;
    return true;
  }

  return false;
}
