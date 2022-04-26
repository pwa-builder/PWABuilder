export function arrayHasChanged<T>(value?: Array<T>, unknownValue?: Array<T>) {
  if (!value || !unknownValue) {
    return false;
  }

  return (
    value.length !== unknownValue.length ||
    value
      .map((val, i) => val !== unknownValue[i])
      .reduce((acc, cur) => acc && cur, true)
  );
}

export function objectHasChanged<T>(value?: T, unknownValue?: T) {
  if (!value || !unknownValue) {
    return false;
  }

  return JSON.stringify(value) !== JSON.stringify(unknownValue);
}
