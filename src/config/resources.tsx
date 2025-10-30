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
    list: "/app/dashboard",
    meta: {
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
  },
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
  // Meta resources (not displayed in menu, but available for data hooks)
  {
    name: "user",
    meta: {
      hide: true, // Hide from menu
    },
  },
  {
    name: "interaction",
    meta: {
      hide: true, // Hide from menu
    },
  },
  {
    name: "appointment",
    meta: {
      hide: true, // Hide from menu
    },
  },
];
