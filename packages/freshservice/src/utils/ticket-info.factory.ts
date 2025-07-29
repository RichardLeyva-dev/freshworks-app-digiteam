import { TicketInfo, TicketRequester } from '@digiteam/share';
import { FormNameValueModel } from '@digiteam/share';
import { TicketModel } from '@digiteam/share';

export function buildTicketInfo(ticket: TicketModel, requester: TicketRequester, fields: FormNameValueModel[]): TicketInfo {
    return new TicketInfo(ticket.id, fields, ticket.priority, requester);
}
