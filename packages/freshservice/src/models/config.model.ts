export interface PluginConfigModel {
    conditions: {
        showMap: PluginConditionModel;
        showAgentData: PluginConditionModel;
        canCancelOrder: PluginConditionModel;
        isOrderConcluded: PluginConditionModel;
        isOrderStarted: PluginConditionModel;
        isStatusLogType: PluginConditionModel;
        canCreateOrder: PluginConditionModel;
        canUseGeolocation: boolean;
        maxOrdersPerTicket: number;
        digiteamTimezone: string;
    };
    dataSources: {
        priorities: ProductMappingModel[];
        countries: DigiteamMappingModel[],
    };
    mappings: FieldMappingDescriptor[];
    formValidations: RequiredFieldMessage[];
    ticketPrefix: string;
}



export interface PluginConditionModel {
    views: string[];
    orderStatusIds: number[];
    logTypeId: number[];
}

export interface ProductMappingModel {
    id?: number;
    externalValue: string;
    digiteamValue: string;
    name?: string;
}

export interface DigiteamMappingModel {
    externalValue: string;
    digiteamValue: string;
}

export interface FieldMappingDescriptor {
    source: string;
    sourceFieldPath: string;
    overwriteFieldIfEmpty: boolean;
    sourceFieldType?: string;
    sourceCustomFieldName?: string;
    target: string;
    targetFieldId: string;
    targetDefaultValueIfMissing?: string;
}

export interface RequiredFieldMessage {
    field: string;
    message: {
        en: string;
        es: string;
        pt: string;
    };
}

export interface RequesterModel {
    id: string;
    name: string;
    email: string;
    phone?: string;
    title?: string;
    locale?: string;
    avatar?: string;
}

