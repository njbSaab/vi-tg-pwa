import { Category } from './../../models/category';
// src/app/core/pages/menu/menu.component.ts
import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-items';
import { MenuPost, } from '../../models/post';
import { MenuButton, MenuPostButton } from '../../models/post-buttons';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: false
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  currentParentId: number | null = null;
  errorMessage: string | null = null;
  lastClickedMenuItemId: number | null = null; // ID последней кликнутой кнопки
  selectedPost: MenuPost | null = null;
  nameUser: string | null = null;
  email: string | null = null;
  isLoading = false;
  greetings: { text: string, image_url?: string, title_for_client?: string, greeting_text?: string }[] = [];

  constructor(
    private menuService: MenuService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.getUsersTitles();
    this.loadGreetings();
    this.loadMenuItems();
    this.loadLastClickedPost();
  }
  getUsersTitles(){
    this.nameUser = localStorage.getItem('firstName');
    this.email = localStorage.getItem('email');
  }
  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        // Устанавливаем isActive только для корневых элементов или сохранённого пути
        const savedLastClickedId = localStorage.getItem('lastClickedMenuItemId');
        if (savedLastClickedId) {
          const lastId = parseInt(savedLastClickedId, 10);
          this.lastClickedMenuItemId = lastId;
          this.menuItems = this.menuItems.map(item => ({
            ...item,
            isActive: item.parentId === null || this.isInActivePath(item, lastId)
          }));
        } else {
          this.menuItems = this.menuItems.map(item => ({
            ...item,
            isActive: item.parentId === null
          }));
        }
        console.log('Loaded menuItems:', this.menuItems);
      },
      error: (error) => {
        console.error('Ошибка загрузки меню:', error);
        this.errorMessage = 'Не удалось загрузить меню. Попробуйте позже.';
      }
    });
  }
  loadGreetings(): void {
    this.isLoading = true;
    this.apiService.getGreetings().subscribe({
      next: (greetings) => {
        this.greetings = greetings;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Ошибка загрузки приветствия | Lỗi tải lời chào';
        this.isLoading = false;
      }
    });
  }
  // Проверяет, находится ли элемент в пути к последнему кликнутому элементу
  isInActivePath(item: MenuItem, lastClickedId: number): boolean {
    if (item.id === lastClickedId) return true;
    if (item.linkedPostId || item.linked_post?.id) return false;
    return this.menuItems.some(child => 
      child.parentId === item.id && this.isInActivePath(child, lastClickedId)
    );
  }

  loadLastClickedPost(): void {
    const savedLastClickedId = localStorage.getItem('lastClickedMenuItemId');
    if (savedLastClickedId) {
      const itemId = parseInt(savedLastClickedId, 10);
      const item = this.menuItems.find(i => i.id === itemId);
      if (item && (item.linkedPostId || item.linked_post?.id)) {
        const postId = item.linkedPostId || item.linked_post?.id;
        if (postId) {
          this.currentParentId = item.parentId;
          this.loadPost(postId);
          console.log('Loading last clicked post with ID:', postId);
        }
      }
    }
  }

  saveLastClickedItem(itemId: number): void {
    localStorage.setItem('lastClickedMenuItemId', itemId.toString());
    console.log('Saved lastClickedMenuItemId:', itemId);
  }

  getDisplayedItems(): MenuItem[] {
    const filteredItems = this.menuItems.filter(
      (item) => item.parentId === this.currentParentId && item.isActive === true
    );
    console.log('Displayed items:', filteredItems);
    return filteredItems;
  }

  onMenuItemClick(itemId: number): void {
    const item = this.menuItems.find((i) => i.id === itemId);
    console.log('Clicked item:', item);
    if (item && item.linked_post === null) {
      const hasChildren = this.menuItems.some((i) => i.parentId === itemId);
      console.log('hasChildren for itemId', itemId, ':', hasChildren);
      if (hasChildren) {
        // Активируем дочерние элементы
        this.menuItems = this.menuItems.map(i =>
          i.parentId === itemId ? { ...i, isActive: true } : i
        );
        this.currentParentId = itemId;
        this.lastClickedMenuItemId = null; // Сбрасываем активную кнопку
        this.selectedPost = null; // Очищаем пост
        this.saveLastClickedItem(itemId);
      }
    } else if (item && (item.linkedPostId || item.linked_post?.id)) {
      // Устанавливаем только кликнутую кнопку как активную
      this.lastClickedMenuItemId = itemId;
      const postId = item.linkedPostId || item.linked_post?.id;
      console.log('Loading post with ID:', postId);
      if (postId) {
        this.loadPost(postId);
        this.saveLastClickedItem(itemId);
      } else {
        console.error('No postId found for item:', item);
        this.errorMessage = 'Не удалось загрузить пост: ID поста отсутствует.';
      }
    }
  }

  loadPost(postId: number): void {
    this.menuService.getPostById(postId).subscribe({
      next: (post) => {
        if (post.buttons?.length) {
          const buttonObservables = post.buttons.map(button =>
            this.menuService.getButtonById(button.id)
          );
          forkJoin(buttonObservables).subscribe({
            next: (buttons: MenuButton[]) => {
              const transformedButtons: MenuPostButton[] = buttons
                .filter(button => button?.id)
                .map(button => ({
                  id: button.id,
                  button: {
                    id: button.id,
                    name: button.name || 'Кнопка',
                    url: button.url || '#',
                    order: button.order || 0
                  }
                }));
              this.selectedPost = { ...post, buttons: transformedButtons };
              console.log('Loaded post with buttons:', this.selectedPost);
            },
            error: (error) => {
              console.error('Ошибка загрузки кнопок:', error);
              this.errorMessage = 'Не удалось загрузить кнопки поста.';
              this.selectedPost = { ...post, buttons: [] };
            }
          });
        } else {
          this.selectedPost = { ...post, buttons: [] };
          console.log('Loaded post without buttons:', this.selectedPost);
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки поста:', error);
        this.errorMessage = 'Не удалось загрузить пост.';
      }
    });
  }

  onBackClick(): void {
    const currentItem = this.menuItems.find(i => i.id === this.currentParentId);
    this.currentParentId = currentItem ? currentItem.parentId : null;
    this.selectedPost = null;
    this.lastClickedMenuItemId = null;
    localStorage.removeItem('lastClickedMenuItemId');
  }

  hasBackButton(): boolean {
    return this.currentParentId !== null;
  }
}