export interface Interaction {
  id: string;
  note: string;
  interaction_type: InteractionType;
  interacted_at: string;
  interacted_by_user: InteractedByUser;
  lead_id: string;
}

export interface InteractedByUser {
  id: string;
  name: string;
}

export enum InteractionType {
  CALL = "Call",
  MEETING = "Meeting",
  ONLINE = "Online",
  EMAIL = "Email",
  MESSAGE = "Message",
  OTHER = "Other",
}

export interface CreateInteractionPayload {
  lead_id: string;
  note: string;
  interaction_type: InteractionType;
  interacted_at: string;
}
