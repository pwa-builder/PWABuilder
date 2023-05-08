import { env } from './environment';

export const api = {
  imageGenerator: {
    post: `${env.imageGeneratorUrl}/api/image`,
    download: function (id: string) {
      return `${env.imageGeneratorUrl}/api/image/${id}`;
    },
  },
};

export const default_timeout = 20000;
