export interface Parm {
  name: string | null;
  id: string | null;
  default: string | null;
  type: string | null;
  description: string | null;
}

export interface Sample {
  title: string | null;
  description: string | null;
  image: string | null;
  id: string | null;
  parms: Parm[];
  url: string | null;
  hash: string | null;
  included: boolean | false;
  snippet: string | null;
  source: string | null;
}

export interface State {
  samples: Sample[];
  sample: Sample | null;
}

export const state = (): State => ({
  samples: [],
  sample: null
});