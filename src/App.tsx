import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import { RefineThemes, useNotificationProvider } from "@refinedev/antd";
import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { App as AntdApp, ConfigProvider } from "antd";

import { Layout } from "@/components";
import { resources } from "@/config/resources";
import { authProvider, dataProvider, liveProvider } from "@/providers";
import {
  CompanyCreatePage,
  CompanyEditPage,
  CompanyListPage,
  ContactListPage,
  DashboardPage,
  LeadListPage,
  LoginPage,
  TasksCreatePage,
  TasksEditPage,
  TasksListPage,
} from "@/routes";

import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

const App = () => {
  // Use base path only for GitHub Pages builds
  const basename = import.meta.env.VITE_BASE_PATH || "";
  
  // Disable devtools in production or when not explicitly enabled
  const isDevtoolsEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEVTOOLS !== "false";

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
                    <Route path="new" element={<TasksCreatePage />} />
                    <Route path="edit/:id" element={<TasksEditPage />} />
                  </Route>

                  {/* Companies and Contacts pages are temporarily hidden */}
                  {/*
                      <Route path="companies">
                        <Route index element={<CompanyListPage />} />
                        <Route path="new" element={<CompanyCreatePage />} />
                        <Route path="edit/:id" element={<CompanyEditPage />} />
                      </Route>

                      <Route path="contacts">
                        <Route index element={<ContactListPage />} />
                      </Route>
                      */}

                  <Route path="leads">
                    <Route index element={<LeadListPage />} />
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>

                <Route
                  element={
                    <Authenticated
                      key="authenticated-auth"
                      fallback={<Outlet />}
                    >
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
