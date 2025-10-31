import React, { useState } from "react";

import { type HttpError, useGo, useList, useUpdate } from "@refinedev/core";

import type { DragEndEvent } from "@dnd-kit/core";
import { Segmented } from "antd";
import { AppstoreOutlined, UserOutlined } from "@ant-design/icons";

import { KanbanAddCardButton } from "../components";
import { KanbanBoard, KanbanBoardContainer } from "./kanban/board";
import { ProjectCardMemo, ProjectCardSkeleton } from "./kanban/card";
import { KanbanColumn, KanbanColumnSkeleton } from "./kanban/column";
import { KanbanItem } from "./kanban/item";
import { Text } from "@/components";
import { LeadDetailModal } from "./lead-detail-modal";
import { LeadFormModal } from "../../leads/list/lead-form-modal";

type ViewMode = "stage" | "user";

// Format currency for INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

type Lead = {
  id: string;
  since: string;
  stage: string;
  tags: string[];
  requirements: string;
  notes: string;
  potential: number;
  business: {
    id: string;
    business: string;
    name: string;
    title?: string;
    designation?: string;
    mobile: string;
    email: string;
    website?: string;
    address_line_1?: string;
    address_line_2?: string;
    country?: string;
    city?: string;
    gstin?: string;
    code?: string;
  };
  product?: {
    id: number;
    name: string;
  };
  source?: {
    id: number;
    name: string;
    is_default?: boolean;
  };
  assigned_user?: {
    id: string;
    name: string;
  };
};

type LeadStage = {
  id: string;
  title: string;
  leads: Lead[];
  totalPotential: number;
};

type LeadUserGroup = {
  id: string;
  name: string;
  leads: Lead[];
  totalPotential: number;
};

type ColumnGroup = LeadStage | LeadUserGroup;

const STAGE_ORDER = [
  "Raw (Unqualified)",
  "New",
  "Discussion",
  "Demo",
  "Proposal",
  "Decided",
  "Rejected",
];

