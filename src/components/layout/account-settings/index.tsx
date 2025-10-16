import { useState, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";

import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Spin, message, Avatar } from "antd";

import { API_BASE_URL } from "@/providers/data";
import { getNameInitials } from "@/utilities";

import { CustomAvatar } from "../../custom-avatar";
import { Text } from "../../text";

// Better default avatar - using a professional style
const DEFAULT_AVATAR =
  "https://api.dicebear.com/7.x/initials/svg?seed=Default&backgroundColor=1677ff";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatarUrl?: string;
};

/**
 * Get CSRF token from cookie
 */
const getCsrfToken = (): string | null => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrf_access_token") {
      return value;
    }
  }
  return null;
};

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { data: identity } = useGetIdentity<UserData>();

  useEffect(() => {
    if (opened && userId) {
      fetchUserData();
    }
  }, [opened, userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/v1/user/logged`, {
        method: "GET",
        credentials: "include",
        headers: csrfToken
          ? {
              "X-CSRF-Token": csrfToken,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      const user: UserData = {
        id: data.id,
        name: data.name || data.email,
        email: data.email,
        mobile: data.mobile,
        avatarUrl: data.avatar_url,
      };

      setUserData(user);
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setIsSaving(true);
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/v1/user/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          mobile: values.mobile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      message.success("Account settings updated successfully");
      setOpened(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      message.error("Failed to update account settings");
    } finally {
      setIsSaving(false);
    }
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
          <Avatar
            size={96}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1677ff",
              marginBottom: "24px",
              fontSize: "48px",
            }}
          />
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
