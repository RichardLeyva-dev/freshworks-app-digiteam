interface FreshClient {
    data: {
      get: (key: string) => Promise<{ [key: string]: any }>;
    };
  }

  declare const app: {
    initialized: () => Promise<FreshClient>;
  };

  export {};
