import { useState, useEffect } from "react";

import { UnorderedListOutlined } from "@ant-design/icons";
import { Card, List, Skeleton as AntdSkeleton, Space } from "antd";
import dayjs from "dayjs";

import { CustomAvatar, Text } from "@/components";
import { mockLatestActivitiesAudits, mockLatestActivitiesDeals } from "@/providers/data/dashboard-mock-data";

type AuditItem = {
  id: string;
  action: string;
  targetEntity: string;
  targetId: string;
  changes: Array<{ field: string; from: string; to: string }>;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

type DealItem = {
  id: string;
  title: string;
  stage: {
    id: string;
    title: string;
  };
  company: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
};

type Props = { limit?: number };

export const DashboardLatestActivities = ({ limit = 5 }: Props) => {
  const [audit, setAudit] = useState<{ data: AuditItem[]; total: number } | null>(null);
  const [deals, setDeals] = useState<{ data: DealItem[]; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls - Replace with actual REST API calls later
    // Example: 
    // fetch(`${API_URL}/dashboard/audits?action=CREATE,UPDATE&targetEntity=Deal&limit=${limit}`)
    // fetch(`${API_URL}/dashboard/deals?ids=${dealIds.join(',')}`)
    const timer = setTimeout(() => {
      setAudit(mockLatestActivitiesAudits);
      setDeals(mockLatestActivitiesDeals);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [limit]);

  return (
    <Card
      headStyle={{ padding: "16px" }}
      bodyStyle={{
        padding: "0 1rem",
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UnorderedListOutlined />
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Latest activities
          </Text>
        </div>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: limit }).map((_, index) => ({
            id: index,
          }))}
          renderItem={(_item, index) => {
            return (
              <List.Item key={index}>
                <List.Item.Meta
                  avatar={
                    <AntdSkeleton.Avatar
                      active
                      size={48}
                      shape="square"
                      style={{
                        borderRadius: "4px",
                      }}
                    />
                  }
                  title={
                    <AntdSkeleton.Button
                      active
                      style={{
                        height: "16px",
                      }}
                    />
                  }
                  description={
                    <AntdSkeleton.Button
                      active
                      style={{
                        width: "300px",
                        height: "16px",
                      }}
                    />
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={audit?.data || []}
          renderItem={(item) => {
            const deal =
              deals?.data.find((deal) => deal.id === `${item.targetId}`) ||
              undefined;

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <CustomAvatar
                      shape="square"
                      size={48}
                      src={deal?.company.avatarUrl}
                      name={deal?.company.name}
                    />
                  }
                  title={dayjs(deal?.createdAt).format("MMM DD, YYYY - HH:mm")}
                  description={
                    <Space size={4}>
                      <Text strong>{item.user?.name}</Text>
                      <Text>
                        {item.action === "CREATE" ? "created" : "moved"}
                      </Text>
                      <Text strong>{deal?.title}</Text>
                      <Text>deal</Text>
                      <Text>{item.action === "CREATE" ? "in" : "to"}</Text>
                      <Text strong>{deal?.stage?.title || "Unassigned"}.</Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};
