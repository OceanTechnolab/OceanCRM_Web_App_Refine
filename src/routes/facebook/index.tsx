import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Checkbox,
  message,
  Empty,
  Spin,
  Typography,
  Alert,
  Statistic,
  Row,
  Col,
  Avatar,
  Divider,
} from "antd";
import {
  FacebookOutlined,
  ReloadOutlined,
  ImportOutlined,
  CheckCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  FormOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useCustomMutation, useGetIdentity, useCustom } from "@refinedev/core";
import type { ColumnsType } from "antd/es/table";
import { getOrgId } from "@/utilities/organization";

const { Title, Text } = Typography;

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookForm {
  id: string;
  name: string;
  page_id: string;
  page_name: string;
}

interface FacebookLead {
  id: string;
  created_time: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
}

interface AutoImportAccount {
  id: string;
  page_name: string;
  form_name: string;
}

export const FacebookPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [forms, setForms] = useState<FacebookForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<FacebookForm | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leadsModalVisible, setLeadsModalVisible] = useState(false);
  const [leads, setLeads] = useState<FacebookLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [autoImportAccounts, setAutoImportAccounts] = useState<
    AutoImportAccount[]
  >([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [formsPageSize, setFormsPageSize] = useState(10);
  const [accountsPageSize, setAccountsPageSize] = useState(10);
  const [leadsPageSize, setLeadsPageSize] = useState(10);

  // Get current user identity
  const { data: identity } = useGetIdentity<{ id: string }>();

  // Import leads mutation
  const { mutate: createLeads, mutation } = useCustomMutation();
  const importing = mutation.isPending;

  // Delete account mutation
  const { mutate: deleteAccount } = useCustomMutation();

  // Initialize Facebook SDK
  useEffect(() => {
    // Check if SDK is already loaded
    if ((window as any).FB) {
      checkLoginStatus();
      return;
    }

    // Load Facebook SDK
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({
        appId: "1520605575927595",
        cookie: true,
        xfbml: true,
        version: "v24.0",
      });

      checkLoginStatus();
    };

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const checkLoginStatus = () => {
    (window as any).FB.getLoginStatus((response: any) => {
      if (response.status === "connected") {
        handleAuthSuccess(response.authResponse.accessToken);
      }
    });
  };

  // Handle authentication success
  const handleAuthSuccess = async (token: string) => {
    setUserToken(token);
    setIsAuthenticated(true);
    setLoading(true);

    try {
      // Get user info
      (window as any).FB.api(
        "/me",
        { fields: "name,email" },
        (userResponse: any) => {
          if (userResponse && !userResponse.error) {
            setUserName(userResponse.name);
            setUserEmail(userResponse.email);
          }
        },
      );

      // Get pages
      (window as any).FB.api(
        "/me/accounts",
        { fields: "id,name,access_token" },
        async (pagesResponse: any) => {
          if (pagesResponse && !pagesResponse.error && pagesResponse.data) {
            const pagesList = pagesResponse.data;
            setPages(pagesList);

            // Get forms for all pages
            const allForms: FacebookForm[] = [];
            let completedRequests = 0;

            if (pagesList.length === 0) {
              setLoading(false);
              return;
            }

            pagesList.forEach((page: FacebookPage) => {
              (window as any).FB.api(
                `/${page.id}/leadgen_forms`,
                { fields: "id,name", access_token: page.access_token },
                (formsResponse: any) => {
                  completedRequests++;

                  if (
                    formsResponse &&
                    !formsResponse.error &&
                    formsResponse.data
                  ) {
                    formsResponse.data.forEach((form: any) => {
                      allForms.push({
                        id: form.id,
                        name: form.name,
                        page_id: page.id,
                        page_name: page.name,
                      });
                    });
                  }

                  // Update forms when all requests complete
                  if (completedRequests === pagesList.length) {
                    setForms(allForms);
                    setLoading(false);
                  }
                },
              );
            });
          } else {
            setLoading(false);
          }
        },
      );
    } catch (error: any) {
      message.error(error.message || "Failed to fetch Facebook data");
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = () => {
    setLoading(true);
    (window as any).FB.login(
      (response: any) => {
        if (response.authResponse) {
          handleAuthSuccess(response.authResponse.accessToken);
        } else {
          message.error("Facebook login failed or was cancelled");
          setLoading(false);
        }
      },
      {
        scope:
          "pages_show_list,pages_read_engagement,pages_manage_metadata,leads_retrieval,pages_manage_ads",
      },
    );
  };

  // Handle logout
  const handleLogout = () => {
    (window as any).FB.logout(() => {
      setIsAuthenticated(false);
      setUserToken(null);
      setUserName(null);
      setUserEmail(null);
      setPages([]);
      setForms([]);
      message.success("Logged out successfully");
    });
  };

  // Refresh forms
  const handleRefresh = () => {
    if (userToken) {
      handleAuthSuccess(userToken);
    }
    fetchAutoImportAccounts();
  };

  // Fetch auto-import accounts
  const fetchAutoImportAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const orgId = getOrgId();

      if (!orgId) {
        console.error("Organization ID not found");
        setLoadingAccounts(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/v1/meta/account`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-org-id": orgId,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAutoImportAccounts(data || []);
      } else {
        console.error("Failed to fetch auto-import accounts:", response.status);
      }
    } catch (error) {
      console.error("Error fetching auto-import accounts:", error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = (accountId: string, formName: string) => {
    Modal.confirm({
      title: "Delete Auto Import Account",
      content: `Are you sure you want to remove "${formName}" from auto import list?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteAccount(
          {
            url: `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/v1/meta/account/${accountId}`,
            method: "delete",
            values: {},
          },
          {
            onSuccess: () => {
              message.success("Account removed from auto import list");
              fetchAutoImportAccounts(); // Refresh the list
            },
            onError: (error: any) => {
              message.error(
                error?.response?.data?.detail ||
                  error?.message ||
                  "Failed to delete account",
              );
            },
          },
        );
      },
    });
  };

  // Fetch auto-import accounts on component mount
  useEffect(() => {
    fetchAutoImportAccounts();
  }, []);

  // Fetch leads for a specific form
  const fetchLeads = async (form: FacebookForm) => {
    setLoadingLeads(true);
    const page = pages.find((p) => p.id === form.page_id);

    if (!page) {
      message.error("Page not found");
      setLoadingLeads(false);
      return;
    }

    (window as any).FB.api(
      `/${form.id}/leads`,
      { access_token: page.access_token },
      (response: any) => {
        if (response && !response.error && response.data) {
          setLeads(response.data);
        } else {
          message.error(response?.error?.message || "Failed to fetch leads");
          setLeads([]);
        }
        setLoadingLeads(false);
      },
    );
  };

  // Handle view leads
  const handleViewLeads = (form: FacebookForm) => {
    setSelectedForm(form);
    setSelectedLeads([]);
    setLeadsModalVisible(true);
    fetchLeads(form);
  };

  // Handle import leads
  const handleImportLeads = async () => {
    if (!selectedForm || selectedLeads.length === 0) {
      message.warning("Please select at least one lead to import");
      return;
    }

    if (!identity?.id) {
      message.error("User not authenticated");
      return;
    }

    // Get selected lead data
    const leadsToImport = leads.filter((lead) =>
      selectedLeads.includes(lead.id),
    );

    // Helper function to get field value
    const getFieldValue = (lead: FacebookLead, fieldName: string) => {
      const field = lead.field_data?.find(
        (f) => f.name.toLowerCase() === fieldName.toLowerCase(),
      );
      return field?.values?.[0] || "";
    };

    // Helper function to build notes from field data
    const buildNotes = (lead: FacebookLead, includeAllFields = false) => {
      const notes: string[] = [];

      // Add form information
      notes.push(`Facebook Lead Form: ${selectedForm.name}`);
      notes.push(`Page: ${selectedForm.page_name}`);
      notes.push(`Lead ID: ${lead.id}`);
      notes.push(`Created: ${new Date(lead.created_time).toLocaleString()}`);
      notes.push("");
      notes.push("Lead Details:");

      // Add all field data as notes
      lead.field_data?.forEach((field) => {
        // Include email in notes only if includeAllFields is true (for invalid email case)
        if (includeAllFields || field.name.toLowerCase() !== "email") {
          notes.push(`${field.name}: ${field.values.join(", ")}`);
        }
      });

      return notes.join("\n");
    };

    // Helper function to validate email
    const isValidEmail = (email: string) => {
      if (!email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    let successCount = 0;
    let errorCount = 0;

    // Import each lead individually
    for (const lead of leadsToImport) {
      const email = getFieldValue(lead, "email");
      const name =
        getFieldValue(lead, "full_name") || getFieldValue(lead, "name") || "";

      // Check if email is valid
      const hasValidEmail = isValidEmail(email);
      const finalEmail = hasValidEmail ? email : "emailnotfound@email.com";
      const notes = buildNotes(lead, !hasValidEmail); // Include email in notes if invalid

      const payload = {
        assigned_to: identity.id,
        tags: [],
        stage: "Raw (Unqualified)",
        source: "facebook",
        product_id: null,
        potential: 0,
        requirements: "",
        notes: notes,
        business: {
          business: "",
          name: name,
          title: "Mr.",
          designation: "",
          mobile:
            getFieldValue(lead, "phone_number") ||
            getFieldValue(lead, "phone") ||
            "",
          email: finalEmail,
          website: "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          country: "India",
          gstin: "",
          code: "",
        },
        since: lead.created_time,
      };

      try {
        await new Promise((resolve, reject) => {
          createLeads(
            {
              url: `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/v1/lead`,
              method: "post",
              values: payload,
            },
            {
              onSuccess: () => {
                successCount++;
                resolve(true);
              },
              onError: (error: any) => {
                errorCount++;
                console.error(`Failed to import lead ${lead.id}:`, error);
                reject(error);
              },
            },
          );
        });
      } catch (error) {
        // Error already counted
      }
    }

    // Show final result message
    if (successCount > 0) {
      message.success(
        successCount === 1
          ? "Import lead successful"
          : `${successCount} leads imported successfully!`,
      );
    }

    if (errorCount > 0) {
      message.error(
        `Failed to import ${errorCount} lead${errorCount > 1 ? "s" : ""}`,
      );
    }

    // Close modal and reset
    setSelectedLeads([]);
    setLeadsModalVisible(false);
    setSelectedForm(null);
  };

  // Handle auto import setup
  const handleAutoImport = () => {
    if (!selectedForm) {
      message.warning("Please select a form first");
      return;
    }

    if (!userToken) {
      message.error(
        "User token not available. Please reconnect your Facebook account.",
      );
      return;
    }

    createLeads(
      {
        url: `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/v1/meta/account`,
        method: "post",
        values: {
          user_token: userToken,
          page_id: selectedForm.page_id,
          form_id: selectedForm.id,
        },
      },
      {
        onSuccess: (data: any) => {
          message.success(
            `Auto import enabled for "${data?.data?.form_name || selectedForm.name}". New leads will be imported automatically!`,
          );
          fetchAutoImportAccounts(); // Refresh the accounts list
        },
        onError: (error: any) => {
          message.error(
            error?.response?.data?.detail ||
              error?.message ||
              "Failed to setup auto import",
          );
        },
      },
    );
  };

  // Auto Import Accounts table columns
  const autoImportColumns: ColumnsType<AutoImportAccount> = [
    {
      title: "Page Name",
      dataIndex: "page_name",
      key: "page_name",
      render: (text) => (
        <Space>
          <FacebookOutlined style={{ color: "#1877F2", fontSize: "16px" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Form Name",
      dataIndex: "form_name",
      key: "form_name",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteAccount(record.id, record.form_name)}
        >
          Delete
        </Button>
      ),
    },
  ];

  // Forms table columns
  const formsColumns: ColumnsType<FacebookForm> = [
    {
      title: "Page Name",
      dataIndex: "page_name",
      key: "page_name",
      render: (text) => (
        <Space>
          <FacebookOutlined style={{ color: "#1877F2", fontSize: "16px" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Form Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<ImportOutlined />}
          onClick={() => handleViewLeads(record)}
        >
          View & Import Leads
        </Button>
      ),
    },
  ];

  // Helper function to extract field value
  const getFieldValue = (lead: FacebookLead, fieldName: string): string => {
    const field = lead.field_data?.find(
      (f) => f.name.toLowerCase() === fieldName.toLowerCase(),
    );
    return field?.values?.[0] || "-";
  };

  // Leads table columns
  const leadsColumns: ColumnsType<FacebookLead> = [
    {
      title: (
        <Checkbox
          checked={selectedLeads.length === leads.length && leads.length > 0}
          indeterminate={
            selectedLeads.length > 0 && selectedLeads.length < leads.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedLeads(leads.map((lead) => lead.id));
            } else {
              setSelectedLeads([]);
            }
          }}
        />
      ),
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedLeads.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedLeads([...selectedLeads, record.id]);
            } else {
              setSelectedLeads(selectedLeads.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Text strong>
          {getFieldValue(record, "full_name") || getFieldValue(record, "name")}
        </Text>
      ),
    },
    {
      title: "Email",
      key: "email",
      render: (_, record) => <Text>{getFieldValue(record, "email")}</Text>,
    },
    {
      title: "Phone",
      key: "phone",
      render: (_, record) => (
        <Text>
          {getFieldValue(record, "phone_number") ||
            getFieldValue(record, "phone")}
        </Text>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_time",
      key: "created_time",
      render: (text) => (
        <Text type="secondary">
          {new Date(text).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Login/User Info Section */}
      {!isAuthenticated ? (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <FacebookOutlined
              style={{ fontSize: 64, color: "#1877F2", marginBottom: 24 }}
            />
            <Title level={3}>Connect your Facebook Account</Title>
            <Text type="secondary">
              Login to access your Facebook lead forms and import leads into
              your CRM
            </Text>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={handleLogin}
                loading={loading}
              >
                Connect with Facebook
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* User Info Banner */}
          <Alert
            message={
              <Space>
                <Avatar
                  style={{ backgroundColor: "#1877F2" }}
                  icon={<UserOutlined />}
                />
                <div>
                  <Text strong>{userName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {userEmail}
                  </Text>
                </div>
              </Space>
            }
            type="success"
            style={{ marginBottom: 24 }}
            action={
              <Button
                size="small"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            }
          />

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Facebook Pages"
                  value={pages.length}
                  prefix={<FacebookOutlined />}
                  valueStyle={{ color: "#1877F2" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Lead Forms"
                  value={forms.length}
                  prefix={<FormOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Leads Available"
                  value={leads.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Forms Table */}
          <Card
            title={
              <Space>
                <FormOutlined style={{ fontSize: "20px" }} />
                <Title level={4} style={{ margin: 0 }}>
                  Lead Forms
                </Title>
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" tip="Loading forms..." />
              </div>
            ) : forms.length === 0 ? (
              <Empty
                description="No Facebook lead forms found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">
                  Make sure you have lead forms created on your Facebook pages
                </Text>
              </Empty>
            ) : (
              <Table
                dataSource={forms}
                columns={formsColumns}
                rowKey="id"
                pagination={{
                  pageSize: formsPageSize,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} forms`,
                  onShowSizeChange: (_, size) => setFormsPageSize(size),
                  pageSizeOptions: ["10", "20", "50", "100"],
                }}
              />
            )}
          </Card>
        </>
      )}

      {/* Auto Import Accounts Section - Always visible */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined
              style={{ fontSize: "20px", color: "#52c41a" }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Auto Import Accounts
            </Title>
          </Space>
        }
        style={{ marginTop: 24 }}
      >
        {loadingAccounts ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" tip="Loading accounts..." />
          </div>
        ) : autoImportAccounts.length === 0 ? (
          <Empty
            description="No auto import accounts configured"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary">
              Add forms to auto import list to automatically import new leads
            </Text>
          </Empty>
        ) : (
          <Table
            dataSource={autoImportAccounts}
            columns={autoImportColumns}
            rowKey="id"
            pagination={{
              pageSize: accountsPageSize,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} accounts`,
              onShowSizeChange: (_, size) => setAccountsPageSize(size),
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
          />
        )}
      </Card>

      {/* Leads Modal */}
      <Modal
        title={
          <div>
            <Space>
              <FacebookOutlined style={{ color: "#1877F2" }} />
              <span>
                Leads from {selectedForm?.page_name} - {selectedForm?.name}
              </span>
            </Space>
            <Divider style={{ margin: "12px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Form Name: <Text strong>{selectedForm?.name}</Text>
                </Text>
              </div>
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={handleAutoImport}
                loading={importing}
                style={{
                  borderColor: "#52c41a",
                  color: "#52c41a",
                }}
              >
                Add to Auto Import List
              </Button>
            </div>
          </div>
        }
        open={leadsModalVisible}
        onCancel={() => {
          setLeadsModalVisible(false);
          setSelectedLeads([]);
          setSelectedForm(null);
        }}
        width={1000}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setLeadsModalVisible(false);
              setSelectedLeads([]);
              setSelectedForm(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            icon={<ImportOutlined />}
            onClick={handleImportLeads}
            disabled={selectedLeads.length === 0}
            loading={importing}
          >
            Import {selectedLeads.length > 0 ? `(${selectedLeads.length})` : ""}{" "}
            Lead{selectedLeads.length !== 1 ? "s" : ""}
          </Button>,
        ]}
      >
        {loadingLeads ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" tip="Loading leads..." />
          </div>
        ) : leads.length === 0 ? (
          <Empty
            description="No leads found for this form"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Tag color="blue">{leads.length} total leads</Tag>
              {selectedLeads.length > 0 && (
                <Tag color="green">
                  <CheckCircleOutlined /> {selectedLeads.length} selected
                </Tag>
              )}
            </Space>
            <Table
              dataSource={leads}
              columns={leadsColumns}
              rowKey="id"
              pagination={{
                pageSize: leadsPageSize,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} leads`,
                onShowSizeChange: (_, size) => setLeadsPageSize(size),
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              scroll={{ x: 800 }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};
