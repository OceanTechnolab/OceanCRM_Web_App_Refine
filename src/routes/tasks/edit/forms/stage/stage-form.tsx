import { useForm } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { useParams } from "react-router";

import { FlagOutlined } from "@ant-design/icons";
import { Checkbox, Form, Select, Space } from "antd";

import { AccordionHeaderSkeleton } from "@/components";

type Props = {
  isLoading?: boolean;
};

export const StageForm = ({ isLoading }: Props) => {
  const { id } = useParams<{ id: string }>();

  const { formProps, form } = useForm({
    resource: "tasks",
    id,
    action: "edit",
    queryOptions: {
      enabled: false,
    },
    autoSave: {
      enabled: true,
      debounce: 0,
    },
  });

  const { query: stagesQuery } = useList({
    resource: "taskStages",
    filters: [
      {
        field: "title",
        operator: "in",
        value: ["TODO", "IN PROGRESS", "IN REVIEW", "DONE"],
      },
    ],
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
    pagination: {
      mode: "server",
    },
  });

  const stages = stagesQuery.data?.data || [];
  const stageOptions = stages
    .map((stage: any) => ({
      label: stage.title,
      value: stage.id,
    }))
    .concat([{ label: "Unassigned", value: null as any }]);

  if (isLoading) {
    return <AccordionHeaderSkeleton />;
  }

  return (
    <div style={{ padding: "12px 24px", borderBottom: "1px solid #d9d9d9" }}>
      <Form
        {...formProps}
        form={form}
        layout="inline"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space size={5}>
          <FlagOutlined />
          <Form.Item noStyle name="stageId">
            <Select
              loading={stagesQuery.isLoading}
              options={stageOptions}
              popupMatchSelectWidth={false}
              bordered={false}
              showSearch={false}
              placeholder="Select a stage"
              size="small"
            />
          </Form.Item>
        </Space>
        <Form.Item noStyle name="completed" valuePropName="checked">
          <Checkbox>Mark as complete</Checkbox>
        </Form.Item>
      </Form>
    </div>
  );
};
