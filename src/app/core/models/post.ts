// src/app/core/models/post.ts
import { MenuPostButton } from './post-buttons';

export interface MenuPost {
  id: number;
  post_title: string;
  title_for_client?: string;
  post_content: string;
  post_image_url: string | null;
  buttons?: MenuPostButton[]; // Изменено на MenuPostButton[]
}