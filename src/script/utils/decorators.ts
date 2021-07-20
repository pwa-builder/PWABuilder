export function memoizedReference<T>(getter: () => T) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptorMap
  ) {
    descriptor.value = getter();
  };
}
