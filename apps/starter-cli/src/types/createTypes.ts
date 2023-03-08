export type CreateOptions = {
  name: string | undefined;
  template: string | undefined;
}

export type ResolvedCreateOptions = {
  resolvedName: string;
  resolvedTemplate: string;
}
