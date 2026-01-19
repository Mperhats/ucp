function normalizeHost(hostHeader: string): string {
  return hostHeader.trim().toLowerCase();
}

export function resolveHostFromHeader(hostHeader: string | undefined): string | null {
  if (!hostHeader) return null;
  const normalizedHost = normalizeHost(hostHeader);
  if (!normalizedHost) return null;
  return normalizedHost;
}
