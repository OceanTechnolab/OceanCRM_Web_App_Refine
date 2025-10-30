import {
  Modal,
  Typography,
  Space,
  Card,
  Descriptions,
  Tag,
  Button,
  Empty,
  Spin,
  Row,
  Col,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";
import { LeadActivitiesTimeline, LeadAppointmentsList } from "./components";

const { Title } = Typography;

interface LeadViewModalProps {
  opened: boolean;
  onClose: () => void;
  lead: any;
}

/**
 * Lead View Modal
 * Modal component for displaying comprehensive lead information with activities and appointments
 */
export const LeadViewModal: React.FC<LeadViewModalProps> = ({
  opened,
  onClose,
  lead,
}) => {
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

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // You can add a message notification here if needed
  };

  if (!lead) {
    return (
      <Modal
        open={opened}
        onCancel={onClose}
        footer={null}
        width={1200}
        centered
      >
        <Empty description="Lead not found" />
      </Modal>
    );
  }

  return (
    <Modal
      open={opened}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      styles={{
        body: { maxHeight: "80vh", overflowY: "auto" },
      }}
      closeIcon={<CloseOutlined />}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <CustomAvatar
            name={lead.business?.business || lead.business?.name}
            size={48}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {lead.business?.business || lead.business?.name}
            </Title>
            <Text type="secondary">
              {lead.business?.title} {lead.business?.name}
            </Text>
          </div>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* Contact Information Card */}
          <Card
            title="Contact Information"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Business">
                {lead.business?.business || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Person">
                <Space>
                  <UserOutlined />
                  {lead.business?.title} {lead.business?.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Designation">
                {lead.business?.designation || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                <Space split="|">
                  <span>{lead.business?.mobile || "-"}</span>
                  {lead.business?.mobile && (
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        icon={<WhatsAppOutlined style={{ color: "#25D366" }} />}
                        onClick={() => {
                          const phone = lead.business?.mobile?.replace(
                            /\D/g,
                            "",
                          );
                          window.open(`https://wa.me/${phone}`, "_blank");
                        }}
                      />
                      <Button
                        type="link"
                        size="small"
                        icon={<PhoneOutlined style={{ color: "#1890ff" }} />}
                        onClick={() => {
                          window.location.href = `tel:${lead.business?.mobile}`;
                        }}
                      />
                      <Button
                        type="link"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() =>
                          handleCopyToClipboard(
                            lead.business?.mobile || "",
                            "Mobile",
                          )
                        }
                      />
                    </Space>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space split="|">
                  <span>{lead.business?.email || "-"}</span>
                  {lead.business?.email && (
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        icon={<MailOutlined style={{ color: "#1890ff" }} />}
                        onClick={() => {
                          window.location.href = `mailto:${lead.business?.email}`;
                        }}
                      />
                      <Button
                        type="link"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() =>
                          handleCopyToClipboard(
                            lead.business?.email || "",
                            "Email",
                          )
                        }
                      />
                    </Space>
                  )}
                </Space>
              </Descriptions.Item>
              {lead.business?.website && (
                <Descriptions.Item label="Website">
                  <a
                    href={lead.business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lead.business.website}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Lead Details Card */}
          <Card title="Lead Details" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Stage">
                <Tag color={getStageColor(lead.stage)}>{lead.stage}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Since">
                <Space>
                  <CalendarOutlined />
                  {lead.since ? dayjs(lead.since).format("DD MMM, YYYY") : "-"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {lead.source?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Product">
                {lead.product?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Potential">
                <Space>
                  <DollarOutlined />₹{lead.potential?.toLocaleString() || "0"}
                </Space>
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
              {lead.tags && lead.tags.length > 0 && (
                <Descriptions.Item label="Tags">
                  <Space wrap>
                    {lead.tags.map((tag: any, index: number) => (
                      <Tag key={index}>#{tag.name || tag}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Notes and Requirements Card */}
          {(lead.notes || lead.requirements) && (
            <Card
              title="Notes & Requirements"
              size="small"
              style={{ marginBottom: 16 }}
            >
              {lead.requirements && (
                <div style={{ marginBottom: 12 }}>
                  <Text strong>Requirements:</Text>
                  <p>{lead.requirements}</p>
                </div>
              )}
              {lead.notes && (
                <div>
                  <Text strong>Notes:</Text>
                  <p>{lead.notes}</p>
                </div>
              )}
            </Card>
          )}

          {/* Address Card */}
          {(lead.business?.address_line_1 ||
            lead.business?.city ||
            lead.business?.country) && (
            <Card title="Address" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                {lead.business?.address_line_1 && (
                  <Descriptions.Item label="Address">
                    {lead.business.address_line_1}
                    {lead.business?.address_line_2 && (
                      <>
                        <br />
                        {lead.business.address_line_2}
                      </>
                    )}
                  </Descriptions.Item>
                )}
                {lead.business?.city && (
                  <Descriptions.Item label="City">
                    {lead.business.city}
                  </Descriptions.Item>
                )}
                {lead.business?.country && (
                  <Descriptions.Item label="Country">
                    {lead.business.country}
                  </Descriptions.Item>
                )}
                {lead.business?.code && (
                  <Descriptions.Item label="Postal Code">
                    {lead.business.code}
                  </Descriptions.Item>
                )}
                {lead.business?.gstin && (
                  <Descriptions.Item label="GSTIN">
                    {lead.business.gstin}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Right Column - Activities & Appointments */}
        <Col xs={24} lg={12}>
          <LeadActivitiesTimeline leadId={lead.id} />
          <LeadAppointmentsList leadId={lead.id} />
        </Col>
      </Row>
    </Modal>
  );
};
