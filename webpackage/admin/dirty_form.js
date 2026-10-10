import DirtyForm from "dirty-form";
import i18n from '../i18n.js';

const dirtyClassName = "dirty-form";

export default class extends DirtyForm {
  constructor(element) {
    super(element, {
      message: i18n.t("admin.dirty-form-confirm"),
      onDirty: () => { document.body.classList.add(dirtyClassName); },
      onClean: () => { document.body.classList.remove(dirtyClassName); }
    });
    element.addEventListener("submit", this.disconnect.bind(this));
    setTimeout(this.setCkeditorHandlers.bind(this), 1234);
  }

  setCkeditorHandlers() {
    if (window.ckeditors) {
      window.ckeditors.forEach(ckeditor => {
        ckeditor.model.document.on("change:data", () => {
          this.markAsDirty();
        });
      });
    }
  }
}
