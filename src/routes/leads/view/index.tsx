import { useState, useEffect } from "react";
import {
  Modal,
  Tabs,
  Descriptions,
  Timeline,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Empty,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Card,
  Divider,
  List,
  Badge,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  PlusOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";
import {
  useInteractionsByLeadId,
  useCreateInteraction,
} from "@/services/interaction.service";
import {
  useAppointmentsByLeadId,
  useCreateAppointment,
} from "@/services/appointment.service";
import { useUsers } from "@/services/user.service";
import type { Interaction, InteractionType } from "@/interfaces/interaction";
import type { Appointment, AppointmentType } from "@/interfaces/appointment";

dayjs.extend(relativeTime);

const { Title } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Icon mapping for interaction types
const interactionIcons: Record<string, React.ReactNode> = {
  Call: <PhoneOutlined />,
  Meeting: <TeamOutlined />,
  Online: <GlobalOutlined />,
  Email: <MailOutlined />,
  Message: <MessageOutlined />,
  Other: <ClockCircleOutlined />,
};

// Color mapping for interaction types
const interactionColors: Record<string, string> = {
  Call: "blue",
  Meeting: "green",
  Online: "purple",
  Email: "orange",
  Message: "cyan",
  Other: "default",
};

interface LeadDetailModalProps {
  leadId: string | null;
  leadData: any | null; // Pass lead data from grid
  open: boolean;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  leadData,
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [form] = Form.useForm();
  const [appointmentForm] = Form.useForm();

  // Use passed leadData directly instead of fetching
  const lead = leadData;
  const loading = false; // No loading since we have data from grid

  // Get current user ID from localStorage
  const currentUserId =
    localStorage.getItem("user_id") || lead?.assigned_user?.id;

  // **Use Refine data hooks for automatic caching, error handling, and invalidation**
  // Interactions - automatically fetched and cached
  const {
    result: interactionsData,
    query: { isLoading: interactionsLoading },
  } = useInteractionsByLeadId(open ? leadId || undefined : undefined);
  const interactions = interactionsData?.data || [];

  // Appointments - automatically fetched and cached
  const {
    result: appointmentsData,
    query: { isLoading: appointmentsLoading },
  } = useAppointmentsByLeadId(open ? leadId || undefined : undefined);
  const appointments = appointmentsData?.data || [];

  // Users - automatically fetched and cached (shared across all components)
  const {
    result: usersData,
    query: { isLoading: usersLoading },
  } = useUsers();
  const users = usersData?.data || [];

  // Create interaction mutation - automatic invalidation and notifications
  const {
    mutate: createInteraction,
    mutation: { isPending: isCreatingInteraction },
  } = useCreateInteraction();

  // Create appointment mutation - automatic invalidation and notifications
  const {
    mutate: createAppointment,
    mutation: { isPending: isCreatingAppointment },
  } = useCreateAppointment();

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      setIsAddingActivity(false);
      setIsAddingAppointment(false);
      form.resetFields();
      appointmentForm.resetFields();
    }
  }, [open, form, appointmentForm]);

  const handleAddInteraction = (values: any) => {
    if (!leadId) return;

    const payload = {
      lead_id: leadId,
      note: values.note,
      interaction_type: values.interaction_type,
      interacted_at: values.interacted_at.toISOString(),
    };

    createInteraction(
      { values: payload },
      {
        onSuccess: () => {
          setIsAddingActivity(false);
          form.resetFields();
        },
      },
    );
  };

  const handleAddAppointment = (values: any) => {
    if (!leadId) return;

    const payload = {
      lead_id: leadId,
      note: values.note,
      appointment_type: values.appointment_type,
      scheduled_at: values.scheduled_at.toISOString(),
      assigned_to: values.assigned_to,
    };

    createAppointment(
      { values: payload },
      {
        onSuccess: () => {
          setIsAddingAppointment(false);
          appointmentForm.resetFields();
        },
      },
    );
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      New: "blue",
      Discussion: "orange",
      Demo: "purple",
      Proposal: "cyan",
      Decided: "green",
      Rejected: "red",
      "Raw (Unqualified)": "default",
    };
    return colors[stage] || "default";
  };

  const renderOverviewTab = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!lead) {
      return (
        <Empty description="Lead not found" style={{ margin: "50px 0" }} />
      );
    }

    return (
      <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "8px" }}>
        {/* Contact Information Card */}
        <Card
          title="Contact Information"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Name">
              {lead.business?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Space>
                  <PhoneOutlined />
                  <Text>{lead.business?.mobile || "-"}</Text>
                </Space>
                {lead.business?.mobile && (
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<WhatsAppOutlined style={{ color: "#25D366" }} />}
                      onClick={() => {
                        const phone = lead.business?.mobile?.replace(/\D/g, "");
                        window.open(`https://wa.me/${phone}`, "_blank");
                      }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<PhoneOutlined style={{ color: "#1890ff" }} />}
                      onClick={() => {
                        window.location.href = `tel:${lead.business?.mobile}`;
                      }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          lead.business?.mobile || "",
                        );
                        message.success("Mobile number copied!");
                      }}
                    />
                  </Space>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Space>
                  <MailOutlined />
                  <Text>{lead.business?.email || "-"}</Text>
                </Space>
                {lead.business?.email && (
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<MailOutlined style={{ color: "#1890ff" }} />}
                      onClick={() => {
                        window.location.href = `mailto:${lead.business?.email}`;
                      }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          lead.business?.email || "",
                        );
                        message.success("Email copied!");
                      }}
                    />
                  </Space>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Business Opportunity Card */}
        <Card
          title="Business Opportunity"
          size="small"
          style={{ marginBottom: 16 }}
        >
          {lead.source && (
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">Received on </Text>
              <Text strong>
                {lead.since ? dayjs(lead.since).format("DD-MMM") : "N/A"}
              </Text>
              <Text type="secondary"> from </Text>
              <Text strong>{lead.source?.name || "UNKNOWN"}</Text>
            </div>
          )}

          {(lead.notes || lead.requirements) && (
            <div
              style={{
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "4px",
                marginBottom: 12,
              }}
            >
              <Text type="secondary">Notes: </Text>
              <Text>{lead.notes || lead.requirements || "-"}</Text>
            </div>
          )}

          {lead.tags && lead.tags.length > 0 && (
            <Space wrap>
              {lead.tags.map((tag: any, index: number) => (
                <Tag key={index}>#{tag.name || tag}</Tag>
              ))}
            </Space>
          )}
        </Card>

        {/* Lead Summary Card */}
        <Card
          size="small"
          style={{ marginBottom: 16 }}
          title={
            <Space>
              <CustomAvatar
                name={lead.business?.business || lead.business?.name}
                size={40}
              />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {lead.business?.business || lead.business?.name}
                </Title>
                <Text type="secondary">
                  {lead.business?.title || lead.business?.designation}
                </Text>
              </div>
            </Space>
          }
          extra={<Tag color={getStageColor(lead.stage)}>{lead.stage}</Tag>}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Potential">
              <Space>
                <DollarOutlined />₹{lead.potential?.toLocaleString() || "0"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {lead.product?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {lead.assigned_user ? (
                <Space>
                  <CustomAvatar name={lead.assigned_user.name} size="small" />
                  {lead.assigned_user.name}
                </Space>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="GSTIN">
              {lead.business?.gstin || "-"}
            </Descriptions.Item>
          </Descriptions>

          {lead.business?.website && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Website">
                  <Space>
                    <GlobalOutlined />
                    <a
                      href={lead.business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lead.business.website}
                    </a>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {(lead.business?.address_line_1 ||
            lead.business?.city ||
            lead.business?.country) && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Address">
                  {[
                    lead.business?.address_line_1,
                    lead.business?.address_line_2,
                    lead.business?.city,
                    lead.business?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Card>
      </div>
    );
  };

  const renderActivitiesTab = () => {
    return (
      <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "8px" }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddingActivity(!isAddingActivity)}
            block
          >
            {isAddingActivity ? "Cancel" : "Log New Activity"}
          </Button>
        </div>

        {/* Activity Form */}
        {isAddingActivity && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddInteraction}
              initialValues={{
                interacted_at: dayjs(),
              }}
            >
              <Form.Item
                name="interaction_type"
                label="Activity Type"
                rules={[
                  { required: true, message: "Please select activity type" },
                ]}
              >
                <Select
                  placeholder="Select activity type"
                  options={[
                    { value: "Call", label: "Call", icon: <PhoneOutlined /> },
                    {
                      value: "Meeting",
                      label: "Meeting",
                      icon: <TeamOutlined />,
                    },
                    {
                      value: "Online",
                      label: "Online Meeting",
                      icon: <VideoCameraOutlined />,
                    },
                    { value: "Email", label: "Email", icon: <MailOutlined /> },
                    {
                      value: "Message",
                      label: "Message",
                      icon: <MessageOutlined />,
                    },
                    {
                      value: "Other",
                      label: "Other",
                      icon: <ClockCircleOutlined />,
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="interacted_at"
                label="Date & Time"
                rules={[
                  { required: true, message: "Please select date and time" },
                ]}
              >
                <DatePicker
                  showTime
                  format="MMM D, YYYY h:mm A"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="note"
                label="Notes"
                rules={[
                  { required: true, message: "Please enter activity notes" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe the activity, key discussion points, outcomes, next steps, etc."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => {
                      setIsAddingActivity(false);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCreatingInteraction}
                  >
                    Save Activity
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Activities Timeline */}
        <Card
          size="small"
          title={`Activities (${interactions.length})`}
          loading={interactionsLoading}
        >
          {interactions.length === 0 ? (
            <Empty
              description="No activities yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Timeline
              items={interactions.map((interaction) => ({
                dot: interactionIcons[interaction.interaction_type],
                color: interactionColors[interaction.interaction_type],
                children: (
                  <div style={{ paddingBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Space>
                        <Tag
                          color={
                            interactionColors[interaction.interaction_type]
                          }
                        >
                          {interaction.interaction_type}
                        </Tag>
                        <Text strong>
                          {interaction.interacted_by_user?.name}
                        </Text>
                      </Space>
                      <Text type="secondary">
                        {dayjs(interaction.interacted_at).fromNow()}
                      </Text>
                    </div>
                    <Text>{interaction.note}</Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {dayjs(interaction.interacted_at).format(
                          "MMM D, YYYY [at] h:mm A",
                        )}
                      </Text>
                    </div>
                  </div>
                ),
              }))}
            />
          )}
        </Card>
      </div>
    );
  };

  const renderAppointmentsTab = () => {
    return (
      <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "8px" }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddingAppointment(!isAddingAppointment)}
            block
          >
            {isAddingAppointment ? "Cancel" : "Schedule New Appointment"}
          </Button>
        </div>

        {/* Appointment Form */}
        {isAddingAppointment && (
          <Card
            size="small"
            style={{ marginBottom: 16 }}
            title="New Appointment"
          >
            <Form
              form={appointmentForm}
              layout="vertical"
              onFinish={handleAddAppointment}
              initialValues={{
                scheduled_at: dayjs().add(1, "day").hour(10).minute(0),
                assigned_to: currentUserId,
              }}
            >
              <Form.Item
                name="appointment_type"
                label="Appointment Type"
                rules={[
                  { required: true, message: "Please select appointment type" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select appointment type"
                  options={[
                    { value: "Call", label: "Call", icon: <PhoneOutlined /> },
                    {
                      value: "Meeting",
                      label: "Meeting",
                      icon: <TeamOutlined />,
                    },
                    {
                      value: "Online",
                      label: "Online Meeting",
                      icon: <VideoCameraOutlined />,
                    },
                    { value: "Email", label: "Email", icon: <MailOutlined /> },
                    {
                      value: "Message",
                      label: "Message",
                      icon: <MessageOutlined />,
                    },
                    {
                      value: "Other",
                      label: "Other",
                      icon: <ClockCircleOutlined />,
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="scheduled_at"
                label="Schedule Date & Time"
                rules={[
                  { required: true, message: "Please select date and time" },
                ]}
              >
                <DatePicker
                  showTime
                  format="DD-MMM-YY hh:mm A"
                  style={{ width: "100%" }}
                  size="large"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                />
              </Form.Item>

              <Form.Item
                name="assigned_to"
                label="Assign To"
                rules={[{ required: true, message: "Please select assignee" }]}
              >
                <Select
                  size="large"
                  placeholder="Please select sales owner user"
                  loading={usersLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={users.map((user) => ({
                    value: user.id,
                    label: user.name,
                    user: user,
                  }))}
                  optionRender={(option) => (
                    <Space>
                      <CustomAvatar name={option.data.user.name} size="small" />
                      <span>{option.data.user.name}</span>
                    </Space>
                  )}
                />
              </Form.Item>

              <Form.Item
                name="note"
                label="Notes"
                rules={[
                  { required: true, message: "Please enter appointment notes" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Meeting agenda, discussion points, preparation notes..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => {
                      setIsAddingAppointment(false);
                      appointmentForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCreatingAppointment}
                  >
                    Schedule Appointment
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Appointments List */}
        <Card
          size="small"
          title={`Upcoming & Past Appointments (${appointments.length})`}
          loading={appointmentsLoading}
        >
          {appointments.length === 0 ? (
            <Empty
              description="No appointments scheduled"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddingAppointment(true)}
              >
                Schedule First Appointment
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={appointments}
              renderItem={(appointment) => {
                const isUpcoming = dayjs(appointment.scheduled_at).isAfter(
                  dayjs(),
                );
                const isPast = dayjs(appointment.scheduled_at).isBefore(
                  dayjs(),
                );
                const isToday = dayjs(appointment.scheduled_at).isSame(
                  dayjs(),
                  "day",
                );

                return (
                  <List.Item
                    key={appointment.id}
                    style={{
                      padding: "16px",
                      background: isToday
                        ? "#e6f7ff"
                        : isUpcoming
                          ? "#f6ffed"
                          : "#fafafa",
                      marginBottom: "8px",
                      borderRadius: "8px",
                      border: `1px solid ${isToday ? "#91d5ff" : isUpcoming ? "#b7eb8f" : "#d9d9d9"}`,
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{ position: "relative" }}>
                          {interactionIcons[appointment.appointment_type]}
                          {isToday && (
                            <Badge
                              status="processing"
                              style={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                              }}
                            />
                          )}
                        </div>
                      }
                      title={
                        <Space>
                          <Tag
                            color={
                              interactionColors[appointment.appointment_type]
                            }
                          >
                            {appointment.appointment_type}
                          </Tag>
                          {isToday && <Tag color="blue">Today</Tag>}
                          {isUpcoming && !isToday && (
                            <Tag color="green">Upcoming</Tag>
                          )}
                          {isPast && <Tag color="default">Past</Tag>}
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Space>
                              <CalendarOutlined />
                              <Text strong>
                                {dayjs(appointment.scheduled_at).format(
                                  "DD-MMM-YY",
                                )}
                              </Text>
                              <ClockCircleOutlined />
                              <Text strong>
                                {dayjs(appointment.scheduled_at).format(
                                  "hh:mm A",
                                )}
                              </Text>
                              <Text type="secondary">
                                ({dayjs(appointment.scheduled_at).fromNow()})
                              </Text>
                            </Space>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Space>
                              <UserOutlined />
                              <Text>Assigned to:</Text>
                              <CustomAvatar
                                name={appointment.assigned_user?.name}
                                size="small"
                              />
                              <Text strong>
                                {appointment.assigned_user?.name}
                              </Text>
                            </Space>
                          </div>
                          <div
                            style={{
                              padding: "8px 12px",
                              background: "#ffffff",
                              borderRadius: "4px",
                              border: "1px solid #f0f0f0",
                            }}
                          >
                            <Text>{appointment.note}</Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>Lead Details</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "overview",
            label: (
              <span>
                <UserOutlined /> Overview
              </span>
            ),
            children: renderOverviewTab(),
          },
          {
            key: "activities",
            label: (
              <span>
                <ClockCircleOutlined /> Activities
                {interactions.length > 0 && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {interactions.length}
                  </Tag>
                )}
              </span>
            ),
            children: renderActivitiesTab(),
          },
          {
            key: "appointments",
            label: (
              <span>
                <CalendarOutlined /> Appointments
                {appointments.length > 0 && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    {appointments.length}
                  </Tag>
                )}
              </span>
            ),
            children: renderAppointmentsTab(),
          },
        ]}
      />
    </Modal>
  );
};
