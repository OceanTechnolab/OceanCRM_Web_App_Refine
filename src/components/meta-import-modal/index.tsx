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
  message,
} from "antd";
import {
  FacebookOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useCustomMutation, useApiUrl } from "@refinedev/core";

const { Title, Text, Paragraph } = Typography;

// Facebook SDK types
declare global {
  interface Window {
    FB?: {
      login: (
        callback: (response: any) => void,
        options?: { scope: string },
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
  const [allLeads, setAllLeads] = useState<any[]>([]);

  const apiUrl = useApiUrl();

  // Use Refine's useCustomMutation hook for custom API endpoint
  const { mutate: connectMetaAccount } = useCustomMutation();

  // Fetch all leads for selected form (Testing Mode)
  const fetchLeadsForForm = async (formId: string, pageToken: string) => {
    console.log("🔍 Fetching leads for form:", formId);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/${formId}/leads?access_token=${pageToken}`,
      );
      const data = await response.json();

      console.log("📥 Leads Response:", data);

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.data && data.data.length > 0) {
        setAllLeads(data.data);
        console.log(`✅ Found ${data.data.length} leads`);
        return data.data;
      }
      setAllLeads([]);
      console.log("⚠️ No leads found for this form");
      return [];
    } catch (err: any) {
      console.error("❌ Failed to fetch leads:", err);
      setError(err.message || "Failed to fetch leads.");
      return [];
    }
  };

  // Go back to select page
  const handleBackToPageSelection = () => {
    console.log("⬅️ Going back to page selection");
    setCurrentStep(1);
    setSelectedPage(null);
    setSelectedFormId(null);
    setForms([]);
    setAllLeads([]);
    setError(null);
  };

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
        // Full permissions for production (requires App Review approval)
        // For testing: Use only "email" until permissions are approved
        scope:
          "email,ads_management,business_management,leads_retrieval,pages_show_list,pages_read_engagement,pages_manage_ads,pages_manage_metadata",
      },
    );
  };

  // Fetch User Info (email and name)
  const fetchUserInfo = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/me?fields=id,name,email&access_token=${token}`,
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.email) {
        setUserEmail(data.email);
        setUserName(data.name || "User");
        // After getting user info, fetch pages
        fetchPages(token);
      } else {
        setError(
          "Could not retrieve email. Please make sure email permission is granted.",
        );
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
        `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token&access_token=${token}`,
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.data && data.data.length > 0) {
        setPages(data.data);
        setCurrentStep(1);
      } else {
        setError(
          "No Facebook pages found. Please make sure you manage at least one page.",
        );
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

    console.log("=== Page Selected ===");
    console.log("📄 Page Details:", {
      id: page.id,
      name: page.name,
      has_token: !!page.access_token,
    });

    setSelectedPage(page);
    setLoading(true);
    setError(null);
    setForms([]);
    setSelectedFormId(null);
    setAllLeads([]);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/${pageId}/leadgen_forms?access_token=${page.access_token}`,
      );
      const data = await response.json();

      console.log("📋 Forms API Response:", data);

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.data && data.data.length > 0) {
        setForms(data.data);
        setCurrentStep(2);
        console.log(
          `✅ Found ${data.data.length} forms:`,
          data.data.map((f: any) => ({ id: f.id, name: f.name })),
        );
      } else {
        setError(
          "No lead forms found for this page. Please create a lead generation form first.",
        );
        console.warn("⚠️ No forms found for this page");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch lead forms.");
      console.error("❌ Failed to fetch forms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Connect to CRM
  const handleConnect = async () => {
    if (!selectedPage || !selectedFormId || !userToken) return;

    setLoading(true);
    setError(null);

    console.log("=== Connect to CRM ===");
    console.log("📋 Connection Data:", {
      page_id: selectedPage.id,
      page_name: selectedPage.name,
      form_id: selectedFormId,
      form_name: forms.find((f) => f.id === selectedFormId)?.name,
      user_token: userToken,
      user_email: userEmail,
      user_name: userName,
    });

    try {
      // Note: x-org-id header is automatically added by Axios interceptor

      // Make API call to backend using Refine's useCustomMutation
      connectMetaAccount(
        {
          url: `${apiUrl}/meta/account`,
          method: "post",
          values: {
            user_token: userToken,
            page_id: selectedPage.id,
            form_id: selectedFormId,
          },
        },
        {
          onSuccess: (data: any) => {
            console.log("✅ API Response:", data);

            // Show success toast notification with form name
            if (data?.data?.form_name) {
              message.success(`${data.data.form_name} added successfully!`, 5);
            } else {
              message.success("Facebook form connected successfully!", 5);
            }

            // Move to success step
            setCurrentStep(3);
          },
          onError: (err: any) => {
            console.error("❌ API Error:", err);
            setError(
              err?.response?.data?.detail ||
                err?.message ||
                "Failed to connect Meta account",
            );
            setCurrentStep(0);
          },
        },
      );
    } catch (err: any) {
      console.error("❌ Failed to connect:", err);

      // Use centralized error message from interceptor
      setError(err.message || "Failed to connect. Please try again.");
      message.error(
        err.message || "Failed to connect to CRM. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle "Next" button to show all leads
  const handleShowLeads = async () => {
    if (!selectedPage || !selectedFormId) return;

    setLoading(true);
    setError(null);

    console.log("=== TESTING MODE: Show All Leads ===");
    console.log("📋 Request Details:", {
      form_id: selectedFormId,
      form_name: forms.find((f) => f.id === selectedFormId)?.name,
      page_id: selectedPage.id,
      page_name: selectedPage.name,
    });

    await fetchLeadsForForm(selectedFormId, selectedPage.access_token);
    setLoading(false);
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
      title: "Select Page",
      description: "Choose your Page",
    },
    {
      title: "Select Form",
      description: "Choose lead form",
    },
    {
      title: "Complete",
      description: "Successfully connected",
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
                  Sign in with Facebook to import leads from your Facebook Lead
                  Ads.
                </Paragraph>
                <Alert
                  message="Testing Mode"
                  description="During testing, only app administrators, developers, and test users can access this feature. Submit for App Review to enable for all users."
                  type="info"
                  showIcon
                  style={{ marginBottom: 20, textAlign: "left" }}
                />
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

            {/* Step 1: Select Facebook Page */}
            {currentStep === 1 && (
              <div>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Welcome, {userName}!</Text>
                    <br />
                    <Text type="secondary">{userEmail}</Text>
                  </div>

                  <Paragraph>
                    Select the Facebook Page you want to import leads from:
                  </Paragraph>

                  {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <Spin size="large" />
                      <Paragraph style={{ marginTop: 16 }}>
                        Loading your Facebook Pages...
                      </Paragraph>
                    </div>
                  ) : pages.length > 0 ? (
                    <Select
                      placeholder="Select a Facebook Page"
                      size="large"
                      style={{ width: "100%" }}
                      onChange={handlePageSelect}
                      loading={loading}
                      options={pages.map((page) => ({
                        label: page.name,
                        value: page.id,
                      }))}
                    />
                  ) : (
                    <Alert
                      message="No Pages Found"
                      description="You need to manage at least one Facebook Page to import leads. Please create or get admin access to a Page first."
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              </div>
            )}

            {/* Step 2: Select Lead Form */}
            {currentStep === 2 && (
              <div>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Text strong>Page Selected:</Text> {selectedPage?.name}
                    </div>
                    <Button
                      type="link"
                      onClick={handleBackToPageSelection}
                      size="small"
                    >
                      ← Change Page
                    </Button>
                  </div>

                  <Paragraph>
                    Select the lead generation form you want to connect:
                  </Paragraph>

                  {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <Spin size="large" />
                      <Paragraph style={{ marginTop: 16 }}>
                        Loading lead forms...
                      </Paragraph>
                    </div>
                  ) : forms.length > 0 ? (
                    <>
                      <Select
                        placeholder="Select a lead form"
                        size="large"
                        style={{ width: "100%" }}
                        value={selectedFormId}
                        onChange={setSelectedFormId}
                        options={forms.map((form) => ({
                          label: form.name,
                          value: form.id,
                        }))}
                      />

                      {/* Show all leads section */}
                      {allLeads.length > 0 && (
                        <div
                          style={{
                            marginTop: 20,
                            padding: 16,
                            background: "#f5f5f5",
                            borderRadius: 8,
                            maxHeight: 300,
                            overflowY: "auto",
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>
                            Available Leads ({allLeads.length})
                          </Text>
                          <div style={{ marginTop: 12 }}>
                            {allLeads.map((lead, index) => (
                              <div
                                key={lead.id}
                                style={{
                                  padding: 12,
                                  background: "white",
                                  marginBottom: 8,
                                  borderRadius: 4,
                                  border: "1px solid #d9d9d9",
                                }}
                              >
                                <Text strong>Lead #{index + 1}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  ID: {lead.id}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Created:{" "}
                                  {new Date(lead.created_time).toLocaleString()}
                                </Text>
                                {lead.field_data && (
                                  <div style={{ marginTop: 8 }}>
                                    {lead.field_data.map((field: any) => (
                                      <div
                                        key={field.name}
                                        style={{ fontSize: 12 }}
                                      >
                                        <Text strong>{field.name}:</Text>{" "}
                                        {field.values.join(", ")}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Space
                        style={{ width: "100%", marginTop: 16 }}
                        direction="vertical"
                      >
                        <Button
                          type="default"
                          size="large"
                          onClick={handleShowLeads}
                          disabled={!selectedFormId}
                          loading={loading}
                          style={{ width: "100%" }}
                        >
                          {allLeads.length > 0
                            ? "Refresh Leads"
                            : "Next: Show All Leads"}
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleConnect}
                          disabled={!selectedFormId}
                          loading={loading}
                          style={{ width: "100%" }}
                        >
                          Connect to CRM
                        </Button>
                      </Space>
                    </>
                  ) : (
                    <Alert
                      message="No Lead Forms Found"
                      description="This page doesn't have any lead generation forms. Please create a lead ad campaign with a lead form first."
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              </div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <Result
                status="success"
                title="Successfully Connected!"
                subTitle="Your Facebook leads will now be automatically imported to your CRM"
                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleClose} disabled={loading} size="large">
              {currentStep === 3 ? "Close" : "Cancel"}
            </Button>

            {currentStep === 1 && pages.length === 0 && !loading && (
              <Button
                type="link"
                href="https://www.facebook.com/pages/create"
                target="_blank"
              >
                Create a Facebook Page
              </Button>
            )}

            {currentStep === 2 && forms.length === 0 && !loading && (
              <Button
                type="link"
                href="https://www.facebook.com/business/tools/ads-manager"
                target="_blank"
              >
                Create Lead Ads
              </Button>
            )}
          </div>
        </Space>
      </div>
    </Modal>
  );
};
