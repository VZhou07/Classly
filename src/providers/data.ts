import { BACKEND_BASE_URL } from "@/constants";
import {
  createDataProvider,
  type CreateDataProviderOptions,
} from "@refinedev/rest";
import type { ListResponse } from "@/types";

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    mapResponse: async (response) => {
      const payload: ListResponse = await response.json();
      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      const payload: ListResponse = await response.json();
      return payload.pagination?.total ?? 0;
    },
    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
      };

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";

        const value = String(filter.value);
        if (resource === "subjects" && field === "department") {
          params.department = value;
        } else if (resource === "subjects" && field === "name") {
          params.search = value; 
        }
      });

      return params;
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
