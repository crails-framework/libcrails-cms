import DirtyForm from "dirty-form";

export default class extends DirtyForm {
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
