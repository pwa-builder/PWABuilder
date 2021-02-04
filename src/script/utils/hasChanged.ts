export function arrayHasChanged(value: unknown, unknownValue: unknown) {
  if (!value || !unknownValue) {
    return false;
  }

  const curr = value as Array<unknown>;
  const next = unknownValue as Array<unknown>;

  return (
    curr.length !== next.length ||
    curr
      .map((val, i) => val === unknownValue[i])
      .reduce((acc, cur) => acc && cur, true)
  );
}

export function objectHasChanged(value: unknown, unknownValue: unknown) {
  if (!value || !unknownValue) {
    return false;
  }

  const curr = value as any;
  const next = unknownValue as any;

  return JSON.stringify(curr) === JSON.stringify(next);
}
