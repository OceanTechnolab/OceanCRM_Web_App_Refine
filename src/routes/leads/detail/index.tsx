import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useOne } from "@refinedev/core";
import {
  Card,
  Descriptions,
  Timeline,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Empty,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
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
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";
import {
  useInteractionsByLeadId,
  useCreateInteraction,
} from "@/services/interaction.service";
import type { Interaction, InteractionType } from "@/interfaces/interaction";

dayjs.extend(relativeTime);

const { Title } = Typography;
const { TextArea } = Input;

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

export const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use Refine's useOne hook to fetch lead data
  const { query } = useOne({
    resource: "lead",
    id: id || "",
    queryOptions: {
      enabled: !!id,
    },
  });

  const { data: leadData, isLoading: loading } = query;
  const lead = leadData?.data;

  // **Use Refine hooks - automatic caching and invalidation**
  const {
    result: interactionsData,
    query: { isLoading: interactionsLoading },
  } = useInteractionsByLeadId(id);
  const interactions = interactionsData?.data || [];

  const {
    mutate: createInteraction,
    mutation: { isPending: isSubmitting },
  } = useCreateInteraction();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddInteraction = (values: any) => {
    if (!id) return;

    const payload = {
      lead_id: id,
      note: values.note,
      interaction_type: values.interaction_type,
      interacted_at: values.interacted_at.toISOString(),
    };

    createInteraction(
      { values: payload },
      {
        onSuccess: () => {
          setIsDrawerOpen(false);
          form.resetFields();
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty description="Lead not found" />
        <Button type="primary" onClick={() => navigate("/app/leads")}>
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/app/leads")}
          style={{ marginBottom: "16px" }}
        >
          Back to Leads
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <CustomAvatar
              name={lead.business?.business || lead.business?.name}
              src={lead.business?.logo}
              size={64}
            />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {lead.business?.business || lead.business?.name}
              </Title>
              <Tag
                color={getStageColor(lead.stage)}
                style={{ marginTop: "8px" }}
              >
                {lead.stage}
              </Tag>
            </div>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Log Activity
            </Button>
          </Space>
        </div>
      </div>

      {/* Lead Details Card */}
      <Card title="Lead Information" style={{ marginBottom: "24px" }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Contact Person">
            {lead.business?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {lead.business?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Mobile">
            {lead.business?.mobile || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Potential Value">
            ₹{lead.potential?.toLocaleString() || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Product">
            {lead.product?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Source">
            {lead.source?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {lead.assigned_user ? (
              <Space>
                <CustomAvatar
                  name={lead.assigned_user.name}
                  src={lead.assigned_user.avatar}
                  size={24}
                />
                {lead.assigned_user.name}
              </Space>
            ) : (
              "Unassigned"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {dayjs(lead.created_at).format("MMM D, YYYY")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Activity Timeline */}
      <Card
        title="Activity Timeline"
        extra={
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setIsDrawerOpen(true)}
          >
            Add Activity
          </Button>
        }
      >
        {interactionsLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin />
          </div>
        ) : interactions.length === 0 ? (
          <Empty
            description="No activities yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Log First Activity
            </Button>
          </Empty>
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
                        color={interactionColors[interaction.interaction_type]}
                      >
                        {interaction.interaction_type}
                      </Tag>
                      <Text strong>{interaction.interacted_by_user.name}</Text>
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

      {/* Add Activity Drawer */}
      <Drawer
        title="Log Activity"
        placement="right"
        width={500}
        onClose={() => {
          setIsDrawerOpen(false);
          form.resetFields();
        }}
        open={isDrawerOpen}
      >
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
            rules={[{ required: true, message: "Please select activity type" }]}
          >
            <Select
              size="large"
              placeholder="Select activity type"
              options={[
                { value: "Call", label: "Call", icon: <PhoneOutlined /> },
                { value: "Meeting", label: "Meeting", icon: <TeamOutlined /> },
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
            rules={[{ required: true, message: "Please select date and time" }]}
          >
            <DatePicker
              showTime
              format="MMM D, YYYY h:mm A"
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="note"
            label="Notes"
            rules={[{ required: true, message: "Please enter activity notes" }]}
          >
            <TextArea
              rows={6}
              placeholder="Describe the activity, key discussion points, outcomes, next steps, etc."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsDrawerOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Log Activity
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};
