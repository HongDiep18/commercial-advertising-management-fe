export const ITEMS_PER_PAGE = 10
export const ALL_FILTER_VALUE = "ALL"

export type FilterValue<T extends string> = T | typeof ALL_FILTER_VALUE
