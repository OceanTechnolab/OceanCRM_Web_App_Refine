import {
  DeleteButton,
  EditButton,
  List,
  useTable,
  useSelect,
  FilterDropdown,
} from "@refinedev/antd";
import { Input, Space, Table, Tag, Button, Select } from "antd";
import { useState } from "react";
import {
  EyeOutlined,
  FacebookOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { CustomAvatar } from "@/components/custom-avatar";
import { Text } from "@/components/text";
import { QuickActivityButton } from "@/components/quick-activity-button";
import { LeadFormModal } from "@/routes/leads/list/lead-form-modal";
import { LeadDetailModal } from "@/routes/leads";
import { MetaImportModal } from "@/components/meta-import-modal";

const { Search } = Input;

export const LeadListPage = () => {
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMetaImportModalOpen, setIsMetaImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadData, setSelectedLeadData] = useState<any>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | undefined>();
  const [editingLeadData, setEditingLeadData] = useState<any>(null);

  const { tableProps, tableQuery } = useTable({
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

  // Get list of users for filter dropdown
  const { selectProps: userSelectProps } = useSelect({
    resource: "user",
    optionLabel: "name",
    optionValue: "id",
  });

  const total = tableQuery?.data?.total || 0;

  return (
    <>
      <List
        title="Leads"
        headerButtons={({ defaultButtons }) => (
          <>
            <Search
              placeholder="Search by business, email"
              onSearch={(value) => setSearch(value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              type="default"
              icon={<FacebookOutlined />}
              onClick={() => setIsMetaImportModalOpen(true)}
              style={{
                borderColor: "#1877F2",
                color: "#1877F2",
              }}
            >
              Import
            </Button>
            {defaultButtons}
          </>
        )}
        createButtonProps={{
          onClick: () => {
            setIsCreateModalOpen(true);
          },
        }}
      >
        <Table
          {...tableProps}
          rowKey="id"
          pagination={{
            ...tableProps.pagination,
            showTotal: (total: number) => `${total} leads in total`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "100"],
          }}
        >
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
            dataIndex={["assigned_user", "id"]}
            title="Assigned To"
            filterIcon={<FilterOutlined />}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Select
                  {...userSelectProps}
                  style={{ minWidth: 200 }}
                  mode="multiple"
                  placeholder="Select users"
                />
              </FilterDropdown>
            )}
            render={(_, record: any) => {
              const assigned_user = record.assigned_user;
              return (
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
              );
            }}
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
                <QuickActivityButton
                  leadId={record.id}
                  onSuccess={() => {
                    // Optionally refresh the table or show a success indicator
                  }}
                />
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => {
                    console.log("View clicked - record data:", record);
                    setSelectedLeadId(record.id);
                    setSelectedLeadData(record);
                    setIsDetailModalOpen(true);
                  }}
                >
                  View
                </Button>
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

      {isCreateModalOpen && (
        <LeadFormModal
          action="create"
          opened={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
      {isEditModalOpen && (
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
      )}
      {isDetailModalOpen && (
        <LeadDetailModal
          leadId={selectedLeadId}
          leadData={selectedLeadData}
          open={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLeadId(null);
            setSelectedLeadData(null);
          }}
        />
      )}
      {isMetaImportModalOpen && (
        <MetaImportModal
          opened={isMetaImportModalOpen}
          onClose={() => setIsMetaImportModalOpen(false)}
          onSuccess={() => {
            // Refresh the table after successful import
            window.location.reload();
          }}
        />
      )}
    </>
  );
};
