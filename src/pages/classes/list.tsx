import React, { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { useTable } from '@refinedev/react-table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ShowButton } from '@/components/refine-ui/buttons/show';

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchFilters=searchQuery?[
    {field:"name",operator:"contains" as const, value:searchQuery}
  ]:[];
  const classTable=useTable({
    columns:useMemo(()=>[
      {id:"banner",accessorKey:"bannerUrl",size:100,header:()=><p className="column-title">Banner</p>,cell:({getValue})=><img src={getValue<string>()} alt="Banner" width={100} height={100}/>},
      {id:"name",accessorKey:"name",size:200,header:()=><p className="column-title">Name</p>,cell:({getValue})=><span className="text-foreground"> {getValue<string>()}</span>,filterFn:"includesString"},
      {id:"subject",accessorKey:"subject.name",size:150,header:()=><p className="column-title">Subject</p>,cell:({getValue})=><Badge variant="secondary">{getValue<string>()}</Badge>},
      {id:"teacher",accessorKey:"teacher.name",size:150,header:()=><p className="column-title">Teacher</p>,cell:({getValue})=><Badge variant="secondary">{getValue<string>()}</Badge>},
      {id:"capacity",accessorKey:"capacity",size:100,header:()=><p className="column-title">Capacity</p>,cell:({getValue})=><Badge variant="secondary">{getValue<number>()}</Badge>},
      {id:"status",accessorKey:"status",size:100,header:()=><p className="column-title">Status</p>,cell:({getValue})=><Badge variant="secondary">{getValue<string>()}</Badge>},
      {id:"details",size:140,header:()=><p className="column-title">Details</p>,cell:({row})=><ShowButton resource="classes" recordItemId={row.original.id}>View</ShowButton>}
    ],[]),
    refineCoreProps:{
      resource:"classes",
      pagination:{pageSize:10, mode:"server"},
      filters:{permanent:[...searchFilters]},
      sorters:{
        initial:[{field:"id",order:"desc"}]
      },
    }
  })
  return (
    <ListView>
      <Breadcrumb/>
      <h1 className="page-title">Classes</h1>
      <div className="intro-row">
        <p>Quick access to essential metrics and management tools.</p>
        <div className='actions-row'>
          <div className='search-field'>
            <Search className='search-icon'/>
            <Input
              type="text"
              placeholder="Search by name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e)=>setSearchQuery(e.target.value)}/>
          </div>
          <div className='flex gap-2 w-full sm:w-auto'>
            <CreateButton/>
          </div>
        </div>
      </div>
      <DataTable table={classTable}/>
    </ListView>
  )
}

export default ClassesList