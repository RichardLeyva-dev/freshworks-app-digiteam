export interface TicketModel {
    id: string;
    title?: string;
    description?: string;
    status?: string | number;
    statusName?: string;
    priority?: string | number;
    priorityName?: string;
    labels?: string[];
    metadata?: Record<string, any>;
    accountId?: number;
    requesterId?: number;
    requesterName?: string;
    urgencyName?: string;
    impactName?: string;
    ticketType?: string;
    sourceName?: string;
  }
