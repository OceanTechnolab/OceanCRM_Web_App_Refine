import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import { RefineThemes, useNotificationProvider } from "@refinedev/antd";
import {
  Authenticated,
  ErrorComponent,
  Refine,
  useLogout,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { App as AntdApp, ConfigProvider } from "antd";
import { useEffect } from "react";

import { Layout } from "@/components";
import { resources } from "@/config/resources";
import {
  authProvider,
  dataProvider,
  liveProvider,
  setLogoutCallback,
} from "@/providers";
import {
  DashboardPage,
  LeadListPage,
  LoginPage,
  TasksEditPage,
  TasksListPage,
} from "@/routes";
import { FacebookPage } from "@/routes/facebook";

import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

// Component to setup logout callback for axios interceptor
const LogoutCallbackSetup = () => {
  const { mutate: logout } = useLogout();

  useEffect(() => {
    // Register the logout callback so axios interceptor can use it
    setLogoutCallback(() => {
      console.log("[APP] Logout callback triggered from axios interceptor");
      logout();
    });

    return () => {
      // Clean up callback on unmount
      setLogoutCallback(() => {});
    };
  }, [logout]);

  return null; // This component doesn't render anything
};

const App = () => {
  // Use base path only for GitHub Pages builds
  const basename = import.meta.env.VITE_BASE_PATH || "";

  // Disable devtools in production or when not explicitly enabled
  const isDevtoolsEnabled =
    import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEVTOOLS !== "false";

  const refineContent = (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      liveProvider={liveProvider}
      notificationProvider={useNotificationProvider}
      authProvider={authProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        liveMode: "auto",
        projectId: "jRIAJx-Tr8X4H-k3Snu1",
      }}
    >
      {/* Setup logout callback for axios interceptor */}
      <LogoutCallbackSetup />

      <Routes>
        {/* Root redirect - authenticated users go to dashboard, unauthenticated to login */}
        <Route
          index
          element={
            <Authenticated
              key="authenticated-root"
              fallback={<CatchAllNavigate to="/login" />}
            >
              <CatchAllNavigate to="/app/dashboard" />
            </Authenticated>
          }
        />

        <Route
          path="/app"
          element={
            <Authenticated
              key="authenticated-layout"
              fallback={<CatchAllNavigate to="/login" />}
            >
              <Layout>
                <Outlet />
              </Layout>
            </Authenticated>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />

          <Route
            path="tasks"
            element={
              <TasksListPage>
                <Outlet />
              </TasksListPage>
            }
          >
            <Route path="edit/:id" element={<TasksEditPage />} />
          </Route>

          <Route path="leads">
            <Route index element={<LeadListPage />} />
            {/* View is now handled via modal in LeadListPage */}
          </Route>

          <Route path="facebook" element={<FacebookPage />} />

          <Route path="*" element={<ErrorComponent />} />
        </Route>

        <Route
          element={
            <Authenticated key="authenticated-auth" fallback={<Outlet />}>
              <NavigateToResource resource="dashboard" />
            </Authenticated>
          }
        >
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
      <UnsavedChangesNotifier />
      <DocumentTitleHandler />
    </Refine>
  );

  return (
    <BrowserRouter basename={basename}>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          {isDevtoolsEnabled ? (
            <DevtoolsProvider>
              {refineContent}
              <DevtoolsPanel />
            </DevtoolsProvider>
          ) : (
            refineContent
          )}
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
