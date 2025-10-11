import React, { useState } from "react";
import {
  useTable,
  List,
  EditButton,
  DeleteButton,
  ShowButton,
} from "@refinedev/antd";
import { type BaseRecord, useMany, useDelete } from "@refinedev/core";
import { Table, Space, Input, Button, Tag, Modal } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { CustomAvatar, Text } from "@/components";
import { ContactFormModal } from "./contact-form-modal";

const { confirm } = Modal;

export const ContactListPage = () => {
  const [modalState, setModalState] = useState<{
    opened: boolean;
    action: "create" | "edit";
    contactId?: string;
  }>({
    opened: false,
    action: "create",
  });

  const { tableProps, searchFormProps, setFilters } = useTable({
    syncWithLocation: true,
    pagination: {
      pageSize: 12,
    },
  });

  const { mutate: deleteContact } = useDelete();

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Contact",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this contact?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteContact({
          resource: "contacts",
          id,
        });
      },
    });
  };

  const handleSearch = (value: string) => {
    setFilters([
      {
        field: "name",
        operator: "contains",
        value,
      },
    ]);
  };

  return (
    <div className="page-container">
      <List
        breadcrumb={false}
        headerButtons={(props) => [
          <Input.Search
            key="search"
            placeholder="Search by name"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
            onSearch={handleSearch}
          />,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModalState({ opened: true, action: "create" });
            }}
          >
            Add new contact
          </Button>,
        ]}
      >
        <Table
          {...tableProps}
          rowKey="id"
          pagination={{
            ...tableProps.pagination,
            showTotal: (total) => `${total} contacts in total`,
          }}
        >
          <Table.Column
            dataIndex="name"
            title="Name"
            width={250}
            render={(value: string, record: BaseRecord) => (
              <Space>
                <CustomAvatar
                  name={value}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`}
                />
                <Text>{value}</Text>
              </Space>
            )}
          />
          <Table.Column
            dataIndex="email"
            title="Email"
            render={(value: string) => <Text>{value || "-"}</Text>}
          />
          <Table.Column
            dataIndex="mobile"
            title="Mobile"
            render={(value: string) => <Text>{value || "-"}</Text>}
          />
          <Table.Column
            dataIndex="business_id"
            title="Company"
            render={(value: string) => {
              // We'll fetch company details
              return <Text>{value ? "Company" : "-"}</Text>;
            }}
          />
          <Table.Column
            dataIndex="status"
            title="Status"
            render={(value: string) => {
              const statusMap: Record<
                string,
                { color: string; label: string }
              > = {
                new: { color: "blue", label: "New" },
                contacted: { color: "green", label: "Contacted" },
                qualified: { color: "gold", label: "Qualified" },
                lost: { color: "red", label: "Lost" },
                won: { color: "green", label: "Won" },
                churned: { color: "red", label: "Churned" },
                unqualified: { color: "default", label: "Unqualified" },
              };

              const status = statusMap[value] || {
                color: "default",
                label: value || "New",
              };
              return <Tag color={status.color}>{status.label}</Tag>;
            }}
          />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            fixed="right"
            width={120}
            render={(_, record: BaseRecord) => (
              <Space>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    // Show contact details
                  }}
                />
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setModalState({
                      opened: true,
                      action: "edit",
                      contactId: String(record.id),
                    });
                  }}
                />
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    handleDelete(String(record.id));
                  }}
                />
              </Space>
            )}
          />
        </Table>
      </List>

      <ContactFormModal
        action={modalState.action}
        opened={modalState.opened}
        contactId={modalState.contactId}
        onClose={() =>
          setModalState({
            opened: false,
            action: "create",
            contactId: undefined,
          })
        }
      />
    </div>
  );
};
