import { Card, List, Space, Tag, Empty, Spin } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppointmentsByLeadId } from "@/services/appointment.service";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";

interface LeadAppointmentsListProps {
  leadId: number;
}

/**
 * Lead Appointments List Component
 * Displays all appointments scheduled for a lead
 */
export const LeadAppointmentsList: React.FC<LeadAppointmentsListProps> = ({
  leadId,
}) => {
  const {
    query: { data, isLoading },
  } = useAppointmentsByLeadId(leadId.toString());
  const appointments = data?.data || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "blue",
      completed: "green",
      cancelled: "red",
      rescheduled: "orange",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const isPastAppointment = (dateTime: string) => {
    return dayjs(dateTime).isBefore(dayjs());
  };

  if (isLoading) {
    return (
      <Card title="Appointments" size="small" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card title="Appointments" size="small" style={{ marginBottom: 16 }}>
        <Empty
          description="No appointments scheduled"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card title="Appointments" size="small" style={{ marginBottom: 16 }}>
      <List
        dataSource={appointments}
        renderItem={(appointment: any) => {
          const isPast = isPastAppointment(appointment.date_time);

          return (
            <List.Item
              style={{
                opacity: isPast && appointment.status === "scheduled" ? 0.6 : 1,
              }}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: isPast ? "#f5f5f5" : "#e6f7ff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CalendarOutlined
                      style={{
                        fontSize: 20,
                        color: isPast ? "#bfbfbf" : "#1890ff",
                      }}
                    />
                  </div>
                }
                title={
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <Text strong>{appointment.title}</Text>
                      <Tag color={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Tag>
                    </Space>
                    <Space size="middle">
                      <Space size={4}>
                        <CalendarOutlined style={{ color: "#8c8c8c" }} />
                        <Text size="xs" type="secondary">
                          {dayjs(appointment.date_time).format("DD MMM, YYYY")}
                        </Text>
                      </Space>
                      <Space size={4}>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <Text size="xs" type="secondary">
                          {dayjs(appointment.date_time).format("HH:mm")}
                        </Text>
                      </Space>
                    </Space>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                    {appointment.location && (
                      <Space size={4}>
                        <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                        <Text size="xs" type="secondary">
                          {appointment.location}
                        </Text>
                      </Space>
                    )}
                    {appointment.notes && (
                      <Text size="xs" type="secondary">
                        {appointment.notes}
                      </Text>
                    )}
                    {appointment.assigned_to && (
                      <Space size={4}>
                        <CustomAvatar
                          name={appointment.assigned_to.name}
                          size="small"
                        />
                        <Text size="xs" type="secondary">
                          with {appointment.assigned_to.name}
                        </Text>
                      </Space>
                    )}
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};
