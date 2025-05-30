// src/app/core/models/post-buttons.ts
export interface MenuButton {
    id: number;
    name: string;
    url: string;
    order: number;
  }
  
  export interface MenuPostButton {
    id: number;
    button: MenuButton;
  }