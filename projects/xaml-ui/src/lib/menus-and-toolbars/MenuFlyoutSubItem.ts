import { Component, ElementRef, HostBinding, HostListener, Input, ViewChild, inject } from "@angular/core";
import { MenuFlyoutComponent } from "./MenuFlyout";
import { ISubMenuOwner, MenuFlyoutItemBase, MenuFlyoutItemHost, SubMenuTracker } from "./MenuFlyoutItemBase";

// A menu item that opens a cascading submenu with its content items, like WinUI's MenuFlyoutSubItem.
// Hovering opens the submenu at once; entering any sibling item closes it; invoking an item in it closes
// the whole menu.
@Component({
  selector: 'MenuFlyoutSubItem',
  imports: [MenuFlyoutComponent],
  template: `<div class="icon">{{Icon}}<ng-content select="[Icon]"/></div>
  <div class="text">{{Text}}</div>
  <div class="submenu-indicator">
    <span class="chevron"></span>
    <MenuFlyout Placement="RightEdgeAlignedTop" [HasBackdrop]="false" [Target]="_hostElement"><ng-content/></MenuFlyout>
  </div>`,
  styleUrl: 'MenuFlyoutItem.scss',
  providers: [{ provide: MenuFlyoutItemHost, useExisting: MenuFlyoutSubItemComponent }]
})
export class MenuFlyoutSubItemComponent extends MenuFlyoutItemBase implements MenuFlyoutItemHost, ISubMenuOwner {
  @Input() IsEnabled = true;
  @Input() Text = '';
  @Input() Icon?: string;

  readonly SubMenus = new SubMenuTracker();
  readonly IsSubMenuOwner = true;

  protected readonly _hostElement = inject(ElementRef);

  @ViewChild(MenuFlyoutComponent) private _menu?: MenuFlyoutComponent;

  @HostBinding('class.disabled')
  private get disabled() {
    return !this.IsEnabled;
  }

  // Keeps the row highlighted while its submenu is showing.
  @HostBinding('class.submenu-open')
  private get isSubMenuOpen() {
    return this._menu?.IsOpen === true;
  }

  protected override onPointerEnter() {
    super.onPointerEnter();
    this.OpenSubMenu();
  }

  // Clicking the row opens its submenu but must not reach the parent menu, which closes on any click.
  @HostListener('click', ['$event'])
  private onClick(event: Event) {
    event.stopPropagation();
    this.OpenSubMenu();
  }

  OpenSubMenu() {
    if (!this.IsEnabled || !this._menu) return;

    this._parentHost?.SubMenus.Opened(this);
    this._menu.Show();
  }

  CloseSubMenu() {
    this.SubMenus.CloseAll();
    this._menu?.Hide();
  }

  CloseMenu() {
    this.CloseSubMenu();
    this._parentHost?.CloseMenu();
  }
}
