import { TicketInfo, TicketRequester } from '../models/ticket-info.model';
import { FormNameValueModel } from '../models/form-name-value.model';
import { TicketModel } from '../models/ticket-model';

export function buildTicketInfo(ticket: TicketModel, requester: TicketRequester, fields: FormNameValueModel[]): TicketInfo {
    return new TicketInfo(ticket.id, fields, ticket.priority, requester);
}
