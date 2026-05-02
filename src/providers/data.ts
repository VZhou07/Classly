import { DataProvider,GetListParams,GetListResponse,BaseRecord} from "@refinedev/core";

const mockSubjects = [
  {
    id: 1,
    code: "CS-301",
    name: "Data Structures and Algorithms",
    department: "Computer Science",
    description:
      "Lists, trees, graphs, and asymptotic analysis with weekly programming assignments.",
  },
  {
    id: 2,
    code: "MATH-220",
    name: "Linear Algebra",
    department: "Mathematics",
    description:
      "Matrices, vector spaces, eigenvalues, and orthogonality with applications in science and engineering.",
  },
  {
    id: 3,
    code: "ENG-201",
    name: "Technical Writing for STEM",
    department: "English",
    description:
      "Audience-focused technical reports, documentation, and presentations with structured revision cycles.",
  },
] as const;

export const dataProvider:DataProvider={
  getList:async <TData extends BaseRecord = BaseRecord>({resource}:
    GetListParams):Promise<GetListResponse<TData>>=>{
      if (resource!=="subjects"){
        return {data:[] as TData[], total:0};
      }
      return {
        data:mockSubjects as unknown as TData[],
        total:mockSubjects.length,
      }
  },
  getOne:async()=>{throw new Error("This function is not present in mock")},
  create:async()=>{throw new Error("This function is not present in mock")},
  update:async()=>{throw new Error("This function is not present in mock")},
  deleteOne:async()=>{throw new Error("This function is not present in mock")},

  getApiUrl:()=>"",
}