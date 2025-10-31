import { useForm } from "@refinedev/antd";
import { useParams } from "react-router";

import MDEditor from "@uiw/react-md-editor";
import { Button, Form, Space } from "antd";

type Props = {
  initialValues: {
    description?: string;
  };
  cancelForm: () => void;
};

export const DescriptionForm = ({ initialValues, cancelForm }: Props) => {
  const { id } = useParams<{ id: string }>();

  const { formProps, saveButtonProps, form } = useForm({
    resource: "tasks",
    id,
    action: "edit",
    queryOptions: {
      enabled: false,
    },
    redirect: false,
    onMutationSuccess: () => {
      cancelForm();
    },
  });

  return (
    <>
      <Form {...formProps} form={form} initialValues={initialValues}>
        <Form.Item noStyle name="description">
          <MDEditor preview="edit" data-color-mode="light" height={250} />
        </Form.Item>
      </Form>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          marginTop: "12px",
        }}
      >
        <Space>
          <Button type="default" onClick={cancelForm}>
            Cancel
          </Button>
          <Button {...saveButtonProps} type="primary">
            Save
          </Button>
        </Space>
      </div>
    </>
  );
};
