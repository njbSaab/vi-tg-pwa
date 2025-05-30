export interface User {
    id: number; 
    uuid?: string;
    isBot: boolean;
    firstName?: string;
    lastName?: string | null;
    username?: string | null;
    email?: string | null;
    languageCode?: string | null;
    canJoinGroups: boolean;
    canReadAllGroupMessages: boolean;
    supportsInlineQueries: boolean;
    state: 'start' | 'email_getted' | 'awaiting_code' | 'not_started';
    lastActive?: string | null;
    isNewsActive: boolean;
    createdAt: string;
    updatedAt: string;
  }