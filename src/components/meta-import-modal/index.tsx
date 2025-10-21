import React, { useState } from "react";
import {
  Modal,
  Steps,
  Button,
  Select,
  Space,
  Typography,
  Alert,
  Spin,
  Result,
} from "antd";
import {
  FacebookOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useCreate } from "@refinedev/core";

const { Title, Text, Paragraph } = Typography;

// Facebook SDK types
declare global {
  interface Window {
    FB?: {
      login: (
        callback: (response: any) => void,
        options?: { scope: string }
      ) => void;
    };
  }
}

type MetaImportModalProps = {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

interface PageOption {
  id: string;
  name: string;
  access_token: string;
}

interface FormOption {
  id: string;
  name: string;
}

export const MetaImportModal: React.FC<MetaImportModalProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageOption | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const { mutate: createAccount } = useCreate();

  // Step 0: Facebook Login
  const handleFacebookLogin = () => {
    setLoading(true);
    setError(null);

    // Facebook SDK Login
    if (!window.FB) {
      setError("Facebook SDK not loaded. Please refresh the page.");
      setLoading(false);
      return;
    }

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const token = response.authResponse.accessToken;
          setUserToken(token);
          // Fetch user info to display email
          fetchUserInfo(token);
        } else {
          setError("Facebook login failed or was cancelled. Please try again.");
          setLoading(false);
        }
      },
      {
        // Using basic email permission that's ready for testing
        // This will verify the setup works before requesting advanced permissions
        scope: "email",
      }
    );
  };

  // Fetch User Info (email and name)
  const fetchUserInfo = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/me?fields=id,name,email&access_token=${token}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.email) {
        setUserEmail(data.email);
        setUserName(data.name || "User");
        setCurrentStep(1); // Move to success/display step
      } else {
        setError("Could not retrieve email. Please make sure email permission is granted.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch user information.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Fetch Pages (will be used later when advanced permissions are approved)
  const fetchPages = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token&access_token=${token}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.data && data.data.length > 0) {
        setPages(data.data);
        setCurrentStep(1);
      } else {
        setError("No Facebook pages found. Please make sure you manage at least one page.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch Facebook pages.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch Forms for selected page
  const handlePageSelect = async (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    setSelectedPage(page);
    setLoading(true);
    setError(null);
    setForms([]);
    setSelectedFormId(null);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/leadgen_forms?access_token=${page.access_token}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.data && data.data.length > 0) {
        setForms(data.data);
        setCurrentStep(2);
      } else {
        setError("No lead forms found for this page. Please create a lead generation form first.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch lead forms.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Connect to CRM
  const handleConnect = () => {
    if (!selectedPage || !selectedFormId || !userToken) return;

    setLoading(true);
    setError(null);

    createAccount(
      {
        resource: "meta/account",
        values: {
          page_id: selectedPage.id,
          form_id: selectedFormId,
          user_token: userToken,
        },
      },
      {
        onSuccess: () => {
          setCurrentStep(3);
          setLoading(false);
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 2000);
        },
        onError: (error: any) => {
          setError(
            error?.message ||
              "Failed to connect. Please check your configuration and try again."
          );
          setLoading(false);
        },
      }
    );
  };

  const handleClose = () => {
    setCurrentStep(0);
    setUserToken(null);
    setPages([]);
    setForms([]);
    setSelectedPage(null);
    setSelectedFormId(null);
    setUserEmail(null);
    setUserName(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const steps = [
    {
      title: "Login",
      description: "Connect Facebook",
    },
    {
      title: "Success",
      description: "Verified",
    },
  ];

  return (
    <Modal
      open={opened}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
      destroyOnClose
    >
      <div style={{ padding: "20px 0" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <FacebookOutlined
              style={{ fontSize: 48, color: "#1877F2", marginBottom: 16 }}
            />
            <Title level={3} style={{ margin: 0 }}>
              Import Facebook Leads
            </Title>
            <Paragraph type="secondary">
              Connect your Facebook page to automatically import leads
            </Paragraph>
          </div>

          {/* Steps */}
          <Steps current={currentStep} items={steps} />

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Step Content */}
          <div style={{ minHeight: 200, padding: "20px 0" }}>
            {/* Step 0: Facebook Login */}
            {currentStep === 0 && (
              <div style={{ textAlign: "center" }}>
                <Paragraph>
                  Click below to sign in with Facebook to test the integration.
                </Paragraph>
                <Paragraph type="secondary" style={{ fontSize: 12 }}>
                  Testing with basic email permission
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<FacebookOutlined />}
                  onClick={handleFacebookLogin}
                  loading={loading}
                  style={{
                    background: "#1877F2",
                    borderColor: "#1877F2",
                    marginTop: 20,
                  }}
                >
                  {loading ? "Connecting..." : "Log in With Facebook"}
                </Button>
              </div>
            )}

            {/* Step 1: Show User Info (Success) */}
            {currentStep === 1 && (
              <Result
                status="success"
                title="Successfully Connected!"
                subTitle="Facebook login is working correctly"
                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              >
                <div style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Name:</Text>{" "}
                      <Text>{userName}</Text>
                    </div>
                    <div>
                      <Text strong>Email:</Text>{" "}
                      <Text copyable>{userEmail}</Text>
                    </div>
                    <Alert
                      message="Setup Verified!"
                      description="The Facebook SDK and OAuth configuration are working correctly. You can now add advanced permissions for page and lead access."
                      type="success"
                      showIcon
                    />
                  </Space>
                </div>
              </Result>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={handleClose} disabled={loading} size="large">
              {currentStep === 1 ? "Close" : "Cancel"}
            </Button>
          </div>
        </Space>
      </div>
    </Modal>
  );
};
