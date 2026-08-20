"use client";

import { useQuery, useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";

// Wrapper générique TanStack Query autour de l'API backend.
// Voir LUMINA_FRONTEND_CONTEXT.md 4.3.
export function useApiQuery<T>(key: readonly unknown[], url: string, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<T>>(url);
      return data.data as T;
    },
    enabled,
  });
}

export function useApiMutation<TInput, TOutput = unknown>(
  method: "post" | "patch" | "delete",
  url: string | ((input: TInput) => string),
  options?: Omit<UseMutationOptions<TOutput, unknown, TInput>, "mutationFn">
) {
  return useMutation<TOutput, unknown, TInput>({
    mutationFn: async (input: TInput) => {
      const resolvedUrl = typeof url === "function" ? url(input) : url;
      const { data } = await api.request<ApiResponse<TOutput>>({
        method,
        url: resolvedUrl,
        data: method === "delete" ? undefined : input,
      });
      return data.data as TOutput;
    },
    ...options,
  });
}
