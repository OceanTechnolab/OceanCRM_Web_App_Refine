import { useState } from "react";
import { Button, Dropdown, Modal, Form, Input, DatePicker, Select } from "antd";
import {
  PhoneOutlined,
  TeamOutlined,
  MailOutlined,
  MessageOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCreateInteraction } from "@/services/interaction.service";
import type { InteractionType } from "@/interfaces/interaction";

const { TextArea } = Input;

interface QuickActivityButtonProps {
  leadId: string;
  onSuccess?: () => void;
}

export const QuickActivityButton: React.FC<QuickActivityButtonProps> = ({
  leadId,
  onSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<InteractionType | null>(
    null,
  );
  const [form] = Form.useForm();

  // **Use Refine hook - automatic invalidation and notifications**
  const {
    mutate: createInteraction,
    mutation: { isPending: isSubmitting },
  } = useCreateInteraction();

  const activityTypes = [
    { key: "Call", label: "Log Call", icon: <PhoneOutlined />, value: "Call" },
    {
      key: "Meeting",
      label: "Log Meeting",
      icon: <TeamOutlined />,
      value: "Meeting",
    },
    {
      key: "Email",
      label: "Log Email",
      icon: <MailOutlined />,
      value: "Email",
    },
    {
      key: "Message",
      label: "Log Message",
      icon: <MessageOutlined />,
      value: "Message",
    },
    {
      key: "Online",
      label: "Log Online Meeting",
      icon: <GlobalOutlined />,
      value: "Online",
    },
    {
      key: "Other",
      label: "Log Other",
      icon: <ClockCircleOutlined />,
      value: "Other",
    },
  ];

  const handleActivityClick = (type: InteractionType) => {
    setSelectedType(type);
    form.setFieldsValue({
      interaction_type: type,
      interacted_at: dayjs(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
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
          setIsModalOpen(false);
          form.resetFields();
          onSuccess?.();
        },
      },
    );
  };

  const getIcon = (type: InteractionType | null) => {
    const iconMap: Record<string, React.ReactNode> = {
      Call: <PhoneOutlined />,
      Meeting: <TeamOutlined />,
      Email: <MailOutlined />,
      Message: <MessageOutlined />,
      Online: <GlobalOutlined />,
      Other: <ClockCircleOutlined />,
    };
    return type ? iconMap[type] : <ClockCircleOutlined />;
  };

  return (
    <>
      <Dropdown
        menu={{
          items: activityTypes.map((type) => ({
            key: type.key,
            label: type.label,
            icon: type.icon,
            onClick: () => handleActivityClick(type.value as InteractionType),
          })),
        }}
        trigger={["click"]}
      >
        <Button size="small">
          Log Activity <DownOutlined />
        </Button>
      </Dropdown>

      <Modal
        title={`Log ${selectedType || "Activity"}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="interaction_type"
            label="Activity Type"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              options={activityTypes.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
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
            rules={[{ required: true, message: "Please enter notes" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter activity details, outcomes, next steps..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Log Activity
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
