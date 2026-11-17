import { Directive, HostListener, inject } from "@angular/core";

// An item whose submenu can be closed by its host when another item of the same menu takes over.
export interface ISubMenuOwner {
  CloseSubMenu(): void;
}

// Keeps at most one submenu open per menu level, as in WinUI: entering any other item of the
// same level closes the open submenu at once.
export class SubMenuTracker {
  private _open?: ISubMenuOwner;

  PointerEntered(item: object) {
    if (this._open && this._open !== item) this.CloseAll();
  }

  Opened(item: ISubMenuOwner) {
    this.PointerEntered(item);
    this._open = item;
  }

  CloseAll() {
    const open = this._open;
    this._open = undefined;
    open?.CloseSubMenu();
  }
}

// Whatever directly contains menu items: a MenuFlyout, or a MenuFlyoutSubItem for the items of its submenu.
export abstract class MenuFlyoutItemHost {
  abstract readonly SubMenus: SubMenuTracker;

  // True for a MenuFlyoutSubItem, whose MenuFlyout is a submenu rather than a root menu.
  abstract readonly IsSubMenuOwner: boolean;

  // An item was invoked somewhere in this menu chain: close up to the root menu.
  abstract CloseMenu(): void;
}

@Directive()
export abstract class MenuFlyoutItemBase {
  protected readonly _parentHost = inject(MenuFlyoutItemHost, { optional: true, skipSelf: true });

  @HostListener('pointerenter')
  protected onPointerEnter() {
    this._parentHost?.SubMenus.PointerEntered(this);
  }
}
