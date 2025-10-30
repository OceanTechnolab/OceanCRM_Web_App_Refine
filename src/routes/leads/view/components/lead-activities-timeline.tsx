import { Card, Timeline, Space, Empty, Spin } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  VideoCameraOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useInteractionsByLeadId } from "@/services/interaction.service";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";

interface LeadActivitiesTimelineProps {
  leadId: number;
}

/**
 * Lead Activities Timeline Component
 * Displays all interactions associated with a lead in timeline format
 */
export const LeadActivitiesTimeline: React.FC<LeadActivitiesTimelineProps> = ({
  leadId,
}) => {
  const {
    query: { data, isLoading },
  } = useInteractionsByLeadId(leadId.toString());
  const interactions = data?.data || [];

  const getInteractionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      call: <PhoneOutlined style={{ color: "#1890ff" }} />,
      email: <MailOutlined style={{ color: "#ff4d4f" }} />,
      meeting: <VideoCameraOutlined style={{ color: "#52c41a" }} />,
      whatsapp: <WhatsAppOutlined style={{ color: "#25D366" }} />,
      message: <MessageOutlined style={{ color: "#722ed1" }} />,
    };
    return icons[type.toLowerCase()] || <MessageOutlined />;
  };

  const getInteractionColor = (type: string) => {
    const colors: Record<string, string> = {
      call: "blue",
      email: "red",
      meeting: "green",
      whatsapp: "green",
      message: "purple",
    };
    return colors[type.toLowerCase()] || "gray";
  };

  if (isLoading) {
    return (
      <Card title="Activities" size="small" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (!interactions || interactions.length === 0) {
    return (
      <Card title="Activities" size="small" style={{ marginBottom: 16 }}>
        <Empty
          description="No activities yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card title="Activities" size="small" style={{ marginBottom: 16 }}>
      <Timeline
        items={interactions.map((interaction: any) => ({
          color: getInteractionColor(interaction.type),
          dot: getInteractionIcon(interaction.type),
          children: (
            <div>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Space>
                  <Text strong style={{ textTransform: "capitalize" }}>
                    {interaction.type}
                  </Text>
                  <Text type="secondary" size="xs">
                    {dayjs(interaction.date).format("DD MMM, YYYY · HH:mm")}
                  </Text>
                </Space>
                {interaction.notes && (
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    {interaction.notes}
                  </Text>
                )}
                {interaction.created_by && (
                  <Space size={4}>
                    <CustomAvatar
                      name={interaction.created_by.name}
                      size="small"
                    />
                    <Text size="xs" type="secondary">
                      by {interaction.created_by.name}
                    </Text>
                  </Space>
                )}
              </Space>
            </div>
          ),
        }))}
      />
    </Card>
  );
};
