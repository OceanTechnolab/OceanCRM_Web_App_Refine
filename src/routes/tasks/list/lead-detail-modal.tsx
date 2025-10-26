import { useEffect, useState } from "react";
import { useUpdate, type HttpError } from "@refinedev/core";
import { Form, Input, Modal, Select } from "antd";

import { Text } from "@/components";
import { userService } from "../../../services/user.service";
import type { User } from "../../../interfaces/user";

const { TextArea } = Input;

type Lead = {
  id: string;
  since: string;
  stage: string;
  tags: string[];
  requirements: string;
  notes: string;
  potential: number;
  business: {
    id: string;
    business: string;
    name: string;
    title?: string;
    designation?: string;
    mobile: string;
    email: string;
    website?: string;
    address_line_1?: string;
    address_line_2?: string;
    country?: string;
    city?: string;
    gstin?: string;
    code?: string;
  };
  product?: {
    id: number;
    name: string;
  };
  source?: {
    id: number;
    name: string;
    is_default?: boolean;
  };
  assigned_user?: {
    id: string;
    name: string;
  };
};

type LeadDetailModalProps = {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
};

const STAGE_OPTIONS = [
  { label: "Raw", value: "Raw (Unqualified)" },
  { label: "New", value: "New" },
  { label: "Discussion", value: "Discussion" },
  { label: "Demo", value: "Demo" },
  { label: "Proposal", value: "Proposal" },
  { label: "Decided", value: "Decided" },
  { label: "Rejected", value: "Rejected" },
];

export const LeadDetailModal = ({
  open,
  onClose,
  lead,
}: LeadDetailModalProps) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { mutate: updateLead } = useUpdate<Lead, HttpError>({
    resource: "lead",
    mutationMode: "optimistic",
    successNotification: {
      message: "Lead updated successfully",
      type: "success",
    },
  });

  // Fetch users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;

      setLoadingUsers(true);
      try {
        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open]);

  useEffect(() => {
    if (open && lead) {
      form.setFieldsValue({
        business: lead.business.business,
        name: lead.business.name,
        stage: lead.stage,
        assigned_user_id: lead.assigned_user?.id,
        requirements: lead.requirements,
        notes: lead.notes,
      });
    }
  }, [open, lead, form]);

  const handleFinish = (values: any) => {
    if (!lead) return;

    updateLead(
      {
        id: lead.id,
        values: {
          stage: values.stage,
          requirements: values.requirements,
          notes: values.notes,
          assigned_to: values.assigned_user_id || lead.assigned_user?.id,
          tags: lead.tags || [],
          source_id: lead.source?.id,
          product_id: lead.product?.id,
          potential: lead.potential,
          business: {
            id: lead.business.id,
            business: values.business,
            name: values.name,
            title: lead.business.title || null,
            designation: lead.business.designation || "",
            mobile: lead.business.mobile,
            email: lead.business.email,
            website: lead.business.website || "",
            address_line_1: lead.business.address_line_1 || "",
            address_line_2: lead.business.address_line_2 || "",
            city: lead.business.city || "",
            country: lead.business.country || "",
            gstin: lead.business.gstin || "",
            code: lead.business.code || "",
          },
          since: lead.since,
        } as any,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title={
        <Text size="lg" strong>
          Lead Details
        </Text>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="Business Name"
          name="business"
          rules={[{ required: true, message: "Please enter business name" }]}
        >
          <Input placeholder="Enter business name" />
        </Form.Item>

        <Form.Item
          label="Contact Person"
          name="name"
          rules={[
            { required: true, message: "Please enter contact person name" },
          ]}
        >
          <Input placeholder="Enter contact person name" />
        </Form.Item>

        <Form.Item
          label="Stage"
          name="stage"
          rules={[{ required: true, message: "Please select a stage" }]}
        >
          <Select
            placeholder="Select stage"
            options={STAGE_OPTIONS}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Assigned to"
          name="assigned_user_id"
        >
          <Select
            placeholder="Select a user"
            loading={loadingUsers}
            showSearch
            optionFilterProp="label"
            allowClear
            options={users.map((user) => ({
              label: user.name,
              value: user.id,
            }))}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Requirements" name="requirements">
          <TextArea
            rows={4}
            placeholder="Enter requirements"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <TextArea
            rows={4}
            placeholder="Enter notes"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
