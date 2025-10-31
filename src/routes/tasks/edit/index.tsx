import { useState } from "react";

import { DeleteButton } from "@refinedev/antd";
import { useNavigation, useOne } from "@refinedev/core";
import { useParams } from "react-router";

import {
  AlignLeftOutlined,
  FieldTimeOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";

import { Accordion } from "@/components";

import { DescriptionForm } from "./forms/description/description-form";
import { DescriptionHeader } from "./forms/description/description-header";
import { DueDateForm } from "./forms/due-date/duedate-form";
import { DueDateHeader } from "./forms/due-date/duedate-header";
import { StageForm } from "./forms/stage/stage-form";
import { TitleForm } from "./forms/title/title-form";
import { UsersForm } from "./forms/users/users-form";
import { UsersHeader } from "./forms/users/users-header";

export const TasksEditPage = () => {
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const { id } = useParams<{ id: string }>();

  const { list } = useNavigation();

  // Use REST API to fetch task data
  const { query: taskQuery } = useOne({
    resource: "tasks",
    id: id!,
  });

  const task = taskQuery.data?.data;
  const isLoading = taskQuery.isLoading;
  const { description, dueDate, users, title } = task ?? {};

  const handleClose = () => {
    list("tasks", "replace");
  };

  return (
    <Modal
      open={true}
      className="kanban-update-modal"
      onCancel={handleClose}
      title={<TitleForm initialValues={{ title }} isLoading={isLoading} />}
      width={586}
      footer={
        <DeleteButton
          type="link"
          resource="tasks"
          recordItemId={id}
          onSuccess={() => {
            list("tasks", "replace");
          }}
        >
          Delete card
        </DeleteButton>
      }
    >
      <StageForm isLoading={isLoading} />
      <Accordion
        accordionKey="description"
        activeKey={activeKey}
        setActive={setActiveKey}
        fallback={<DescriptionHeader description={description} />}
        isLoading={isLoading}
        icon={<AlignLeftOutlined />}
        label="Description"
      >
        <DescriptionForm
          initialValues={{ description }}
          cancelForm={() => setActiveKey(undefined)}
        />
      </Accordion>
      <Accordion
        accordionKey="due-date"
        activeKey={activeKey}
        setActive={setActiveKey}
        fallback={<DueDateHeader dueData={dueDate} />}
        isLoading={isLoading}
        icon={<FieldTimeOutlined />}
        label="Due date"
      >
        <DueDateForm
          initialValues={{ dueDate: dueDate ?? undefined }}
          cancelForm={() => setActiveKey(undefined)}
        />
      </Accordion>
      <Accordion
        accordionKey="users"
        activeKey={activeKey}
        setActive={setActiveKey}
        fallback={<UsersHeader users={users} />}
        isLoading={isLoading}
        icon={<UsergroupAddOutlined />}
        label="Users"
      >
        <UsersForm
          initialValues={{
            userIds: users?.map((user: any) => user.id) ?? [],
          }}
          cancelForm={() => setActiveKey(undefined)}
        />
      </Accordion>
    </Modal>
  );
};
