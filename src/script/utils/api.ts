(function setEnv() {
  // TODO config setter for environment.
})();

const imageGeneratorUrlBase =
  'https://appimagegenerator-prod.azurewebsites.net/api/image';

const generateMissingImagesBase =
  'https://pwabuilder-api-prod.azurewebsites.net/manifests/0e43b916/generatemissingimages';

export const api = {
  imageGenerator: {
    post: imageGeneratorUrlBase,
    download: function (id: string) {
      return `${imageGeneratorUrlBase}/${id}`;
    },
  },
  generateMissingImages: {
    post: generateMissingImagesBase,
  },
};

export const default_timeout = 20000;
