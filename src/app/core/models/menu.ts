export interface Menu {
    id: number;
    name: string;
    description?: string;
    order: number;
    parentId?: number;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
    isEditing? : boolean
    title_for_client?: string;
}
