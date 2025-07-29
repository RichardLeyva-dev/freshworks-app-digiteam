export interface UserModel {
    id: string;
    name: string;
    email: string;
    phone?: string;
    title?: string;
    locale?: string;
    address?: string;
    avatar?: string;
    timezone?: string;
    timeFormat?: string;
    isVip?: boolean;
    isAgent?: boolean;
    active?: boolean;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
