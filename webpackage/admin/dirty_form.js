import DirtyForm from "dirty-form";

export default class extends DirtyForm {
  constructor(element) {
    super(element);
    element.addEventListener("submit", this.disconnect.bind(this));
  }

  setFormHandlers() {
    super.setFormHandlers();
    if (window.ckeditors)
      this.setCkeditorHandlers();
  }

  setCkeditorHandlers() {
    window.ckeditors.forEach(ckeditor => {
      ckeditor.model.document.on("change:data", () => {
        this.isDirty = true;
      });
    });
  }
}
