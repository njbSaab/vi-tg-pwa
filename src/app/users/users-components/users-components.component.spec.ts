import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponentsComponent } from './users-components.component';

describe('UsersComponentsComponent', () => {
  let component: UsersComponentsComponent;
  let fixture: ComponentFixture<UsersComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersComponentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
