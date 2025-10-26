import { useState, useEffect } from "react";
import { useLogout } from "@refinedev/core";

import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Spin, message, Avatar } from "antd";

import { axiosInstance, API_URL } from "@/providers/data";
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

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { mutate: logout } = useLogout();

  useEffect(() => {
    if (opened && userId) {
      fetchUserData();
    }
  }, [opened, userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`${API_URL}/user/logged`);

      const data = response.data;
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
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      
      // Check if it's an authentication error (handled by interceptor)
      if (error.name === "AuthenticationError") {
        message.error(error.message);
        logout();
        return;
      }
      
      // Use centralized error message
      message.error(error.message || "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setIsSaving(true);
    try {
      const response = await axiosInstance.put(`${API_URL}/user/${userId}`, {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
      });

      message.success("Account settings updated successfully");
      setOpened(false);
    } catch (error: any) {
      console.error("Error updating user data:", error);
      
      // Check if it's an authentication error
      if (error.name === "AuthenticationError") {
        message.error(error.message);
        logout();
        return;
      }
      
      // Use centralized error message
      message.error(error.message || "Failed to update account settings");
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
