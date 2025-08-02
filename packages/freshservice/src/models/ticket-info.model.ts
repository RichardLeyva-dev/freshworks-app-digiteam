import { FormNameValueModel } from './form-name-value.model';

export class TicketInfo {
    constructor(
        public id: string,
        public extraFields: FormNameValueModel[],
        public priority?: string | number,
        public requester?: TicketRequester,
        public serviceDueDate?: string
    ) { }

    getExtraField(name: string): FormNameValueModel | undefined {
        console.log('Searching for extra field:', name);
        return this.extraFields.find(field => field.name === name);
    }

    getExtraFieldAsGeolocation(name: string): { lat: number; lng: number } {
        const geo = this.extraFields.find(f => f.name === name)?.value;
        if (typeof geo === 'string' && geo.includes(';')) {
            const [lat, lng] = geo.split(';');
            return { lat: Number(lat), lng: Number(lng) };
        }
        return {
            lat: 0, lng: 0
        };
    }
}
export interface TicketRequester {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
}
