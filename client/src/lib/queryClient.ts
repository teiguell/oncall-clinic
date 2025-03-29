import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  urlOrOptions: string | {
    url: string;
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
    fetchOptions?: Omit<RequestInit, 'method' | 'body' | 'headers'>;
  },
  optionsOrMethod?: RequestInit | string,
  bodyOrUndefined?: unknown
): Promise<Response> {
  let url: string;
  let method: string = 'GET';
  let data: unknown;
  let headers: Record<string, string> = {};
  let fetchOptions: Omit<RequestInit, 'method' | 'body' | 'headers'> = {};

  // Handle different calling patterns
  if (typeof urlOrOptions === 'string') {
    // Pattern: apiRequest(url, options) or apiRequest(url, method, body)
    url = urlOrOptions;
    
    if (typeof optionsOrMethod === 'string') {
      // Pattern: apiRequest(url, method, body)
      method = optionsOrMethod;
      data = bodyOrUndefined;
    } else if (optionsOrMethod) {
      // Pattern: apiRequest(url, { method, body, headers, ...rest })
      const options = optionsOrMethod;
      method = options.method || 'GET';
      data = options.body;
      headers = options.headers as Record<string, string> || {};
      // Copiamos todo menos method, body y headers
      const { method: _, body: __, headers: ___, ...rest } = options;
      fetchOptions = rest;
    }
  } else {
    // Pattern: apiRequest({ url, method, data, headers, fetchOptions })
    const options = urlOrOptions;
    url = options.url;
    method = options.method || 'GET';
    data = options.data;
    headers = options.headers || {};
    fetchOptions = options.fetchOptions || {};
  }
  
  // Merge headers, ensuring Content-Type is set for requests with data
  const mergedHeaders = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...headers
  };
  
  // Create request object
  const requestConfig: RequestInit = {
    method,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    headers: mergedHeaders,
    ...fetchOptions
  };
  
  return await fetch(url, requestConfig);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
