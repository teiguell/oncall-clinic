import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  options: {
    url: string;
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
    fetchOptions?: Omit<RequestInit, 'method' | 'body' | 'headers'>;
  }
): Promise<T> {
  const { url, method = 'GET', data, headers = {}, fetchOptions = {} } = options;
  
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
  
  const res = await fetch(url, requestConfig);
  await throwIfResNotOk(res);
  
  // For HEAD or no content responses
  if (method === 'HEAD' || res.status === 204) {
    return {} as T;
  }
  
  return res.json() as Promise<T>;
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
