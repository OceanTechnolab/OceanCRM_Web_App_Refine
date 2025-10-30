import { useState, useEffect } from "react";
import { useLogout, useUpdate, useInvalidate } from "@refinedev/core";

import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Spin, message, Avatar } from "antd";

import { getNameInitials } from "@/utilities";
import { useLoggedUser } from "@/services/user.service";

import { CustomAvatar } from "../../custom-avatar";
import { Text } from "../../text";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const { mutate: logout } = useLogout();
  const invalidate = useInvalidate();

  // Use the service hook to fetch logged user data
  const { data: userData, isLoading, error, refetch } = useLoggedUser();

  // Use Refine's useUpdate hook for updating user data
  const { mutate: updateUser } = useUpdate();

  useEffect(() => {
    if (opened && userId) {
      // Refetch when drawer opens to ensure fresh data
      refetch();
    }
  }, [opened, userId]);

  useEffect(() => {
    // Update form when user data is loaded
    if (userData) {
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
      });
    }
  }, [userData, form]);

  useEffect(() => {
    // Handle errors
    if (error) {
      console.error("Error fetching user data:", error);
      message.error("Failed to load user data");
    }
  }, [error]);

  const handleSave = (values: any) => {
    setIsSaving(true);
    updateUser(
      {
        resource: "user",
        id: userId,
        values: {
          name: values.name,
          email: values.email,
          mobile: values.mobile,
        },
      },
      {
        onSuccess: () => {
          message.success("Account settings updated successfully");
          // Invalidate logged user cache to refresh data
          invalidate({
            resource: "user",
            invalidates: ["list"],
          });
          refetch(); // Refresh the logged user data
          setOpened(false);
          setIsSaving(false);
        },
        onError: (error: any) => {
          console.error("Error updating user data:", error);
          message.error(error.message || "Failed to update account settings");
          setIsSaving(false);
        },
      },
    );
  };

  const closeModal = () => {
    setOpened(false);
  };

  if (!opened) {
    return null;
  }

  if (isLoading) {
    return (
      <Drawer
        open={opened}
        width={756}
        styles={{
          body: {
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Spin />
      </Drawer>
    );
  }

  return (
    <Drawer
      onClose={closeModal}
      open={opened}
      width={756}
      styles={{
        body: { background: "#f5f5f5", padding: 0 },
        header: { display: "none" },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#fff",
        }}
      >
        <Text strong> Account Settings </Text>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => closeModal()}
        />
      </div>
      <div
        style={{
          padding: "16px",
        }}
      >
        <Card>
          {userData?.avatar_url ? (
            <Avatar
              size={96}
              src={userData.avatar_url}
              style={{
                marginBottom: "24px",
              }}
            />
          ) : (
            <CustomAvatar
              name={userData?.name || userData?.email || "User"}
              size={96}
              style={{
                marginBottom: "24px",
                fontSize: "48px",
              }}
            />
          )}
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item label="Mobile" name="mobile">
              <Input placeholder="Mobile" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSaving}
                style={{
                  display: "block",
                  marginLeft: "auto",
                }}
              >
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Drawer>
  );
};
