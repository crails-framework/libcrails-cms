import * as Turbo from "@hotwired/turbo";
import i18n from "../i18n.js";

// Drives the widget rendered by Crails::Cms::render_version_picker.
// Picking a version reloads the editor with that version loaded. Nothing is
// saved: the live version only changes when the form is submitted.
export default class VersionPicker {
  constructor(root) {
    this.root = root;
    this.select = root.querySelector("[data-version-picker-select]");
    this.initialValue = this.select.value;
    this.select.addEventListener("change", () => this.onChange());
    this.deleteButton = root.querySelector("[data-version-picker-delete]");
    if (this.deleteButton)
      this.deleteButton.addEventListener("click", () => this.onDelete());
  }

  onDelete() {
    if (window.confirm(i18n.t("admin.versions.confirm-delete")))
      this.destroy(this.select.value);
  }

  // Removes a version, then goes back to the editor on the live version
  destroy(number) {
    const token = document.querySelector("[name='csrf-token']");
    const query = token ? `?csrf-token=${encodeURIComponent(token.value)}` : "";
    const url = `${this.root.dataset.route}/${encodeURIComponent(number)}${query}`;

    // redirect: "manual" so the flash message is still there for the page we reload
    fetch(url, { method: "DELETE", redirect: "manual", headers: { "Accept": "text/html" } }).then(() => {
      if (window.mainFormWatcher)
        window.mainFormWatcher.isDirty = false;
      this.load(null);
    });
  }

  onChange() {
    if (this.confirmDiscardChanges())
      this.load(this.select.value);
    else
      this.select.value = this.initialValue;
  }

  confirmDiscardChanges() {
    const watcher = window.mainFormWatcher;

    if (watcher && watcher.isDirty) {
      if (!window.confirm(i18n.t("admin.versions.discard-changes")))
        return false;
      watcher.isDirty = false; // we asked already, avoid the browser's own prompt
    }
    return true;
  }

  load(number) {
    const url = new URL(window.location.href);

    if (number === null)
      url.searchParams.delete("version");
    else
      url.searchParams.set("version", number);
    Turbo.visit(url.toString());
  }

  static loadFromElements(selector) {
    return Array.from(document.querySelectorAll(selector)).map(element => new VersionPicker(element));
  }
}
