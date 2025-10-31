// GraphQL Query and Mutation Types

import type { Deal } from "./schema.types";

// Dashboard Deals Chart Query Types
export interface DealAggregate {
  groupBy?: {
    closeDateMonth?: number;
    closeDateYear?: number;
  };
  sum?: {
    value?: number;
  };
}

export interface DealStage {
  id: string;
  title: string;
  dealsAggregate: DealAggregate[];
}

export interface DashboardDealsChartQuery {
  dealStages: DealStage[];
}

// Generic query response types
export interface QueryResponse<T> {
  data: T;
  loading: boolean;
  error?: Error;
}

// Pagination types
export interface PaginationParams {
  current?: number;
  pageSize?: number;
}

// Filter types
export interface FilterParams {
  field: string;
  operator: string;
  value: any;
}

// Sort types
export interface SortParams {
  field: string;
  order: "ASC" | "DESC";
}
