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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useModalForm, useSelect } from "@refinedev/antd";
import { useGetIdentity, useCreate } from "@refinedev/core";
import dayjs from "dayjs";

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

  // Store business ID for edit mode
  const [businessId, setBusinessId] = useState<string | undefined>();

  const { data: identity } = useGetIdentity<{ id: string }>();
  const { mutate: createProduct } = useCreate();
  const { mutate: createSource } = useCreate();

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

        form.setFieldsValue({
          ...otherData,
          business_name: business?.business || "",
          contact_person: business?.name || "",
          title: business?.title || undefined,
          designation: business?.designation || "",
          mobile: business?.mobile || "",
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
    const businessData: any = {
      business: values.business_name || "",
      name: values.contact_person || "",
      title: values.title || null,
      designation: values.designation || "",
      mobile: values.mobile || "",
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
      assigned_to: identity?.id,
      tags: values.tags || [],
      stage: values.stage,
      source_id: values.source_id,
      product_id: values.product_id,
      potential: values.potential,
      requirements: values.requirements,
      notes: values.notes,
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

      form.setFieldsValue({
        ...otherData,
        business_name: business?.business || "",
        contact_person: business?.name || "",
        title: business?.title || undefined,
        designation: business?.designation || "",
        mobile: business?.mobile || "",
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
      title={action === "create" ? "Create Lead" : "Edit Lead"}
      width={900}
      style={{ top: 20 }}
      okText={action === "create" ? "Create" : "Save"}
      cancelText="Cancel"
    >
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          Business Information
        </Title>

        <Form.Item
          label="Business Name"
          name="business_name"
          rules={[{ required: true, message: "Please enter business name" }]}
        >
          <Input placeholder="Enter business name" />
        </Form.Item>

        <Form.Item
          label="Contact Person"
          name="contact_person"
          rules={[{ required: true, message: "Please enter contact person" }]}
        >
          <Input placeholder="Enter contact person" />
        </Form.Item>

        <Form.Item label="Title" name="title">
          <Select placeholder="Select title" allowClear>
            <Select.Option value="Mr.">Mr.</Select.Option>
            <Select.Option value="Ms.">Ms.</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Designation" name="designation">
          <Input placeholder="Enter designation" />
        </Form.Item>

        <Form.Item
          label="Mobile"
          name="mobile"
          rules={[
            { required: true, message: "Please enter mobile number" },
            {
              pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
              message: "Please enter a valid phone number",
            },
          ]}
        >
          <Input placeholder="Enter mobile number (e.g., +1234567890)" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item label="Website" name="website">
          <Input placeholder="Enter website URL" />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input placeholder="Enter address" />
        </Form.Item>

        <Form.Item label="Address Line 2" name="address_line2">
          <Input placeholder="Enter address line 2" />
        </Form.Item>

        <Form.Item label="City" name="city">
          <Input placeholder="Enter city" />
        </Form.Item>

        <Form.Item label="Country" name="country">
          <Input placeholder="Enter country" />
        </Form.Item>

        <Form.Item label="GSTIN" name="GSTIN">
          <Input placeholder="Enter GSTIN" />
        </Form.Item>

        <Form.Item label="Code" name="code">
          <Input placeholder="Enter code" />
        </Form.Item>

        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
          Lead Information
        </Title>

        <Form.Item label="Since Date" name="since">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Stage"
          name="stage"
          rules={[{ required: true, message: "Please select stage" }]}
        >
          <Select placeholder="Select stage" options={StageEnum} />
        </Form.Item>

        <Form.Item
          label="Source"
          name="source_id"
          rules={[{ required: true, message: "Please select source" }]}
        >
          <Select
            {...sourceSelectProps}
            placeholder="Select source"
            popupRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: "8px", borderTop: "1px solid #f0f0f0" }}>
                  {!showNewSourceInput ? (
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setShowNewSourceInput(true)}
                      style={{ width: "100%" }}
                    >
                      Add new source
                    </Button>
                  ) : (
                    <Space style={{ width: "100%" }}>
                      <Input
                        placeholder="Source name"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        onPressEnter={handleCreateSource}
                        style={{ flex: 1 }}
                      />
                      <Button
                        type="primary"
                        onClick={handleCreateSource}
                        loading={isCreatingSource}
                        disabled={!newSourceName.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        onClick={() => {
                          setShowNewSourceInput(false);
                          setNewSourceName("");
                        }}
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
          label="Product"
          name="product_id"
          rules={[{ required: true, message: "Please select product" }]}
        >
          <Select
            {...productSelectProps}
            placeholder="Select product"
            popupRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: "8px", borderTop: "1px solid #f0f0f0" }}>
                  {!showNewProductInput ? (
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setShowNewProductInput(true)}
                      style={{ width: "100%" }}
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
                      />
                      <Button
                        type="primary"
                        onClick={handleCreateProduct}
                        loading={isCreatingProduct}
                        disabled={!newProductName.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        onClick={() => {
                          setShowNewProductInput(false);
                          setNewProductName("");
                        }}
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

        <Form.Item label="Potential" name="potential">
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter potential value"
            min={0}
            precision={2}
          />
        </Form.Item>

        <Form.Item label="Tags" name="tags">
          <Select
            mode="tags"
            placeholder="Add tags"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Requirements" name="requirements">
          <TextArea rows={3} placeholder="Enter requirements" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <TextArea rows={3} placeholder="Enter notes" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
