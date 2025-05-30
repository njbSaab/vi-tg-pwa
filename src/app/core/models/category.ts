export interface Category {
        id: number;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
        title_for_client: string | null;
        image_url?: string; // Добавляем поле для картинки
}