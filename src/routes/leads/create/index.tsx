import { Create } from "@refinedev/antd";
import { useForm } from "@refinedev/antd";
import { LeadForm } from "../components";

/**
 * Lead Create Page
 * Handles creation of new leads using the shared LeadForm component
 */
export const LeadCreatePage = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "lead",
    redirect: "list",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <LeadForm formProps={formProps} action="create" />
    </Create>
  );
};
