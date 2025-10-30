import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Button,
  DatePicker,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import { useGetIdentity, useCreate } from "@refinedev/core";
import dayjs from "dayjs";
import { useUsers } from "@/services/user.service";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Title } = Typography;

const StageEnum = [
  { value: "Raw (Unqualified)", label: "Raw (Unqualified)" },
  { value: "New", label: "New" },
  { value: "Discussion", label: "Discussion" },
  { value: "Demo", label: "Demo" },
  { value: "Proposal", label: "Proposal" },
  { value: "Decided", label: "Decided" },
  { value: "Rejected", label: "Rejected" },
];

type LeadFormProps = {
  formProps?: any;
  form?: FormInstance;
  action?: "create" | "edit";
  initialValues?: any;
};

/**
 * Shared Lead Form Component
 * Used in both Create and Edit pages
 */
export const LeadForm: React.FC<LeadFormProps> = ({
  formProps,
  form: externalForm,
  action = "create",
  initialValues,
}) => {
  const [form] = Form.useForm();
  const activeForm = externalForm || form;

  const [showNewProductInput, setShowNewProductInput] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isCreatingSource, setIsCreatingSource] = useState(false);

  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // **Use Refine hook for users - automatic caching and error handling**
  const {
    result: usersResult,
    query: { isLoading: loadingUsers },
  } = useUsers();
  const users = usersResult?.data || [];

  const { data: identity } = useGetIdentity<{ id: string }>();
  const { mutate: createProduct } = useCreate();
  const { mutate: createSource } = useCreate();
  const { mutate: createTag } = useCreate();

  const { selectProps: sourceSelectProps, query: sourceQuery } = useSelect({
    resource: "source",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
  });

  const { selectProps: productSelectProps, query: productQuery } = useSelect({
    resource: "product",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
  });

  const { selectProps: tagSelectProps, query: tagQuery } = useSelect({
    resource: "tag",
    optionLabel: "name",
    optionValue: "name",
    pagination: { pageSize: 100 },
  });

  // Set default values when creating new lead
  useEffect(() => {
    if (action === "create" && activeForm && identity?.id && !initialValues) {
      activeForm.setFieldsValue({
        stage: "Raw (Unqualified)",
        title: "Mr.",
        since: dayjs(),
        country: "India",
        assigned_user_id: identity.id,
      });
    }
  }, [action, activeForm, identity, initialValues]);

  // Set initial values if provided
  useEffect(() => {
    if (initialValues && activeForm) {
      activeForm.setFieldsValue(initialValues);
    }
  }, [initialValues, activeForm]);

  const handleCreateSource = () => {
    if (!newSourceName.trim()) return;
    setIsCreatingSource(true);
    createSource(
      { resource: "source", values: { name: newSourceName.trim() } },
      {
        onSuccess: (data) => {
          activeForm.setFieldValue("source_id", data.data.id);
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
          activeForm.setFieldValue("product_id", data.data.id);
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
          const currentTags = activeForm.getFieldValue("tags") || [];
          activeForm.setFieldValue("tags", [...currentTags, data.data.name]);
          setNewTagName("");
          setShowNewTagInput(false);
          setIsCreatingTag(false);
          tagQuery?.refetch();
        },
        onError: () => setIsCreatingTag(false),
      },
    );
  };

  return (
    <Form
      {...formProps}
      form={activeForm}
      layout="vertical"
      style={{ maxWidth: "100%" }}
    >
      {/* Business Information Section */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Business Information
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Business Name"
            name={["business", "business"]}
            rules={[{ required: true, message: "Please enter business name" }]}
          >
            <Input placeholder="Enter business name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Stage"
            name="stage"
            rules={[{ required: true, message: "Please select stage" }]}
          >
            <Select options={StageEnum} placeholder="Select stage" />
          </Form.Item>
        </Col>
      </Row>

      {/* Contact Person Section */}
      <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
        Contact Person
      </Title>
      <Row gutter={16}>
        <Col span={4}>
          <Form.Item label="Title" name={["business", "title"]}>
            <Select
              placeholder="Title"
              options={[
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Ms.", label: "Ms." },
                { value: "Dr.", label: "Dr." },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            label="Name"
            name={["business", "name"]}
            rules={[{ required: true, message: "Please enter contact name" }]}
          >
            <Input placeholder="Enter contact person name" />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="Designation" name={["business", "designation"]}>
            <Input placeholder="Enter designation" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Mobile"
            name={["business", "mobile"]}
            rules={[{ required: true, message: "Please enter mobile number" }]}
          >
            <Input placeholder="Enter mobile number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name={["business", "email"]}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>
      </Row>

      {/* Lead Details Section */}
      <Divider />
      <Title level={5} style={{ marginBottom: 16 }}>
        Lead Details
      </Title>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Source" name="source_id">
            {!showNewSourceInput ? (
              <Select
                {...sourceSelectProps}
                placeholder="Select source"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setShowNewSourceInput(true)}
                      style={{ width: "100%" }}
                    >
                      Add new source
                    </Button>
                  </>
                )}
              />
            ) : (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="New source name"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  onPressEnter={handleCreateSource}
                />
                <Button
                  type="primary"
                  onClick={handleCreateSource}
                  loading={isCreatingSource}
                >
                  Add
                </Button>
                <Button onClick={() => setShowNewSourceInput(false)}>
                  Cancel
                </Button>
              </Space.Compact>
            )}
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Product" name="product_id">
            {!showNewProductInput ? (
              <Select
                {...productSelectProps}
                placeholder="Select product"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setShowNewProductInput(true)}
                      style={{ width: "100%" }}
                    >
                      Add new product
                    </Button>
                  </>
                )}
              />
            ) : (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="New product name"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  onPressEnter={handleCreateProduct}
                />
                <Button
                  type="primary"
                  onClick={handleCreateProduct}
                  loading={isCreatingProduct}
                >
                  Add
                </Button>
                <Button onClick={() => setShowNewProductInput(false)}>
                  Cancel
                </Button>
              </Space.Compact>
            )}
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Assigned To"
            name="assigned_user_id"
            rules={[{ required: true, message: "Please select assigned user" }]}
          >
            <Select
              placeholder="Select user"
              loading={loadingUsers}
              options={users.map((user: any) => ({
                value: user.id,
                label: user.name,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Since"
            name="since"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Potential (₹)" name="potential">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter potential value"
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Tags" name="tags">
            {!showNewTagInput ? (
              <Select
                {...tagSelectProps}
                mode="multiple"
                placeholder="Select tags"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setShowNewTagInput(true)}
                      style={{ width: "100%" }}
                    >
                      Add new tag
                    </Button>
                  </>
                )}
              />
            ) : (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="New tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onPressEnter={handleCreateTag}
                />
                <Button
                  type="primary"
                  onClick={handleCreateTag}
                  loading={isCreatingTag}
                >
                  Add
                </Button>
                <Button onClick={() => setShowNewTagInput(false)}>
                  Cancel
                </Button>
              </Space.Compact>
            )}
          </Form.Item>
        </Col>
      </Row>

      {/* Additional Information Section */}
      <Divider />
      <Title level={5} style={{ marginBottom: 16 }}>
        Additional Information
      </Title>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Website" name={["business", "website"]}>
            <Input placeholder="Enter website URL" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="GSTIN" name={["business", "gstin"]}>
            <Input placeholder="Enter GSTIN" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Country" name={["business", "country"]}>
            <Input placeholder="Enter country" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="City" name={["business", "city"]}>
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Postal Code" name={["business", "code"]}>
            <Input placeholder="Enter postal code" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Address Line 1"
            name={["business", "address_line_1"]}
          >
            <Input placeholder="Enter address line 1" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Address Line 2"
            name={["business", "address_line_2"]}
          >
            <Input placeholder="Enter address line 2" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Requirements" name="requirements">
        <TextArea
          rows={3}
          placeholder="Enter requirements"
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item label="Notes" name="notes">
        <TextArea
          rows={3}
          placeholder="Enter notes"
          showCount
          maxLength={500}
        />
      </Form.Item>
    </Form>
  );
};
