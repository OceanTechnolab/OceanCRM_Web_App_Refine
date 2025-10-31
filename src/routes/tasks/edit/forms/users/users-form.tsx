import { useForm } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";

import { Button, Form, Select, Space } from "antd";
import { useUsers } from "@/services/user.service";

type Props = {
  initialValues: {
    userIds?: string[];
  };
  cancelForm: () => void;
};

export const UsersForm = ({ initialValues, cancelForm }: Props) => {
  const { formProps, saveButtonProps, form } = useForm({
    queryOptions: {
      enabled: false,
    },
    redirect: false,
    onMutationSuccess: () => {
      cancelForm();
    },
  });

  // Use REST API to fetch users
  const {
    query: { data: usersData, isLoading: loadingUsers },
  } = useUsers();
  const users = usersData?.data || [];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <Form
        {...formProps}
        form={form}
        style={{ width: "100%" }}
        initialValues={initialValues}
      >
        <Form.Item noStyle name="userIds">
          <Select
            className="kanban-users-form-select"
            dropdownStyle={{ padding: "0px" }}
            style={{ width: "100%" }}
            mode="multiple"
            loading={loadingUsers}
            placeholder="Select users"
            options={users.map((user) => ({
              label: user.name,
              value: user.id,
            }))}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
      <Space>
        <Button type="default" onClick={cancelForm}>
          Cancel
        </Button>
        <Button {...saveButtonProps} type="primary">
          Save
        </Button>
      </Space>
    </div>
  );
};
