import React, { useState } from "react";

import { type HttpError, useGo, useList, useUpdate } from "@refinedev/core";

import type { DragEndEvent } from "@dnd-kit/core";

import { KanbanAddCardButton } from "../components";
import { KanbanBoard, KanbanBoardContainer } from "./kanban/board";
import { ProjectCardMemo, ProjectCardSkeleton } from "./kanban/card";
import { KanbanColumn, KanbanColumnSkeleton } from "./kanban/column";
import { KanbanItem } from "./kanban/item";
import { Text } from "@/components";
import { LeadDetailModal } from "./lead-detail-modal";

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

  const { mutate: updateLead } = useUpdate<Lead, HttpError>({
    resource: "lead",
    mutationMode: "optimistic",
    successNotification: {
      message: "Lead stage updated successfully",
      type: "success",
    },
  });

  const handleOnDragEnd = (event: DragEndEvent) => {
    const newStage = event.over?.id as string;
    const leadId = event.active.id as string;
    const currentStage = event.active.data.current?.stage;

    if (currentStage === newStage) {
      return;
    }

    // Find the lead to get all its data
    const lead = leadsData?.find((l: Lead) => l.id === leadId);

    if (!lead) return;
    updateLead({
      id: leadId,
      values: {
        stage: newStage,
        assigned_to: lead.assigned_user?.id,
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
      } as any,
    });
  };

  const handleAddCard = (args: { stageId: string }) => {
    go({ to: `/leads?create=true&stage=${args.stageId}`, type: "replace" });
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
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          {leadStages.map((column) => {
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
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
                onAddClick={() => handleAddCard({ stageId: column.id })}
              >
                {isLoadingLeads && <ProjectCardSkeleton />}
                {!isLoadingLeads &&
                  column.leads.map((lead: Lead) => {
                    return (
                      <KanbanItem
                        key={lead.id}
                        id={lead.id}
                        data={{ ...lead, stageId: column.id }}
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
                        stageId: column.id,
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
