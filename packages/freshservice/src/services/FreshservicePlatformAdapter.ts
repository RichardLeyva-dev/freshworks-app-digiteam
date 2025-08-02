import { IPlatformAdapter } from '../adapters/PlatformAdapter';
import { defer, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { UserModel } from '../models/user-model';
import { TicketModel } from '../models/ticket-model';
import { ViewStates } from '../enums/view-states.enum';
import { TicketInfo, TicketRequester } from '../models/ticket-info.model';
import { buildTicketInfo } from "../utils/ticket-info.factory";
import { ThirdPartyConfigService } from "./ThirdPartyConfigService";
import { FieldMappingDescriptor, PluginConfigModel } from '../models/config.model';
import moment from 'moment-timezone';
import { FormNameValueModel } from '../models/form-name-value.model';

interface FreshTicketResponse {
    ticket: { id: string | number };
}

export enum FreshserviceViewStates {
    USER_SIDEBAR = 'user_sidebar',
    TICKET_SIDEBAR = 'ticket_sidebar'
}

export class FreshservicePlatformService implements IPlatformAdapter {
    private configService?: ThirdPartyConfigService;

    constructor(private client: any) { }

    setConfig(config: PluginConfigModel) {
        this.configService = new ThirdPartyConfigService(config);
    }

    private pageHeights: Record<string, string> = {
        login: '400px',
        home: '600px',
        orderCreateFormView: '900px',
    };

    getInitialViewOnLoad(): Observable<ViewStates> {
        return from(this.client.instance.context() as Promise<{ location: string }>).
            pipe(
                map(({ location }) => {
                    switch (location) {
                        case FreshserviceViewStates.USER_SIDEBAR:
                            return ViewStates.USER_ORDERS;
                        default:
                            return ViewStates.ORDER_DETAILS;
                    }
                })
            );
    }

    resize(routeName?: string): void {
        const height = routeName
            ? this.pageHeights[routeName] || '500px'
            : '500px';

        if (this.client?.instance?.resize) {
            this.client.instance.resize({ height });
        }
    }

    getLocale(): Observable<string> {
        return from(this.client.data.get('requester')).pipe(
            map(({ requester }: any) => requester.language),
            catchError(err => {
                console.error('Error getting locale:', err);
                return of('pt');
            })
        );
    }

    getDigiteamApiUrl$(): Observable<string | undefined> {
        return from(this.client.iparams.get() as Promise<{ [key: string]: any }>).pipe(
            map((iparams) => iparams?.backend_url || undefined),
            catchError((err) => {
                console.error("Erro ao obter iparams:", err);
                return of(undefined);
            })
        );
    }

    getTicketId(): Observable<string> {
        return defer(() => this.client.data.get('ticket') as Promise<FreshTicketResponse>).pipe(
            map(res => String(res.ticket.id)),
            catchError(err => {
                console.error('Error getting ticket id:', err);
                return of('');
            })
        );
    }

    getSla(policyMetrics: any[], timezone: string): string | undefined {
        const metric = policyMetrics.find(m => m?.breach_at != null);
        if (!metric) {
            return undefined;
        }
        const dateUtc = moment.utc(metric.breach_at);
        return dateUtc.tz(timezone).format();
    }

    getSlaMetrics(ticketData: any, timezone: string): string | undefined {
        const metrics =
            ticketData?.group_slas?.policy_metrics ??
            ticketData?.slas?.policy_metrics ??
            [];

        return this.getSla(metrics, timezone);
    }

    getTicketInfo(): Observable<TicketInfo> {
        if (!this.configService) {
            console.error('ConfigService not set');
            return of(new TicketInfo('', [], '', { avatarUrl: '', email: '', name: '', phone: '' }, ''));
        }

        const timezone = this.configService.getDigiteamTimeZone();

        return forkJoin({
            ticket: this.getTicketDetails(),
            requester: this.getRequesterDetails(),
            ticketData: this.getTicketDetails(),
            organization: of({})
        }).pipe(
            switchMap(({ ticket, requester, ticketData, organization }) => {
                const cleanedRequester = this.mapToTicketRequester(requester);
                const base = buildTicketInfo(ticket, cleanedRequester, []);

                if (timezone && ticketData) {
                    base.serviceDueDate = this.getSlaMetrics(ticketData, timezone);
                }
                console.log('🟡 ticketData:', ticketData);
                console.log('🟡 timezone:', timezone);
                console.log('🟡 SLA result:', this.getSlaMetrics(ticketData, timezone));

                return this.extractCustomFields(ticketData, base, organization).pipe(
                    map(fields => {
                        return new TicketInfo(
                            ticket.id,
                            fields,
                            ticket.priority,
                            cleanedRequester,
                            this.getSlaMetrics(ticketData, timezone) ?? 'Not defined - SLA'
                        );
                    })
                );
            })
        );
    }

    mapToTicketRequester(user: UserModel): TicketRequester {
        const cleanPhone = (user.phone ?? '').replace(/\D/g, '').substring(0, 13);
        return {
            avatarUrl: user.avatar ?? '',
            email: user.email ?? '',
            name: user.name ?? '',
            phone: cleanPhone ? cleanPhone : '',
        };
    }

    private extractCustomFields(ticketData: any, ticketInfo: TicketInfo, organization: any): Observable<FormNameValueModel[]> {
        if (!this.configService) {
            return of([]);
        }

        const mappings = this.configService.getMappings().filter(m => m.source === 'freshservice');
        return from(mappings).pipe(
            mergeMap(m => this.mapSingleField(m, ticketData, ticketInfo, organization)),
            filter((f): f is FormNameValueModel => !!f),
            toArray(),
        );
    }

    private mapSingleField(mapping: FieldMappingDescriptor, ticketData: any, ticketInfo: TicketInfo, organization: any): Observable<FormNameValueModel | undefined> {
        const source = {
            ticket: ticketData,
            requester: ticketInfo.requester,
            organization
        };

        const rawValue = this.getValueFromPath(source, mapping.sourceFieldPath);

        if (rawValue === undefined || rawValue === null || rawValue === '') {
            return of(undefined);
        }
        return of({
            name: mapping.targetFieldId, value: rawValue
        });
    }

    private getValueFromPath(obj: any, path: string): any {
        return path.split('.').reduce((a, k) => (a ? a[k] : undefined), obj);
    }

    getProductName() {
        return 'freshservice';
    }

    getTicketDetails(): Observable<TicketModel> {
        return defer(() => this.client.data.get('ticket')).pipe(
            map(({ ticket }: any): TicketModel => {
                console.log("🧾 Ticket completo desde Freshservice:", ticket);
                return {
                    id: String(ticket.id),
                    title: ticket.subject,
                    description: ticket.description,
                    status: ticket.status,
                    priority: ticket.priority,
                    labels: ticket.tags ?? [],
                    accountId: ticket.account_id,
                    metadata: ticket.custom_field ?? {},
                    requesterId: ticket.requester_id,
                    requesterName: ticket.requester_name,
                    priorityName: ticket.priority_name,
                    statusName: ticket.status_name,
                    urgencyName: ticket.urgency_name,
                    impactName: ticket.impact_name,
                    ticketType: ticket.ticket_type,
                    sourceName: ticket.source_name,
                };
            })
        );
    }

    getRequesterDetails(): Observable<UserModel> {
        return from(
            this.client.data.get('requester').then(({ requester }: any) => {
                return ({
                    id: String(requester.id),
                    name: requester.name,
                    email: requester.email,
                    phone: requester.phone || requester.mobile || '',
                    title: requester.job_title ?? '',
                    locale: requester.language ?? '',
                    address: requester.address ?? '',
                    avatar: '',
                    timezone: requester.time_zone ?? '',
                    timeFormat: requester.time_format ?? '',
                    isVip: requester.vip_user ?? false,
                    isAgent: requester.helpdesk_agent ?? false,
                    active: requester.active ?? true,
                    deleted: requester.deleted ?? false,
                    createdAt: requester.created_at ?? '',
                    updatedAt: requester.updated_at ?? '',
                });
            })
        ).pipe(map(r => r as UserModel));
    }


}
