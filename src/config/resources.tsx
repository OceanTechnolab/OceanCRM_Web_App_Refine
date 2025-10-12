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
    list: "/",
    meta: {
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
  },
  // Companies and Contacts are temporarily hidden
  // {
  //   name: "companies",
  //   list: "/companies",
  //   show: "/companies/:id",
  //   create: "/companies/new",
  //   edit: "/companies/edit/:id",
  //   meta: {
  //     label: "Companies",
  //     icon: <ShopOutlined />,
  //   },
  // },
  // {
  //   name: "contacts",
  //   list: "/contacts",
  //   create: "/contacts/new",
  //   edit: "/contacts/edit/:id",
  //   meta: {
  //     label: "Contacts",
  //     icon: <TeamOutlined />,
  //   },
  // },
  {
    name: "lead",
    list: "/leads",
    create: "/leads/new",
    edit: "/leads/edit/:id",
    meta: {
      label: "Leads",
      icon: <RocketOutlined />,
    },
  },
  {
    name: "tasks",
    list: "/tasks",
    create: "/tasks/new",
    edit: "/tasks/edit/:id",
    meta: {
      label: "Tasks",
      icon: <ProjectOutlined />,
    },
  },
];
