import { IPlatformAdapter } from '../../../freshservice/src/adapters/PlatformAdapter';
import { Observable, from, of, zip } from 'rxjs';
import { map, switchMap, mergeMap, toArray } from 'rxjs/operators';
import { TicketInfo, TicketRequester } from '../../../freshservice/src/models/ticket-info.model';
import { FormNameValueModel } from '../../../freshservice/src/models/form-name-value.model';
import { ThirdPartyConfigService } from '../../../freshservice/src/services/ThirdPartyConfigService';
import { PluginConfigModel } from '../../../freshservice/src/models/config.model';
import moment from 'moment-timezone';

export class ZendeskPlatformService implements IPlatformAdapter {
    private configService?: ThirdPartyConfigService;
    private client: any;

    constructor() {
        // ✅ Inicialización idéntica a Angular
        if ((window as any).ZAFClient) {
            this.client = (window as any).ZAFClient.init();
        } else {
            console.error('⚠️ ZAFClient no está disponible. Verifica tu manifest.json para cargar zaf_sdk.min.js');
        }
    }

    setConfig(config: PluginConfigModel) {
        this.configService = new ThirdPartyConfigService(config);
    }

    getInitialViewOnLoad(): Observable<any> {
        return from(this.client.context()).pipe(
            map((ctx: any) => ctx.location === 'ticket_sidebar' ? 'ORDER_DETAILS' : 'USER_ORDERS')
        );
    }

    resize(routeName?: string): void {
        this.client.invoke('resize', { height: '800px' });
    }

    getLocale(): Observable<string> {
        return from(this.client.get('currentUser')).pipe(
            map((res: any) => res.currentUser.locale || 'en')
        );
    }

    getDigiteamApiUrl$(): Observable<string | undefined> {
        return from(this.client.metadata()).pipe(
            map((m: any) => m.settings?.digiteam_url)
        );
    }

    getTicketId(): Observable<string> {
        return from(this.client.get('ticket.id')).pipe(
            map((res: any) => String(res['ticket.id']))
        );
    }

    getTicketInfo(): Observable<TicketInfo> {
        if (!this.configService) {
            return of(new TicketInfo('', [], '', { avatarUrl: '', email: '', name: '', phone: '' }, ''));
        }

        return from(this.client.get('ticket')).pipe(
            switchMap((t: any) => {
                return zip(
                    of(new TicketInfo(String(t.ticket.id), [], t.ticket.priority, this.mapToTicketRequester(t.ticket), '')),
                    this.getTicketDataById(t.ticket.id),
                    this.getTicketOrganization()
                );
            }),
            switchMap(([ticketInfo, ticketData, org]) => {
                ticketInfo.serviceDueDate = this.getSlaMetrics(ticketData, this.configService!.getDigiteamTimeZone());
                return this.extractCustomFields(ticketData, ticketInfo, org).pipe(
                    map(fields => {
                        ticketInfo.extraFields = fields.filter(f => f && f.value !== undefined);
                        return ticketInfo;
                    })
                );
            })
        );
    }

    private mapToTicketRequester(t: any): TicketRequester {
        const phone = t.requester?.phone ? t.requester.phone.replace(/\D/g, '').substring(0, 13) : '';
        return {
            avatarUrl: t.requester?.avatarUrl || '',
            email: t.requester?.email || '',
            phone,
            name: t.requester?.name || ''
        };
    }

    private getTicketDataById(id: string): Observable<any> {
        return from(this.client.request({ url: `/api/v2/tickets/${id}`, type: 'GET' })).pipe(
            map((r: any) => r.ticket)
        );
    }

    private getTicketOrganization(): Observable<any> {
        return from(this.client.get('ticket.organization')).pipe(
            map((res: any) => res['ticket.organization'])
        );
    }

    private getSlaMetrics(ticketData: any, timezone: string) {
        const metrics = ticketData?.slas?.policy_metrics || [];
        const sla = metrics.find((m: any) => m.breach_at);
        if (sla) return moment.utc(sla.breach_at).tz(timezone).format();
        return undefined;
    }

    private extractCustomFields(ticketData: any, ticketInfo: TicketInfo, org: any): Observable<FormNameValueModel[]> {
        if (!this.configService) return of([]);
        const mappings = this.configService.getMappings().filter(m => m.source === 'zendesk');
        return from(mappings).pipe(
            mergeMap(m => {
                const val = this.getValueFromPath({ ticket: ticketInfo, ticketData, organization: org }, m.sourceFieldPath);
                return val !== undefined ? of({ name: m.targetFieldId, value: val }) : of();
            }),
            toArray()
        );
    }

    private getValueFromPath(obj: any, path: string): any {
        return path.split('.').reduce((a, k) => (a ? a[k] : undefined), obj);
    }

    getProductName() {
        return 'zendesk';
    }
}
