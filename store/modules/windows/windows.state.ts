export interface Parm {
  name: string | null;
  id: string | null;
  default: string | null;
  type: string | null;
  description: string | null;
}

export interface Snippet {
  title: string | null;
  description: string | null;
  image: string | null;
  id: string | null;
  parms: Parm[]| null;
  url: string | null;
  hash: string | null;
  included: boolean | false;
  snippet: string | null;
}

export interface State {
  snippets: Snippet[] | null;
}

export const snippet = (): Snippet => ({
  title: null,
  description: null,
  image: null,
  id: null,
  parms: [],
  url: null,
  hash: null,
  included: false,
  snippet: null
});

export const state = (): State => ({
  snippets: []
});