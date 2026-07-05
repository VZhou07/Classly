import { BACKEND_BASE_URL } from "@/constants";

import {

  createDataProvider,

  type CreateDataProviderOptions,

} from "@refinedev/rest";

import type { CreateResponse, ListResponse } from "@/types";

import type { HttpError } from "@refinedev/core";

import type { UserRole, GetOneResponse } from "@/types";



if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL is not set");
}

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = "Request failed";
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) {
      message = payload.message;
    
  } 
}
  catch (_) {}

  return {

    message: message,

    statusCode: response.status,

  };

};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    mapResponse: async (response) => {

      if (!response.ok) {
        throw await buildHttpError(response);
      }
      const payload: ListResponse = await response.json();
      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      if (!response.ok) {
        throw await buildHttpError(response);
      }
      const payload: ListResponse = await response.json();
      return payload.pagination?.total ?? 0;
    },
    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const role = filters?.find(
        (filter) => "field" in filter && filter.field === "role",
      )?.value as UserRole;
      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
        role: role,
      };
      filters?.forEach((filter) => {
        if (!("field" in filter)) return;
        const value = String(filter.value);
        if (resource === "subjects" && filter.field === "department") {
          params.department = value;
        } else if (resource === "subjects" && filter.field === "name") {
          params.search = value;
        } else if (resource === "invites" && filter.field === "email") {
          params.search = value;
        } else if (resource === "invites" && filter.field === "status") {
          params.status = value;
        } else if (resource === "classes" && filter.field === "teacherId") {
          params.teacherId = value;
        }
      });
      return params;
    },
  },
  create: {
    getEndpoint: ({ resource }) => resource,
    buildBodyParams: async ({ variables }) => variables,
    mapResponse: async (response) => {
      const json: CreateResponse = await response.json();
      return json.data ?? {};
    },
    transformError: async (response) => buildHttpError(response),
  },

  getOne:{
    getEndpoint:({resource,id})=>`${resource}/${id}`,
    mapResponse:async(response)=>{
      if(!response.ok){
        throw await buildHttpError(response);
      }
      const payload: GetOneResponse = await response.json();
      return payload.data ?? {};
    }
  }
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
  credentials: "include",
});
export { dataProvider };


