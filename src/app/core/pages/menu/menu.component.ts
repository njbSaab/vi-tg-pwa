import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-items';
import { MenuPost } from '../../models/post';
import { MenuPostButton } from '../../models/post-buttons';
import { ApiService } from '../../services/api.service';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: false,
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  currentParentId: number | null = null;
  errorMessage: string | null = null;
  lastClickedMenuItemId: number | null = null;
  posts: MenuPost[] = [];
  nameUser: string | null = null;
  email: string | null = null;
  isLoading = false;
  isLoadingNext = false;
  showSurvey = false;
  showNewsPopup = false;
  news: News[] = [];
  greetings: { text: string, image_url?: string, title_for_client?: string, greeting_text?: string }[] = [];
  private loadedPostIds: Set<number> = new Set();
  private postCache = new Map<number, MenuPost>();
  private selectedCategories: number[] = [];

  constructor(
    private menuService: MenuService,
    private apiService: ApiService,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.getUsersTitles();
    this.loadGreetings();
    this.loadMenuItems();
    this.loadLastClickedPost();
  }

  getUsersTitles(): void {
    this.nameUser = localStorage.getItem('firstName');
    this.email = localStorage.getItem('email');
  }

  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
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
          console.log('Loading last clicked post with ID:', postId);
          this.loadPost(postId);
        } else {
          console.warn('No postId found for last clicked item ID:', itemId);
        }
      } else {
        console.warn('No item found for lastClickedMenuItemId:', savedLastClickedId);
      }
    } else {
      console.log('No lastClickedMenuItemId in localStorage');
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
    if (!item) {
      console.warn('No item found for itemId:', itemId);
      return;
    }
    if (item.linked_post === null) {
      const hasChildren = this.menuItems.some((i) => i.parentId === itemId);
      console.log('hasChildren for itemId', itemId, ':', hasChildren);
      if (hasChildren) {
        this.menuItems = this.menuItems.map(i =>
          i.parentId === itemId ? { ...i, isActive: true } : i
        );
        this.currentParentId = itemId;
        this.lastClickedMenuItemId = null;
        this.posts = [];
        this.loadedPostIds.clear();
        this.postCache.clear();
        this.showSurvey = false;
        this.showNewsPopup = false;
        this.news = [];
        this.saveLastClickedItem(itemId);
      }
    } else if (item.linkedPostId || item.linked_post?.id) {
      this.lastClickedMenuItemId = itemId;
      const postId = item.linkedPostId || item.linked_post?.id;
      console.log('Loading post with ID:', postId);
      if (postId) {
        this.loadedPostIds.clear();
        this.posts = [];
        this.postCache.clear();
        this.showSurvey = false;
        this.showNewsPopup = false;
        this.news = [];
        this.loadPost(postId);
        this.saveLastClickedItem(itemId);
      } else {
        console.error('No postId found for item:', item);
        this.errorMessage = 'Не удалось загрузить пост: ID поста отсутствует.';
      }
    }
  }

  onButtonClick(button: MenuPostButton, event: Event): void {
    console.log('Button clicked:', button);
    if (button.button.url && button.button.url !== '#') {
      console.log(`Navigating to URL: ${button.button.url}`);
      // Переход по ссылке осуществляется через <a> в шаблоне
    } else if (button.button.postId === 11 && button.button.categorySportId === 0 && button.button.url === null) {
      event.preventDefault();
      console.log('Directly loading news for postId 11, categorySportId 0');
      this.loadNewsDirectly(); // Загружаем новости напрямую
    } else if (button.button.postId === 11 && button.button.categorySportId === null && button.button.url === null) {
      event.preventDefault();
      console.log('Showing survey for postId 11');
      this.showSurvey = true;
      this.posts = [];
      this.loadedPostIds.clear();
      this.postCache.clear();
      this.showNewsPopup = false;
      this.news = [];
    } else if (button.button.categorySportId === null && button.button.url === null && button.button.postId) {
      event.preventDefault();
      console.log(`Loading post with ID: ${button.button.postId}`);
      this.showSurvey = false;
      this.showNewsPopup = false;
      this.news = [];
      this.loadedPostIds.clear();
      this.posts = [];
      this.postCache.clear();
      this.loadPost(button.button.postId);
    } else if (button.button.linkedPostId) {
      event.preventDefault();
      console.log(`Loading post with ID: ${button.button.linkedPostId}`);
      this.showSurvey = false;
      this.showNewsPopup = false;
      this.news = [];
      this.loadedPostIds.clear();
      this.posts = [];
      this.postCache.clear();
      this.loadPost(button.button.linkedPostId);
    } else {
      console.warn('No valid URL, linkedPostId, or postId for button:', button);
      event.preventDefault();
    }
  }

  loadPost(postId: number, isNextPost: boolean = false): void {
    if (this.loadedPostIds.has(postId)) {
      console.warn(`Post ID ${postId} already loaded, skipping to avoid loop`);
      return;
    }

    const cachedPost = this.postCache.get(postId);
    if (cachedPost) {
      this.posts = isNextPost ? [...this.posts, cachedPost] : [cachedPost];
      if (isNextPost) {
        this.isLoadingNext = false;
      } else {
        this.isLoading = false;
      }
      console.log('Loaded post from cache:', cachedPost);
      if (typeof cachedPost.nextPostId === 'number') {
        const nextId = cachedPost.nextPostId;
        setTimeout(() => {
          console.log(`Attempting to load next post ID: ${nextId}`);
          this.loadPost(nextId, true);
        }, 500);
      }
      return;
    }

    this.loadedPostIds.add(postId);
    if (isNextPost) {
      this.isLoadingNext = true;
    } else {
      this.isLoading = true;
    }
    console.log(`Starting loadPost for ID: ${postId}, isNextPost: ${isNextPost}`);

    this.menuService.getPostById(postId).subscribe({
      next: (post) => {
        console.log('Received post:', post);
        const transformedButtons: MenuPostButton[] = (post.buttons || []).map(button => ({
          id: button.id,
          buttonId: button.button.id,
          button: {
            id: button.button.id,
            name: button.button.name || 'Кнопка',
            url: button.button.url || null,
            order: button.button.order || 0,
            type: button.button.type,
            created_at: button.button.created_at,
            updated_at: button.button.updated_at,
            title_for_client: button.button.title_for_client,
            categorySportId: button.button.categorySportId,
            postId: button.button.postId,
            linkedPostId: button.button.linkedPostId
          }
        }));
        const newPost = { ...post, buttons: transformedButtons };
        this.postCache.set(postId, newPost);
        this.posts = isNextPost ? [...this.posts, newPost] : [newPost];
        if (isNextPost) {
          this.isLoadingNext = false;
        } else {
          this.isLoading = false;
        }
        console.log('Loaded post with buttons:', this.posts);

        if (typeof post.nextPostId === 'number') {
          console.log(`Found nextPostId: ${post.nextPostId}, scheduling load`);
          const nextId = post.nextPostId;
          setTimeout(() => {
            console.log(`Attempting to load next post ID: ${nextId}`);
            this.loadPost(nextId, true);
          }, 500);
        } else {
          console.log(`No nextPostId for post ID: ${postId}`);
        }
      },
      error: (error) => {
        console.error(`Ошибка загрузки поста ID ${postId}:`, error);
        this.errorMessage = `Не удалось загрузить пост (ID: ${postId}).`;
        if (isNextPost) {
          this.isLoadingNext = false;
        } else {
          this.isLoading = false;
        }
        console.log('Error loading post, no nextPostId check performed');
      }
    });
  }

  onBackClick(): void {
    const currentItem = this.menuItems.find(i => i.id === this.currentParentId);
    this.currentParentId = currentItem?.parentId || null;
    this.posts = [];
    this.lastClickedMenuItemId = null;
    this.loadedPostIds.clear();
    this.postCache.clear();
    this.showSurvey = false;
    this.showNewsPopup = false;
    this.news = [];
    localStorage.removeItem('lastClickedMenuItemId');
    console.log('Back clicked, cleared posts, cache, and lastClickedMenuItemId');
  }

  hasBackButton(): boolean {
    return this.currentParentId !== null;
  }

  onSurveySubmitted(selectedCategories: number[]): void {
    this.showSurvey = false;
    this.showNewsPopup = true;
    this.selectedCategories = selectedCategories;
    console.log('Survey submitted with categories:', selectedCategories);
  }

  confirmNewsSubscription(confirm: boolean): void {
    if (confirm) {
      this.isLoading = true;
      this.newsService.getFilteredNews(this.selectedCategories).subscribe({
        next: (news) => {
          this.news = news;
          this.isLoading = false;
          console.log('Loaded filtered news:', news);
        },
        error: (error) => {
          console.error('Ошибка загрузки новостей:', error);
          this.errorMessage = 'Не удалось загрузить новости.';
          this.isLoading = false;
        }
      });
    }
    this.showNewsPopup = false;
  }

  private loadNewsDirectly(): void {
    const savedData = localStorage.getItem('myApp_userPreferences');
    let selectedCategories: number[] = [];
    if (savedData) {
      const preferences = JSON.parse(savedData);
      selectedCategories = preferences.selectedCategories || [];
      console.log('Loaded categories from localStorage for news:', selectedCategories);
    } else {
      console.warn('No user preferences found in localStorage');
      this.errorMessage = 'Нет сохраненных категорий для загрузки новостей.';
      return;
    }

    this.isLoading = true;
    this.posts = []; // Очищаем посты
    this.loadedPostIds.clear();
    this.postCache.clear();
    this.showSurvey = false;
    this.showNewsPopup = false;
    this.newsService.getFilteredNews(selectedCategories).subscribe({
      next: (news) => {
        this.news = news;
        this.isLoading = false;
        console.log('Directly loaded filtered news:', news);
      },
      error: (error) => {
        console.error('Ошибка загрузки новостей:', error);
        this.errorMessage = 'Не удалось загрузить новости.';
        this.isLoading = false;
      }
    });
  }
}