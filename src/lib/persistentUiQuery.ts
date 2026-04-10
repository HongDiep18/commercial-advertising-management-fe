export const UI_QUERY_GC_TIME = 1000 * 60 * 30

export const PERSISTENT_FALSE_QUERY = {
  queryFn: () => Promise.resolve(false),
  enabled: false,
  initialData: false,
  staleTime: Infinity,
  gcTime: UI_QUERY_GC_TIME,
} as const

export const PERSISTENT_EMPTY_STRING_QUERY = {
  queryFn: () => Promise.resolve(""),
  enabled: false,
  initialData: "",
  staleTime: Infinity,
  gcTime: UI_QUERY_GC_TIME,
} as const
