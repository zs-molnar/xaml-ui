import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlyoutComponent } from "../dialogs-and-flyouts/Flyout";
import { FlyoutPresenter, FlyoutPresenterAnimation } from "../primitives/FlyoutPresenter";
import { PopupTemplate } from "../primitives/FlyoutBase";
import { OverlayRef } from "@angular/cdk/overlay";
import { XamlRootComponent } from "../XamlRoot";
import { MenuFlyoutItemHost, SubMenuTracker } from "./MenuFlyoutItemBase";

@Component({
  selector: 'MenuFlyout',
  imports: [CommonModule, FlyoutPresenter, XamlRootComponent],
  template: PopupTemplate,
  styleUrls: ['MenuFlyout.scss'],
  providers: [
    { provide: 'xaml-flyout', useExisting: MenuFlyoutComponent },
    { provide: MenuFlyoutItemHost, useExisting: MenuFlyoutComponent }
  ]
})
export class MenuFlyoutComponent extends FlyoutComponent implements MenuFlyoutItemHost {

  readonly SubMenus = new SubMenuTracker();
  readonly IsSubMenuOwner = false;

  // The MenuFlyoutSubItem this menu is the submenu of, if any.
  private readonly _owner = inject(MenuFlyoutItemHost, { optional: true, skipSelf: true });

  private _menuClickSubscription?: () => void;

  // A closing menu takes its open submenu with it, instead of leaving it up during the fade-out.
  private readonly _openChangeSubscription = this.IsOpenChange.subscribe(open => {
    if (!open) this.SubMenus.CloseAll();
  });

  private get isSubMenu() {
    return this._owner?.IsSubMenuOwner === true;
  }

  // Submenus open and close instantly, so moving across a menu never leaves fading panes behind.
  protected override get transitionAnimation(): FlyoutPresenterAnimation {
    return this.isSubMenu ? 'None' : 'Default';
  }

  protected override OnOverlay(overlay: OverlayRef): void {
    if (this._menuClickSubscription) this._menuClickSubscription();

    this._menuClickSubscription = this._renderer.listen(overlay.overlayElement, 'click', p => this.onMenuClick(p));
  }

  CloseMenu() {
    this.Hide();
  }

  private onMenuClick(event: Event) {
    this.IsOpen = false;
    if (this.isSubMenu) this._owner!.CloseMenu();
    event.stopPropagation();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this._menuClickSubscription) this._menuClickSubscription();
    this._openChangeSubscription.unsubscribe();
  }
}
