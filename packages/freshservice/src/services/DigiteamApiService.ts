import axios from 'axios';
import {catchError, from, map, Observable, of, shareReplay, tap} from 'rxjs';
import {OrganizationModel} from '../models/organization-model';
import {RegionModel} from '../models/region-model';
import {OrderTypeModel} from '../models/order-type-model';
import {AuthService} from './AuthService';
import {CreateOrderRequest} from '../models/create-order-request';
import {PriorityModel} from '../models/priority-model';
import {OrderDetailModel} from '@digiteam/share';
import {PluginConfigModel, DigiteamMappingModel, ProductMappingModel} from '../models/config.model';
import i18n from '../i18n';
import {environment} from '../environments/environment.local.freshservice';

export class DigiteamApiService {
    private authService = new AuthService();
    private _config$: Observable<PluginConfigModel | null> | null = null;
    supportAppConfig: PluginConfigModel | null = null;

    private getAuthHeaders(): { Authorization: string } {
        const token = localStorage.getItem('user_token');
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    getUnits(): Observable<OrganizationModel[]> {
        const url = `${this.authService.getTenantUrl()}/api-v1/angular/units/all`;
        return from(
            axios
                .get<OrganizationModel[]>(url, {
                    headers: this.getAuthHeaders(),
                })
                .then((res) => res.data)
        );
    }

    getRegions(unitId: number): Observable<RegionModel[]> {
        const url = `${this.authService.getTenantUrl()}/api-v1/angular/regions/${unitId}`;
        return from(
            axios
                .get<RegionModel[]>(url, {
                    headers: this.getAuthHeaders(),
                })
                .then((res) => res.data)
        );
    }

    getOrderTypes(): Observable<OrderTypeModel[]> {
        const url = `${this.authService.getTenantUrl()}/api-v1/angular/orderTypes/all`;
        return from(
            axios
                .get<OrderTypeModel[]>(url, {
                    headers: this.getAuthHeaders(),
                })
                .then((res) => res.data)
        );
    }

    createOrder(request: CreateOrderRequest): Observable<any> {
        const url = `${this.authService.getTenantUrl()}/api-v1/orders`;

        return from(
            axios.post(url, request, {headers: this.getAuthHeaders()})
                .then(res => res.data)
                .catch(err => {
                    if (axios.isAxiosError(err)) {
                        console.group('🔴 Digiteam 500');
                        console.log('status   :', err.response);

                    } else {
                        console.error(err);
                    }
                    throw err;
                })
        );
    }

    getPriorities(): Observable<PriorityModel[]> {
        return this.getThirdPartyPluginConfig().pipe(
            map(cfg => {
                const raw: ProductMappingModel[] = cfg?.dataSources?.priorities ?? [];
                console.log('🟢 Priorities fetched:', raw);

                return raw.map(p => ({
                    id: Number(p.id ?? p.digiteamValue),
                    name: i18n.t(p.name ?? ''),
                    externalValue: (p as any).externalValue ?? (p as any).zendeskValue
                }));
            })
        );
    }

    getFieldLabel(fieldId: string | number, value: any): Observable<string> {
        const key = String(fieldId).toLowerCase();
        switch (key) {
            case 'priority':
                return this.getPriorities().pipe(
                    map(list => list.find(p =>
                        String(p.id) === String(value) || String(p.value) === String(value)
                    )?.name ?? String(value))
                );
            case 'country':
                return this.getCountries().pipe(
                    map(list => list.find(c =>
                        String(c.digiteamValue).toLowerCase() === String(value).toLowerCase() ||
                        String(c.externalValue).toLowerCase() === String(value).toLowerCase()
                    )?.externalValue ?? String(value))
                );
            default:
                return of(String(value));
        }
    }

    getCountries(): Observable<DigiteamMappingModel[]> {
        return this.getThirdPartyPluginConfig().pipe(
            map(cfg => {
                const raw = cfg?.dataSources?.countries ?? [];
                return raw.map((c: any) => ({
                    externalValue: c.zendeskValue ?? c.id,
                    digiteamValue: c.digiteamValue ?? c.value
                }));
            })
        );
    }

    getOrderByTicketId(ticketPrefix: string, ticketId: number): Observable<OrderDetailModel[]> {
        const url = `${this.authService.getTenantUrl()}/api-v1/angular/orders/ticketingSystem/${ticketPrefix}${ticketId}`;
        console.log('🔵 Fetching orders for ticket:', url);
        return from(
            axios.get<OrderDetailModel[]>(url, {
                headers: this.getAuthHeaders(),
            }).then((res) => res.data)
        );
    }

    getThirdPartyPluginConfig(): Observable<PluginConfigModel | null> {
        if (this._config$) {
            return this._config$;
        }

        const configVersion = environment.pluginConfigName;

        const url = `${this.authService.getTenantUrl()}/api-v1/thirdPartyPlugin/config/${configVersion}`;

        this._config$ = from(axios.get(url, {headers: this.getAuthHeaders()}))
            .pipe(
                map(res => {
                    const app = res.data;
                    return app.configured ? JSON.parse(app.config) as PluginConfigModel : null;
                }),
                tap(cfg => this.supportAppConfig = cfg),
                shareReplay(1),
                catchError(err => {
                    console.error('❌ Config error', err);
                    return of(null);
                })
            );

        return this._config$;
    }

    hasConditions(): boolean {
        return !!this.supportAppConfig?.conditions;
    }

    canUseGeolocation(): boolean {
        return this.supportAppConfig?.conditions?.canUseGeolocation ?? false;
    }

}
