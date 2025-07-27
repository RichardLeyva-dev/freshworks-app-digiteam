import { Observable } from "rxjs";
import { ViewStates } from "../enums/view-states.enum";
import { TicketInfo } from "../models/ticket-info.model";
import { PluginConfigModel } from "../models/config.model";

export interface IPlatformAdapter {

    getInitialViewOnLoad(): Observable<ViewStates>;

    resize(routeName?: string): void;

    getLocale(): Observable<string>;

    getDigiteamApiUrl$(): Observable<string | undefined>;

    getTicketId(): Observable<string>;

    getTicketInfo(): Observable<TicketInfo>;

    getProductName(): string;

    setConfig(config: PluginConfigModel): void;

}
