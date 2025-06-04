export interface News {
    id: number;
    post_title: string;
    post_content: string;
    post_image_url: string;
    btn_title: string | null;
    isActive: boolean;
    news_url: string | null;
    title_for_client: string | null;
    created_at: string;
    updated_at: string;
    category: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      title_for_client: string | null;
      updated_at: string;
    };
  }