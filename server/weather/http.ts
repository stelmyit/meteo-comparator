export async function fetchJson<T>(url: URL, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`${url.hostname}: HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
