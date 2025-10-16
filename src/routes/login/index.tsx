import { AuthPage, ThemedTitle as ThemedTitleV2 } from "@refinedev/antd";
import { Alert } from "antd";

import { authCredentials } from "@/providers";

export const LoginPage = () => {
  return (
    <>
      <Alert
        message="Note"
        description="The API is hosted on a free tier and may take 30-60 seconds to wake up on first login. Please wait after clicking the login button."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <AuthPage
        type="login"
        registerLink={false}
        forgotPasswordLink={false}
        title={<ThemedTitleV2 collapsed={false} text="Refine Project" />}
        formProps={{
          initialValues: authCredentials,
        }}
      />
    </>
  );
};
