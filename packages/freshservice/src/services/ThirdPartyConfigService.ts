import { FieldMappingDescriptor, PluginConfigModel } from '../models/config.model';

export class ThirdPartyConfigService {

    private supportAppConfig: PluginConfigModel | null = null;

    constructor(cfg: PluginConfigModel | null) {
        this.supportAppConfig = cfg;
    }

    hasConditions(): boolean {
        return !!this.supportAppConfig?.conditions;
    }

    getDigiteamTimeZone(): string {
        return this.hasConditions()
            ? this.supportAppConfig!.conditions.digiteamTimezone
            : 'UTC';
    }

    getConfig(): PluginConfigModel | null {
        return this.supportAppConfig;
    }

    hasMappings() {
        return this.supportAppConfig && this.supportAppConfig.mappings;
    }

    getMappings(): FieldMappingDescriptor[] {
        return this.supportAppConfig?.mappings ?? [];
    }


    getTicketPrefix(): string {
        return this.supportAppConfig?.ticketPrefix ?? '';
    }
}
