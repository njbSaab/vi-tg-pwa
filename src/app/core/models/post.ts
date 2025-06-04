import { MenuItem } from './menu-items';
import { MenuPostButton } from './post-buttons';

export interface MenuPost {
  id: number;
  post_title: string;
  title_for_client?: string;
  post_content: string;
  post_image_url: string | null;
  parent_menu?: MenuItem | null;
  created_at: string;
  updated_at: string;
  buttons?: MenuPostButton[];
  nextPostId?: number;
}