export const TasksListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("stage");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStage, setCreateStage] = useState<string>("Raw (Unqualified)");

  const {
    result: { data: leadsData },
    query: { isLoading: isLoadingLeads },
  } = useList<Lead>({
    resource: "lead",
    pagination: {
      mode: "off",
    },
    sorters: [
      {
        field: "since",
        order: "desc",
      },
    ],
  });

  // Group leads by stage
  const leadStages = React.useMemo(() => {
    if (!leadsData) return [];

    const grouped = STAGE_ORDER.map((stage) => {
      const stageLeads = leadsData.filter((lead: Lead) => lead.stage === stage);
      const totalPotential = stageLeads.reduce(
        (sum: number, lead: Lead) => sum + (lead.potential || 0),
        0,
      );

      return {
        id: stage,
        title: stage,
        leads: stageLeads,
        totalPotential,
      };
    });

    return grouped;
  }, [leadsData]);

  // Group leads by assigned user
  const leadsByUser = React.useMemo(() => {
    if (!leadsData) return [];

    // Get unique users
    const usersMap = new Map<
      string,
      { id: string; name: string; leads: Lead[]; totalPotential: number }
    >();

    // Add "Unassigned" group
    usersMap.set("unassigned", {
      id: "unassigned",
      name: "Unassigned",
      leads: [],
      totalPotential: 0,
    });

    leadsData.forEach((lead: Lead) => {
      const userId = lead.assigned_user?.id || "unassigned";
      const userName = lead.assigned_user?.name || "Unassigned";

      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          id: userId,
          name: userName,
          leads: [],
          totalPotential: 0,
        });
      }

      const userGroup = usersMap.get(userId)!;
      userGroup.leads.push(lead);
      userGroup.totalPotential += lead.potential || 0;
    });

    return Array.from(usersMap.values());
  }, [leadsData]);

  const columns = viewMode === "stage" ? leadStages : leadsByUser;

  const { mutate: updateLead } = useUpdate<Lead, HttpError>({
    resource: "lead",
    mutationMode: "optimistic",
    successNotification: {
      message: "Lead stage updated successfully",
      type: "success",
    },
  });

  const handleOnDragEnd = (event: DragEndEvent) => {
    const targetId = event.over?.id as string;
    const leadId = event.active.id as string;
    const currentValue =
      event.active.data.current?.[viewMode === "stage" ? "stage" : "userId"];

    if (currentValue === targetId) {
      return;
    }

    // Find the lead to get all its data
    const lead = leadsData?.find((l: Lead) => l.id === leadId);

    if (!lead) return;

    // Prepare the update values based on view mode
    const updateValues: any = {
      assigned_to:
        viewMode === "user" && targetId !== "unassigned"
          ? targetId
          : lead.assigned_user?.id,
      stage: viewMode === "stage" ? targetId : lead.stage,
      tags: lead.tags || [],
      source_id: lead.source?.id,
      product_id: lead.product?.id,
      potential: lead.potential,
      requirements: lead.requirements,
      notes: lead.notes,
      business: {
        id: lead.business.id,
        business: lead.business.business,
        name: lead.business.name,
        title: lead.business.title || null,
        designation: lead.business.designation || "",
        mobile: lead.business.mobile,
        email: lead.business.email,
        website: lead.business.website || "",
        address_line_1: lead.business.address_line_1 || "",
        address_line_2: lead.business.address_line_2 || "",
        city: lead.business.city || "",
        country: lead.business.country || "",
        gstin: lead.business.gstin || "",
        code: lead.business.code || "",
      },
      since: lead.since,
    };

    // If moving to unassigned, set assigned_to to null
    if (viewMode === "user" && targetId === "unassigned") {
      updateValues.assigned_to = null;
    }

    updateLead({
      id: leadId,
      values: updateValues,
    });
  };

  const handleAddCard = (args: { stageId: string }) => {
    setCreateStage(args.stageId);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setCreateStage("Raw (Unqualified)");
  };

  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLead(null);
  };

  if (isLoadingLeads) return <PageSkeleton />;

  return (
    <>
      <div
        style={{
          padding: "16px 24px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as ViewMode)}
          options={[
            {
              label: "Group by Stage",
              value: "stage",
              icon: <AppstoreOutlined />,
            },
            {
              label: "Group by Assigned To",
              value: "user",
              icon: <UserOutlined />,
            },
          ]}
          size="large"
        />
      </div>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          {columns.map((column) => {
            const columnTitle = "title" in column ? column.title : column.name;
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={columnTitle}
                count={column.leads.length}
                description={
                  <Text
                    size="lg"
                    strong
                    style={{ marginTop: "8px", display: "block" }}
                  >
                    {formatCurrency(column.totalPotential)}
                  </Text>
                }
                onAddClick={() =>
                  handleAddCard({
                    stageId:
                      viewMode === "stage" ? column.id : "Raw (Unqualified)",
                  })
                }
              >
                {isLoadingLeads && <ProjectCardSkeleton />}
                {!isLoadingLeads &&
                  column.leads.map((lead: Lead) => {
                    return (
                      <KanbanItem
                        key={lead.id}
                        id={lead.id}
                        data={{
                          ...lead,
                          stageId: column.id,
                          stage: lead.stage,
                          userId: lead.assigned_user?.id || "unassigned",
                        }}
                      >
                        <ProjectCardMemo
                          id={lead.id}
                          title={lead.business.business}
                          updatedAt={lead.since}
                          dueDate={lead.since}
                          users={
                            lead.assigned_user
                              ? [
                                  {
                                    id: lead.assigned_user.id,
                                    name: lead.assigned_user.name,
                                    avatarUrl: undefined,
                                  },
                                ]
                              : []
                          }
                          onCardClick={() => handleCardClick(lead)}
                        />
                      </KanbanItem>
                    );
                  })}
                {!column.leads.length && (
                  <KanbanAddCardButton
                    onClick={() =>
                      handleAddCard({
                        stageId:
                          viewMode === "stage"
                            ? column.id
                            : "Raw (Unqualified)",
                      })
                    }
                  />
                )}
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
      </KanbanBoardContainer>
      <LeadDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
      />
      <LeadFormModal
        action="create"
        opened={createModalOpen}
        onClose={handleCloseCreateModal}
        leadData={{ stage: createStage }}
      />
      {children}
    </>
  );
};

const PageSkeleton = () => {
  const columnCount = 7;
  const itemCount = 4;

  return (
    <KanbanBoardContainer>
      {Array.from({ length: columnCount }).map((_, index) => {
        return (
          <KanbanColumnSkeleton key={index}>
            {Array.from({ length: itemCount }).map((_, index) => {
              return <ProjectCardSkeleton key={index} />;
            })}
          </KanbanColumnSkeleton>
        );
      })}
    </KanbanBoardContainer>
  );
};
