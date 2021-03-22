import { env } from './environment';

export const api = {
  imageGenerator: {
    post: `${env.imageGeneratorUrl}`,
    download: function (id: string) {
      return `${env.imageGeneratorUrl}/${id}`;
    },
  },
};

export const default_timeout = 20000;
