declare module 'zendesk_app_framework_sdk' {
    export interface ZAFClient {
      /* Métodos que ya declaraste */
      invoke(cmd: string, payload?: any): Promise<any>;
      get(path: string): Promise<Record<string, any>>;
      request(opts: any): Promise<any>;
      on(event: string, cb: (...args: any[]) => void): void;
      off?(event: string, cb: (...args: any[]) => void): void;

      /* ➜  Añade aquí context() con el tipo de retorno */
      context(): Promise<{ location: string; [key: string]: any }>;
    }

    export function init(): ZAFClient;
    const _default: { init: typeof init };
    export default _default;
  }
