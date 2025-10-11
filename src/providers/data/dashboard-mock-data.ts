// Mock data for dashboard - This will be replaced with actual REST API calls later

export const mockDashboardTotalCounts = {
  companies: {
    totalCount: 24
  },
  contacts: {
    totalCount: 156
  },
  deals: {
    totalCount: 48
  }
};

export const mockDealStages = {
  data: [
    {
      id: "1",
      title: "WON",
      dealsAggregate: [
        {
          groupBy: { closeDateMonth: 1, closeDateYear: 2024 },
          sum: { value: 125000 }
        },
        {
          groupBy: { closeDateMonth: 2, closeDateYear: 2024 },
          sum: { value: 145000 }
        },
        {
          groupBy: { closeDateMonth: 3, closeDateYear: 2024 },
          sum: { value: 165000 }
        },
        {
          groupBy: { closeDateMonth: 4, closeDateYear: 2024 },
          sum: { value: 185000 }
        },
        {
          groupBy: { closeDateMonth: 5, closeDateYear: 2024 },
          sum: { value: 205000 }
        },
        {
          groupBy: { closeDateMonth: 6, closeDateYear: 2024 },
          sum: { value: 225000 }
        }
      ]
    },
    {
      id: "2",
      title: "LOST",
      dealsAggregate: [
        {
          groupBy: { closeDateMonth: 1, closeDateYear: 2024 },
          sum: { value: 45000 }
        },
        {
          groupBy: { closeDateMonth: 2, closeDateYear: 2024 },
          sum: { value: 55000 }
        },
        {
          groupBy: { closeDateMonth: 3, closeDateYear: 2024 },
          sum: { value: 35000 }
        },
        {
          groupBy: { closeDateMonth: 4, closeDateYear: 2024 },
          sum: { value: 65000 }
        },
        {
          groupBy: { closeDateMonth: 5, closeDateYear: 2024 },
          sum: { value: 75000 }
        },
        {
          groupBy: { closeDateMonth: 6, closeDateYear: 2024 },
          sum: { value: 45000 }
        }
      ]
    }
  ],
  total: 2
};

export const mockUpcomingEvents = {
  data: [
    {
      id: "1",
      title: "Product Launch Meeting",
      color: "#1890ff",
      startDate: "2025-10-15T09:00:00Z",
      endDate: "2025-10-15T10:30:00Z"
    },
    {
      id: "2",
      title: "Client Presentation - Acme Corp",
      color: "#52c41a",
      startDate: "2025-10-16T14:00:00Z",
      endDate: "2025-10-16T15:00:00Z"
    },
    {
      id: "3",
      title: "Team Standup",
      color: "#722ed1",
      startDate: "2025-10-17T10:00:00Z",
      endDate: "2025-10-17T10:30:00Z"
    },
    {
      id: "4",
      title: "Quarterly Review",
      color: "#fa8c16",
      startDate: "2025-10-20T11:00:00Z",
      endDate: "2025-10-20T13:00:00Z"
    },
    {
      id: "5",
      title: "Demo Day",
      color: "#eb2f96",
      startDate: "2025-10-25T15:00:00Z",
      endDate: "2025-10-25T17:00:00Z"
    }
  ],
  total: 5
};

export const mockLatestActivitiesAudits = {
  data: [
    {
      id: "1",
      action: "CREATE",
      targetEntity: "Deal",
      targetId: "101",
      changes: [],
      createdAt: "2025-10-11T08:30:00Z",
      user: {
        id: "1",
        name: "John Doe",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
      }
    },
    {
      id: "2",
      action: "UPDATE",
      targetEntity: "Deal",
      targetId: "102",
      changes: [
        { field: "stage", from: "QUALIFIED", to: "PROPOSAL" }
      ],
      createdAt: "2025-10-11T07:15:00Z",
      user: {
        id: "2",
        name: "Jane Smith",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
      }
    },
    {
      id: "3",
      action: "CREATE",
      targetEntity: "Deal",
      targetId: "103",
      changes: [],
      createdAt: "2025-10-10T16:45:00Z",
      user: {
        id: "3",
        name: "Mike Johnson",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
      }
    },
    {
      id: "4",
      action: "UPDATE",
      targetEntity: "Deal",
      targetId: "104",
      changes: [
        { field: "stage", from: "NEW", to: "QUALIFIED" }
      ],
      createdAt: "2025-10-10T14:20:00Z",
      user: {
        id: "1",
        name: "John Doe",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
      }
    },
    {
      id: "5",
      action: "UPDATE",
      targetEntity: "Deal",
      targetId: "105",
      changes: [
        { field: "stage", from: "PROPOSAL", to: "WON" }
      ],
      createdAt: "2025-10-10T11:00:00Z",
      user: {
        id: "2",
        name: "Jane Smith",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
      }
    }
  ],
  total: 5
};

export const mockLatestActivitiesDeals = {
  data: [
    {
      id: "101",
      title: "Enterprise License - TechCorp",
      stage: {
        id: "1",
        title: "NEW"
      },
      company: {
        id: "1",
        name: "TechCorp Solutions",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TechCorp"
      },
      createdAt: "2025-10-11T08:30:00Z"
    },
    {
      id: "102",
      title: "Consulting Services - Innovate Inc",
      stage: {
        id: "3",
        title: "PROPOSAL"
      },
      company: {
        id: "2",
        name: "Innovate Inc",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Innovate"
      },
      createdAt: "2025-10-10T09:00:00Z"
    },
    {
      id: "103",
      title: "Cloud Migration - DataFlow",
      stage: {
        id: "1",
        title: "NEW"
      },
      company: {
        id: "3",
        name: "DataFlow Analytics",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DataFlow"
      },
      createdAt: "2025-10-10T16:45:00Z"
    },
    {
      id: "104",
      title: "Support Package - Acme Corp",
      stage: {
        id: "2",
        title: "QUALIFIED"
      },
      company: {
        id: "4",
        name: "Acme Corporation",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Acme"
      },
      createdAt: "2025-10-09T10:30:00Z"
    },
    {
      id: "105",
      title: "Custom Development - Global Systems",
      stage: {
        id: "5",
        title: "WON"
      },
      company: {
        id: "5",
        name: "Global Systems Ltd",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Global"
      },
      createdAt: "2025-10-09T08:00:00Z"
    }
  ],
  total: 5
};
