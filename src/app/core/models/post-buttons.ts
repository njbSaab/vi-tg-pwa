export interface MenuButton {
  id: number;
  name: string;
  url?: string | null  ; 
  order: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
  title_for_client?: string;
  categorySportId?: number | null;
  postId?: number | null;
  linkedPostId?: number | null; 
}

export interface MenuPostButton {
  id: number;
  buttonId: number; 
  button: MenuButton;
}