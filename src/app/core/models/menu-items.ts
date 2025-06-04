// src/app/models/menu-item.model.ts
import { MenuPostButton } from './post-buttons';

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    order: number;
    parentId: number | null;
    created_at: string;
    updated_at: string;
    isActive: boolean;
    title_for_client: string;
    linkedPostId?: number;
    linked_post: {
      id: number;
      post_title: string;
      title_for_client: string;
      post_content: string;
      post_image_url: string | null;
      buttons?: MenuPostButton[];
      nextPostId: number;
    } | null;
  }
  
