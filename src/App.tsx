import { Authenticated, GitHubBanner, Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { GraduationCap } from "lucide-react";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import ClassesList from "./pages/classes/list";
import ClassesCreate from "./pages/classes/create";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import Dashboard from "./pages/dashboard";
import GradesList from "./pages/grades/list";
import GradesShow from "./pages/grades/show";
import GradesManage from "./pages/grades/manage";
import AdminClassGrades from "./pages/grades/admin-class";
import AdminStudentGrades from "./pages/grades/admin-student";
import { Book, Home, School, ClipboardList } from "lucide-react";
import { Layout } from "./components/refine-ui/layout/layout";
import SubjectsList from "./pages/subjects/list";
import SubjectsCreate from "./pages/subjects/create";
import ClassesShow from "./pages/classes/show";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import AcceptInvite from "./pages/accept-invite";
import AuthErrorPage from "./pages/auth/error";
import NotFoundPage from "./pages/not-found";
import InviteCreate from "./pages/invites/create";
import InvitesList from "./pages/invites/list";
import JoinClass from "./pages/join-class";
import { UserPlus, LogIn } from "lucide-react";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "TLmO5X-TTE5LM-TWaqVd",
                title:{
                  text:"Classroom Management App",
                  icon:<School/>
                }
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Home", icon: <Home /> },
                },
                {
                  name: "subjects",
                  list:"/subjects",
                  create:"/subjects/create",
                  meta:{label:"Subjects", icon:<Book/>}
                },
                {
                  name: "classes",
                  list:"/classes",
                  create:"/classes/create",
                  show:"/classes/show/:id",
                  meta:{label:"Classes", icon:<GraduationCap/>}
                },
                {
                  name: "grades",
                  list: "/grades",
                  show: "/grades/:classId",
                  meta: { label: "Grades", icon: <ClipboardList /> },
                },
                {
                  name: "invites",
                  list:"/invites",
                  create:"/invites/create",
                  meta:{label:"Invite people", icon:<UserPlus/>}
                },
                {
                  name: "join-class",
                  list:"/join-class",
                  meta:{label:"Join a class", icon:<LogIn/>}
                }
              ]}
            >
              <Routes>

                <Route
                  element={
                    <Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}>
                      <Layout><Outlet/></Layout>
                    </Authenticated>
                  }
                >
                  <Route path ="/" element={<Dashboard />} />
                  
                  <Route path="subjects">
                    <Route index element={<SubjectsList/>}/>
                    <Route path="create" element={<SubjectsCreate/>}/>
                  </Route> 
                  <Route path="classes">
                    <Route index element={<ClassesList/>}/>
                    <Route path="create" element={<ClassesCreate/>}/>
                    <Route path="show/:id" element={<ClassesShow/>}/>
                    <Route path="show/:id/grades" element={<GradesManage/>}/>
                  </Route>
                  <Route path="grades">
                    <Route index element={<GradesList/>}/>
                    <Route path="class/:classId" element={<AdminClassGrades/>}/>
                    <Route path="class/:classId/student/:studentId" element={<AdminStudentGrades/>}/>
                    <Route path=":classId" element={<GradesShow/>}/>
                  </Route>
                  <Route path="invites">
                    <Route index element={<InvitesList/>}/>
                    <Route path="create" element={<InviteCreate/>}/>
                  </Route>
                  <Route path="join-class" element={<JoinClass/>}/>
                </Route>

                <Route
                  element={
                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                      <NavigateToResource resource="dashboard" />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/auth/error" element={<AuthErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
