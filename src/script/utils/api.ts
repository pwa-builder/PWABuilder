import { env } from './environment';

export const api = {
  imageGenerator: {
    post: `${env.imageGeneratorUrl}`,
    download: function (id: string) {
      return `${env.imageGeneratorUrl}/${id}`;
    },
  },
  generateMissingImages: {
    post: function (id: string) {
      return `${env.api}/manifests/${id}/generatemissingimages`;
    },
  },
};
