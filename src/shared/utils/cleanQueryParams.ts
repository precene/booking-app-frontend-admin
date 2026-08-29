export function cleanQueryParams<T extends object>(query?: T) {
  return Object.fromEntries(
    Object.entries(query ?? {}).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  );
}
