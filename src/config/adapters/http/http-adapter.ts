export interface HttpRequestOptions {
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

/** Transport abstraction: callers never import axios directly. */
export interface HttpAdapter {
  get<T>(url: string, options?: HttpRequestOptions): Promise<T>;
}
