import React from "react";
import { useModalForm, useSelect } from "@refinedev/antd";
import { Form, Input, Modal, Select } from "antd";
import type { HttpError } from "@refinedev/core";

type ContactFormValues = {
  business_id: string;
  name: string;
  email: string;
  mobile: string;
};

type Lead = {
  id: string;
  business: {
    id: string;
    business: string;
    name: string;
  };
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
    resource: "contact",
    redirect: false,
    onMutationSuccess: () => {
      form.resetFields();
      onClose();
    },
  });

  // Fetch leads to get business information
  const { selectProps: businessSelectProps } = useSelect<Lead>({
    resource: "lead",
    optionLabel: (item) => item.business.business,
    optionValue: (item) => item.business.id,
    pagination: {
      mode: "off",
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
          business_id: "",
          name: "",
          email: "",
          mobile: "",
        }}
      >
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
            {...businessSelectProps}
            placeholder="Select a company"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

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
          label="Mobile"
          name="mobile"
          rules={[
            {
              required: true,
              message: "Please enter mobile number",
            },
          ]}
        >
          <Input placeholder="+1 234 567 8900" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please enter email address",
            },
            {
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <Input placeholder="contact@example.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
