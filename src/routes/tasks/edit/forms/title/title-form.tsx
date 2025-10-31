import React from "react";

import { useForm } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { useParams } from "react-router";

import { Form, Skeleton } from "antd";

import { Text } from "@/components";

const TitleInput = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const onTitleChange = (newTitle: string) => {
    onChange?.(newTitle);
  };

  return (
    <Text
      editable={{
        onChange: onTitleChange,
      }}
      style={{ width: "98%" }}
    >
      {value}
    </Text>
  );
};

type Props = {
  initialValues: {
    title?: string;
  };
  isLoading?: boolean;
};

export const TitleForm = ({ initialValues, isLoading }: Props) => {
  const { id } = useParams<{ id: string }>();
  const invalidate = useInvalidate();

  const { formProps, form } = useForm({
    resource: "tasks",
    id,
    action: "edit",
    queryOptions: {
      enabled: false,
    },
    redirect: false,
    warnWhenUnsavedChanges: false,
    autoSave: {
      enabled: true,
    },
    onMutationSuccess: () => {
      invalidate({ invalidates: ["list"], resource: "tasks" });
    },
  });

  React.useEffect(() => {
    form?.setFieldsValue(initialValues);
  }, [initialValues.title, form]);

  if (isLoading) {
    return (
      <Skeleton.Input
        size="small"
        style={{ width: "95%", height: "22px" }}
        block
      />
    );
  }

  return (
    <Form {...formProps} form={form} initialValues={initialValues}>
      <Form.Item noStyle name="title">
        <TitleInput />
      </Form.Item>
    </Form>
  );
};
