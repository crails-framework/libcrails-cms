import Dialog from "./dialog.js";
import Style from "../style.js";
import i18n from "../i18n.js";
import {adminCKEditor} from "./ckeditor.js";

export default class CKEditorDialog extends Dialog {
  constructor(options = {}) {
    const title = document.createElement("div");
    const wrapper = document.createElement("div");
    const controls = document.createElement("div");
    const confirmButton = document.createElement("button");
    const cancelButton = document.createElement("button");

    super();
    title.classList.add("popup-title");
    title.textContent = options.title;
    Style.apply("button", confirmButton, cancelButton);
    Style.apply("modalContent", wrapper);
    Style.apply("modalControls", controls);
    this.target = options.target;
    this.options = options.ckeditor || {};
    this.input = document.createElement("textarea");
    this.input.innerHTML = this.target.innerHTML;
    this.popup.appendChild(title);
    this.popup.appendChild(wrapper);
    this.popup.appendChild(controls);
    wrapper.appendChild(this.input);
    confirmButton.addEventListener("click", this.onConfirmed.bind(this));
    cancelButton.addEventListener("click", this.close.bind(this));
  }

  open() {
    adminCKEditor(this.input, this.options).then(editor => {
      this.editor = editor;
      super.open();
    });
  }

  close() {
    if (this.target.innerHTML != this.editor.getData()) {
      if (!window.confirm(i18n.t("admin.confirm-cancel-changes")))
        return ;
    }
    super.close();
  }

  onConfirmed() {
    if (this.editor) {
      this.target.innerHTML = this.editor.getData();
      this.close();
    }
  }
}

export function adminCKEditorButton(element, options = {}) {
  const button = document.createElement("div");

  button.textContent = "placeholder for editable text block preview/button";
  element.style.display = "none";
  element.parentNode.insertBefore(button, element.nextSibling);
  button.addEventListener("click", function() {
    const dialog = new CKEditorDialog({
      title: options.title,
      target: element,
      ckeditor: options
    });
    dialog.open();
  });
}
