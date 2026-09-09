export function getSocketBaseUrl(apiBaseUrl?: string, fallbackOrigin = window.location.origin) {
  if (!apiBaseUrl) {
    return fallbackOrigin;
  }

  return apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");
}
