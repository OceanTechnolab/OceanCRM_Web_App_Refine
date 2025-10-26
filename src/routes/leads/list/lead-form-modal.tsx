import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Typography,
  Space,
  Button,
  DatePicker,
  Row,
  Col,
  Divider,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useModalForm, useSelect } from "@refinedev/antd";
import { useGetIdentity, useCreate } from "@refinedev/core";
import dayjs from "dayjs";
import { userService } from "../../../services/user.service";
import type { User } from "../../../interfaces/user";

const { TextArea } = Input;
const { Title } = Typography;

type LeadFormModalProps = {
  action: "create" | "edit";
  opened: boolean;
  onClose: () => void;
  leadId?: string;
  leadData?: any;
};

const StageEnum = [
  { value: "Raw (Unqualified)", label: "Raw (Unqualified)" },
  { value: "New", label: "New" },
  { value: "Discussion", label: "Discussion" },
  { value: "Demo", label: "Demo" },
  { value: "Proposal", label: "Proposal" },
  { value: "Decided", label: "Decided" },
  { value: "Rejected", label: "Rejected" },
];

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  action,
  opened,
  onClose,
  leadId,
  leadData,
}) => {
  const [showNewProductInput, setShowNewProductInput] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isCreatingSource, setIsCreatingSource] = useState(false);

  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Store business ID for edit mode
  const [businessId, setBusinessId] = useState<string | undefined>();

  // User selection state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { data: identity } = useGetIdentity<{ id: string }>();
  const { mutate: createProduct } = useCreate();
  const { mutate: createSource } = useCreate();
  const { mutate: createTag } = useCreate();

  const { formProps, modalProps, form } = useModalForm({
    resource: "lead",
    action: action,
    id: action === "edit" ? leadId : undefined,
    redirect: false,
    autoSave: {
      enabled: false,
    },
    queryOptions: {
      enabled: false, // Disable auto-fetching, we use grid data
    },
    onMutationSuccess: () => {
      form.resetFields();
      onClose();
    },
  });

  const { selectProps: sourceSelectProps, query: sourceQuery } = useSelect({
    resource: "source",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
    queryOptions: { enabled: opened },
  });

  const { selectProps: productSelectProps, query: productQuery } = useSelect({
    resource: "product",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
    queryOptions: { enabled: opened },
  });

  const { selectProps: tagSelectProps, query: tagQuery } = useSelect({
    resource: "tag",
    optionLabel: "name",
    optionValue: "name",
    pagination: { pageSize: 100 },
    queryOptions: { enabled: opened },
  });

  // Fetch users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!opened) return;

      setLoadingUsers(true);
      try {
        // Note: org_id is automatically added by Axios interceptor
        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [opened]);

  // Set default stage to "Raw (Unqualified)" when creating new lead
  useEffect(() => {
    if (action === "create" && opened && form) {
      form.setFieldsValue({
        stage: "Raw (Unqualified)",
      });
    }
  }, [action, opened, form]);

  const handleCreateSource = () => {
    if (!newSourceName.trim()) return;
    setIsCreatingSource(true);
    createSource(
      { resource: "source", values: { name: newSourceName.trim() } },
      {
        onSuccess: (data) => {
          form.setFieldValue("source_id", data.data.id);
          setNewSourceName("");
          setShowNewSourceInput(false);
          setIsCreatingSource(false);
          sourceQuery?.refetch();
        },
        onError: () => setIsCreatingSource(false),
      },
    );
  };

  const handleCreateProduct = () => {
    if (!newProductName.trim()) return;
    setIsCreatingProduct(true);
    createProduct(
      { resource: "product", values: { name: newProductName.trim() } },
      {
        onSuccess: (data) => {
          form.setFieldValue("product_id", data.data.id);
          setNewProductName("");
          setShowNewProductInput(false);
          setIsCreatingProduct(false);
          productQuery?.refetch();
        },
        onError: () => setIsCreatingProduct(false),
      },
    );
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    createTag(
      { resource: "tag", values: { name: newTagName.trim() } },
      {
        onSuccess: (data) => {
          const currentTags = form.getFieldValue("tags") || [];
          form.setFieldValue("tags", [...currentTags, data.data.name]);
          setNewTagName("");
          setShowNewTagInput(false);
          setIsCreatingTag(false);
          tagQuery?.refetch();
        },
        onError: () => setIsCreatingTag(false),
      },
    );
  };

  // Populate form when editing with grid data
  useEffect(() => {
    if (action === "edit" && leadData && form && opened) {
      // Use requestAnimationFrame to ensure form is mounted
      requestAnimationFrame(() => {
        console.log("Using grid data for edit:", leadData);
        const {
          business,
          since,
          product,
          source,
          assigned_user,
          ...otherData
        } = leadData;

        // Store business ID for update
        setBusinessId(business?.id);

        // Strip +91 prefix from mobile number for editing
        const mobileNumber = business?.mobile || "";
        const displayMobile = mobileNumber.startsWith("+91") 
          ? mobileNumber.substring(3) 
          : mobileNumber;

        form.setFieldsValue({
          ...otherData,
          business_name: business?.business || "",
          contact_person: business?.name || "",
          title: business?.title || undefined,
          designation: business?.designation || "",
          mobile: displayMobile,
          email: business?.email || "",
          website: business?.website || "",
          address: business?.address_line_1 || "",
          address_line2: business?.address_line_2 || "",
          city: business?.city || "",
          country: business?.country || "",
          GSTIN: business?.gstin || "",
          code: business?.code || "",
          product_id: product?.id || undefined,
          source_id: source?.id || undefined,
          assigned_user_id: assigned_user?.id || undefined,
          since: since ? dayjs(since) : undefined,
        });
      });
    }
  }, [action, leadData, form, opened]);

  const handleModalClose = () => {
    form?.resetFields();
    onClose();
  };

  const handleFinish = (values: any) => {
    // Validate that at least one of name, email, or mobile is provided
    if (!values.contact_person && !values.email && !values.mobile) {
      form.setFields([
        {
          name: 'contact_person',
          errors: ['At least one of Name, Email, or Mobile is required'],
        },
        {
          name: 'email',
          errors: ['At least one of Name, Email, or Mobile is required'],
        },
        {
          name: 'mobile',
          errors: ['At least one of Name, Email, or Mobile is required'],
        },
      ]);
      return;
    }

    // Concatenate +91 with mobile number if provided
    const mobileNumber = values.mobile ? `+91${values.mobile}` : "";

    const businessData: any = {
      business: values.business_name || "",
      name: values.contact_person || "",
      title: values.title || null,
      designation: values.designation || "",
      mobile: mobileNumber,
      email: values.email || "",
      website: values.website || "",
      address_line_1: values.address || "",
      address_line_2: values.address_line2 || "",
      city: values.city || "",
      country: values.country || "",
      gstin: values.GSTIN || "",
      code: values.code || "",
    };

    // Include business ID when editing
    if (action === "edit" && businessId) {
      businessData.id = businessId;
    }

    const transformedData = {
      assigned_to: values.assigned_user_id || identity?.id || null,
      tags: values.tags || [],
      stage: values.stage,
      source_id: values.source_id || null,
      product_id: values.product_id || null,
      potential: values.potential || 0,
      requirements: values.requirements || "",
      notes: values.notes || "",
      business: businessData,
      since: values.since
        ? values.since.toISOString()
        : new Date().toISOString(),
    };

    console.log("Final data to submit:", transformedData);
    formProps?.onFinish?.(transformedData);
  };

  const handleModalAfterOpen = (open: boolean) => {
    if (open && action === "edit" && leadData && form) {
      console.log(
        "Modal opened - setting form values with grid data:",
        leadData,
      );
      const { business, since, product, source, assigned_user, ...otherData } =
        leadData;

      // Strip +91 prefix from mobile number for editing
      const mobileNumber = business?.mobile || "";
      const displayMobile = mobileNumber.startsWith("+91") 
        ? mobileNumber.substring(3) 
        : mobileNumber;

      form.setFieldsValue({
        ...otherData,
        business_name: business?.business || "",
        contact_person: business?.name || "",
        title: business?.title || undefined,
        designation: business?.designation || "",
        mobile: displayMobile,
        email: business?.email || "",
        website: business?.website || "",
        address: business?.address_line_1 || "",
        address_line2: business?.address_line_2 || "",
        city: business?.city || "",
        country: business?.country || "",
        GSTIN: business?.gstin || "",
        code: business?.code || "",
        product_id: product?.id || undefined,
        source_id: source?.id || undefined,
        assigned_user_id: assigned_user?.id || undefined,
        since: since ? dayjs(since) : undefined,
      });
    }
  };

  return (
    <Modal
      {...modalProps}
      open={opened}
      onCancel={handleModalClose}
      afterOpenChange={handleModalAfterOpen}
      title={action === "create" ? "Enter Lead" : "Edit Lead"}
      width={1150}
      style={{ top: 10 }}
      okText="Save & Close"
      cancelText="Cancel"
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 24px",
        },
      }}
    >
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        {/* Core Data Section */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "8px 16px",
            marginBottom: 12,
            borderRadius: 4,
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            Core Data
          </Title>
        </div>

        <Row gutter={16}>
          {/* Left Column */}
          <Col span={12}>
            <Form.Item
              label="Business"
              name="business_name"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="" size="small" />
            </Form.Item>

            <Row gutter={8}>
              <Col span={6}>
                <Form.Item
                  label="Name"
                  name="title"
                  style={{ marginBottom: 10 }}
                >
                  <Select placeholder="Mr." allowClear size="small">
                    <Select.Option value="Mr.">Mr.</Select.Option>
                    <Select.Option value="Ms.">Ms.</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item
                  label=" "
                  name="contact_person"
                  style={{ marginBottom: 10 }}
                >
                  <Input placeholder="Contact Person Name" size="small" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Designation"
              name="designation"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="" size="small" />
            </Form.Item>

            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter valid 10-digit Indian mobile number",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="10-digit mobile number" addonBefore="+91" size="small" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { type: "email", message: "Invalid email" },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="" size="small" />
            </Form.Item>

            <Form.Item
              label="Website"
              name="website"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="" size="small" />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col span={12}>
            <Form.Item
              label="Address"
              name="address"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Line 1" size="small" />
            </Form.Item>

            <Form.Item
              label=" "
              name="address_line2"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Line 2" size="small" />
            </Form.Item>

            <Form.Item
              label="Country"
              name="country"
              style={{ marginBottom: 10 }}
            >
              <Select placeholder="India" showSearch size="small">
                <Select.Option value="India">India</Select.Option>
                <Select.Option value="USA">USA</Select.Option>
                <Select.Option value="UK">UK</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="City"
              name="city"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="" size="small" />
            </Form.Item>

            <Form.Item label="GSTIN" name="GSTIN" style={{ marginBottom: 10 }}>
              <Input placeholder="" size="small" />
            </Form.Item>

            <Form.Item label="Code" name="code" style={{ marginBottom: 10 }}>
              <Input placeholder="" size="small" />
            </Form.Item>
          </Col>
        </Row>

        {/* Business Opportunity Section */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "8px 16px",
            marginBottom: 12,
            marginTop: 4,
            borderRadius: 4,
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            Business Opportunity
          </Title>
        </div>

        <Row gutter={16}>
          {/* Left Column */}
          <Col span={12}>
            <Row gutter={8}>
              <Col span={16}>
                <Form.Item
                  label="Source"
                  name="source_id"
                  style={{ marginBottom: 10 }}
                >
                  <Select
                    {...sourceSelectProps}
                    placeholder="Select"
                    size="small"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <div
                          style={{
                            padding: "8px",
                            borderTop: "1px solid #f0f0f0",
                          }}
                        >
                          {!showNewSourceInput ? (
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={() => setShowNewSourceInput(true)}
                              style={{ width: "100%" }}
                              size="small"
                            >
                              Add new source
                            </Button>
                          ) : (
                            <Space style={{ width: "100%" }}>
                              <Input
                                placeholder="Source name"
                                value={newSourceName}
                                onChange={(e) =>
                                  setNewSourceName(e.target.value)
                                }
                                onPressEnter={handleCreateSource}
                                style={{ flex: 1 }}
                              />
                              <Button
                                type="primary"
                                onClick={handleCreateSource}
                                loading={isCreatingSource}
                                disabled={!newSourceName.trim()}
                                size="small"
                              >
                                Add
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowNewSourceInput(false);
                                  setNewSourceName("");
                                }}
                                size="small"
                              >
                                Cancel
                              </Button>
                            </Space>
                          )}
                        </div>
                      </>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Since"
                  name="since"
                  style={{ marginBottom: 10 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD-MMM-YY"
                    size="small"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Product"
              name="product_id"
              style={{ marginBottom: 10 }}
            >
              <Select
                {...productSelectProps}
                placeholder=""
                size="small"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div
                      style={{
                        padding: "8px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      {!showNewProductInput ? (
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setShowNewProductInput(true)}
                          style={{ width: "100%" }}
                          size="small"
                        >
                          Add new product
                        </Button>
                      ) : (
                        <Space style={{ width: "100%" }}>
                          <Input
                            placeholder="Product name"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            onPressEnter={handleCreateProduct}
                            style={{ flex: 1 }}
                            size="small"
                          />
                          <Button
                            type="primary"
                            onClick={handleCreateProduct}
                            loading={isCreatingProduct}
                            disabled={!newProductName.trim()}
                            size="small"
                          >
                            Add
                          </Button>
                          <Button
                            onClick={() => {
                              setShowNewProductInput(false);
                              setNewProductName("");
                            }}
                            size="small"
                          >
                            Cancel
                          </Button>
                        </Space>
                      )}
                    </div>
                  </>
                )}
              />
            </Form.Item>

            <Form.Item
              label="Potential (₹)"
              name="potential"
              style={{ marginBottom: 10 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0"
                min={0}
                precision={2}
                size="small"
              />
            </Form.Item>

            <Form.Item
              label="Assigned to"
              name="assigned_user_id"
              style={{ marginBottom: 10 }}
            >
              <Select
                placeholder="Select a user"
                loading={loadingUsers}
                showSearch
                optionFilterProp="label"
                size="small"
                allowClear
                options={users.map((user) => ({
                  label: `${user.name}`,
                  value: user.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Stage"
              name="stage"
              rules={[{ required: true, message: "Required" }]}
              style={{ marginBottom: 10 }}
            >
              <Select
                placeholder="Select stage"
                options={StageEnum}
                size="small"
              />
            </Form.Item>

            <Form.Item label="Tags" name="tags" style={{ marginBottom: 10 }}>
              <Select
                {...tagSelectProps}
                mode="multiple"
                placeholder="Select or add tags"
                style={{ width: "100%" }}
                size="small"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div
                      style={{
                        padding: "8px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      {!showNewTagInput ? (
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setShowNewTagInput(true)}
                          style={{ width: "100%" }}
                          size="small"
                        >
                          Add new tag
                        </Button>
                      ) : (
                        <Space style={{ width: "100%" }}>
                          <Input
                            placeholder="Tag name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onPressEnter={handleCreateTag}
                            style={{ flex: 1 }}
                            size="small"
                          />
                          <Button
                            type="primary"
                            onClick={handleCreateTag}
                            loading={isCreatingTag}
                            disabled={!newTagName.trim()}
                            size="small"
                          >
                            Add
                          </Button>
                          <Button
                            onClick={() => {
                              setShowNewTagInput(false);
                              setNewTagName("");
                            }}
                            size="small"
                          >
                            Cancel
                          </Button>
                        </Space>
                      )}
                    </div>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col span={12}>
            <Form.Item
              label="Requirement"
              name="requirements"
              style={{ marginBottom: 10 }}
            >
              <TextArea rows={3} placeholder="" style={{ fontSize: "13px" }} />
            </Form.Item>

            <Form.Item label="Notes" name="notes" style={{ marginBottom: 10 }}>
              <TextArea rows={3} placeholder="" style={{ fontSize: "13px" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
