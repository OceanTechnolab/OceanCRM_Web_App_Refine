import React from "react";
import { useModalForm } from "@refinedev/antd";
import { Form, Input, Modal, Select } from "antd";
import type { HttpError } from "@refinedev/core";

type ContactFormValues = {
  name: string;
  email: string;
  mobile: string;
  business_id: string;
};

type Props = {
  action: "create" | "edit";
  opened: boolean;
  onClose: () => void;
  contactId?: string;
};

export const ContactFormModal = ({
  action,
  opened,
  onClose,
  contactId,
}: Props) => {
  const { formProps, modalProps, form } = useModalForm<
    ContactFormValues,
    HttpError,
    ContactFormValues
  >({
    action,
    id: contactId,
    resource: "contacts",
    redirect: false,
    onMutationSuccess: () => {
      form.resetFields();
      onClose();
    },
  });

  return (
    <Modal
      {...modalProps}
      open={opened}
      onCancel={onClose}
      title={action === "create" ? "Add New Contact" : "Edit Contact"}
      width={600}
      okText={action === "create" ? "Create" : "Save"}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          name: "",
          email: "",
          mobile: "",
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter contact name",
            },
          ]}
        >
          <Input placeholder="Enter contact name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <Input placeholder="contact@example.com" />
        </Form.Item>

        <Form.Item
          label="Mobile"
          name="mobile"
          rules={[
            {
              pattern: /^[0-9+\-() ]*$/,
              message: "Please enter a valid mobile number",
            },
          ]}
        >
          <Input placeholder="+1 234 567 8900" />
        </Form.Item>

        <Form.Item
          label="Company"
          name="business_id"
          rules={[
            {
              required: true,
              message: "Please select a company",
            },
          ]}
        >
          <Select
            placeholder="Select a company"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[
              // This will be populated with actual companies
              { value: "1", label: "Company 1" },
              { value: "2", label: "Company 2" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
