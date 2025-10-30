import { Edit } from "@refinedev/antd";
import { useForm } from "@refinedev/antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { LeadForm } from "../components";

/**
 * Lead Edit Page
 * Handles editing existing leads using the shared LeadForm component
 */
export const LeadEditPage = () => {
  const { formProps, saveButtonProps, query } = useForm({
    resource: "lead",
    redirect: "list",
  });

  const lead = query?.data?.data;

  // Transform data for form
  useEffect(() => {
    if (lead && formProps.form) {
      const formData = {
        ...lead,
        since: lead.since ? dayjs(lead.since) : undefined,
        source_id: lead.source?.id,
        product_id: lead.product?.id,
        assigned_user_id: lead.assigned_user?.id,
      };

      formProps.form.setFieldsValue(formData);
    }
  }, [lead, formProps.form]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <LeadForm formProps={formProps} action="edit" />
    </Edit>
  );
};
