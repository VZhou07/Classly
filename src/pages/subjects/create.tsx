import React from 'react'
import { RequireRole } from '@/components/require-role';

const SubjectsCreate =()=>{
  return (
    <div>create</div>
  )
}

const SubjectsCreatePage = () => (
  <RequireRole roles={["admin"]}>
    <SubjectsCreate />
  </RequireRole>
);

export default SubjectsCreatePage