import type { IResourceItem } from "@refinedev/core";

import {
  DashboardOutlined,
  ProjectOutlined,
  ShopOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";

export const resources: IResourceItem[] = [
  {
    name: "dashboard",
    list: "/app",
    meta: {
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
  },
  // Companies and Contacts are temporarily hidden
  // {
  //   name: "companies",
  //   list: "/app/companies",
  //   show: "/app/companies/:id",
  //   create: "/app/companies/new",
  //   edit: "/app/companies/edit/:id",
  //   meta: {
  //     label: "Companies",
  //     icon: <ShopOutlined />,
  //   },
  // },
  // {
  //   name: "contacts",
  //   list: "/app/contacts",
  //   create: "/app/contacts/new",
  //   edit: "/app/contacts/edit/:id",
  //   meta: {
  //     label: "Contacts",
  //     icon: <TeamOutlined />,
  //   },
  // },
  {
    name: "lead",
    list: "/app/leads",
    create: "/app/leads/new",
    edit: "/app/leads/edit/:id",
    meta: {
      label: "Leads",
      icon: <RocketOutlined />,
    },
  },
  {
    name: "tasks",
    list: "/app/tasks",
    create: "/app/tasks/new",
    edit: "/app/tasks/edit/:id",
    meta: {
      label: "Tasks",
      icon: <ProjectOutlined />,
    },
  },
];
