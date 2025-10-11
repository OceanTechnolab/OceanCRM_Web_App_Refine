import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import { Input, Space, Table, Tag } from "antd";
import { useState } from "react";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";
import { LeadFormModal } from "@/routes/leads/list/lead-form-modal";

const { Search } = Input;

export const LeadListPage = () => {
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | undefined>();
  const [editingLeadData, setEditingLeadData] = useState<any>(null);

  const { tableProps } = useTable({
    resource: "lead",
    pagination: {
      mode: "server",
      pageSize: 10,
    },
    filters: {
      permanent: search
        ? [
            {
              field: "q",
              operator: "contains",
              value: search,
            },
          ]
        : [],
    },
    meta: {
      select: "*",
    },
  });

  return (
    <>
      <List
        headerButtons={({ defaultButtons }) => (
          <>
            <Search
              placeholder="Search leads"
              onSearch={(value) => setSearch(value)}
              style={{ width: 200 }}
              allowClear
            />
            {defaultButtons}
          </>
        )}
        createButtonProps={{
          onClick: () => {
            setIsCreateModalOpen(true);
          },
        }}
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="business"
            title="Business"
            render={(business: any) => (
              <Space>
                <CustomAvatar
                  name={business?.business || business?.name}
                  src={business?.logo}
                />
                <Text>{business?.business || business?.name}</Text>
              </Space>
            )}
          />
          <Table.Column
            dataIndex="business"
            title="Contact Person"
            render={(business: any) => <Text>{business?.name}</Text>}
          />
          <Table.Column
            dataIndex="business"
            title="Email"
            render={(business: any) => <Text>{business?.email}</Text>}
          />
          <Table.Column
            dataIndex="business"
            title="Mobile"
            render={(business: any) => <Text>{business?.mobile}</Text>}
          />
          <Table.Column
            dataIndex="stage"
            title="Stage"
            render={(stage: string) => {
              let color = "default";
              switch (stage) {
                case "New":
                  color = "blue";
                  break;
                case "Discussion":
                  color = "orange";
                  break;
                case "Demo":
                  color = "purple";
                  break;
                case "Proposal":
                  color = "cyan";
                  break;
                case "Decided":
                  color = "green";
                  break;
                case "Rejected":
                  color = "red";
                  break;
                case "Raw (Unqualified)":
                  color = "default";
                  break;
              }
              return <Tag color={color}>{stage}</Tag>;
            }}
          />
          <Table.Column
            dataIndex="potential"
            title="Potential"
            render={(potential: number) => (
              <Text>₹{potential?.toLocaleString()}</Text>
            )}
          />
          <Table.Column
            dataIndex="assigned_user"
            title="Assigned To"
            render={(assigned_user: any) => (
              <Space>
                {assigned_user && (
                  <>
                    <CustomAvatar
                      name={assigned_user?.name}
                      src={assigned_user?.avatar}
                    />
                    <Text>{assigned_user?.name}</Text>
                  </>
                )}
                {!assigned_user && <Text type="secondary">Unassigned</Text>}
              </Space>
            )}
          />
          <Table.Column
            dataIndex="product"
            title="Product"
            render={(product: any) => <Text>{product?.name || "-"}</Text>}
          />
          <Table.Column
            dataIndex="source"
            title="Source"
            render={(source: any) => <Text>{source?.name || "-"}</Text>}
          />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            render={(_, record: any) => (
              <Space>
                <EditButton
                  hideText
                  size="small"
                  recordItemId={String(record.id)}
                  onClick={() => {
                    console.log("Edit clicked - record data:", record);
                    setEditingLeadId(record.id);
                    setEditingLeadData(record);
                    setIsEditModalOpen(true);
                  }}
                />
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={String(record.id)}
                />
              </Space>
            )}
          />
        </Table>
      </List>

      <LeadFormModal
        action="create"
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <LeadFormModal
        action="edit"
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLeadId(undefined);
          setEditingLeadData(null);
        }}
        leadId={editingLeadId}
        leadData={editingLeadData}
      />
    </>
  );
};
