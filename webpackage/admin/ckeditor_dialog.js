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
    Style.apply("button", confirmButton);
    Style.apply("dangerButton", cancelButton);
    Style.apply("modalContent", wrapper);
    Style.apply("modalControls", controls);
    this.options = options || {};
    this.target = options.target;
    this.input = document.createElement("textarea");
    this.input.innerHTML = this.target.innerHTML;
    this.popup.classList.add("ckeditor-dialog");
    this.popup.appendChild(title);
    this.popup.appendChild(wrapper);
    this.popup.appendChild(controls);
    wrapper.appendChild(this.input);
    controls.appendChild(confirmButton);
    controls.appendChild(cancelButton);
    confirmButton.textContent = i18n.t("admin.confirm");
    cancelButton.textContent = i18n.t("admin.cancel");
    confirmButton.addEventListener("click", this.onConfirmed.bind(this));
    cancelButton.addEventListener("click", this.close.bind(this));
  }

  open() {
    const options = this.options.ckeditor || { toolbar: 'compact' };

    super.open();
    adminCKEditor(this.input, options).then(editor => {
      this.editor = editor;
      this.lastData = this.editor.getData();
    });
  }

  close() {
    if (this.lastData != this.editor.getData()) {
      if (!window.confirm(i18n.t("admin.confirm-cancel-changes")))
        return ;
    }
    super.close();
  }

  onConfirmed() {
    if (this.editor) {
      this.target.innerHTML = this.target.value = this.lastData = this.editor.getData();
      this.target.dispatchEvent(new Event("change"));
      this.close();
    }
  }
}

export function adminCKEditorButton(element, options = {}) {
  const button = document.createElement("div");
  const hint = document.createElement("div");
  const preview = document.createElement("div");
  const updateValue = function() { preview.innerHTML = element.value; };

  button.classList.add("cms-ckeditor-button");
  button.appendChild(hint);
  button.appendChild(preview);
  preview.classList.add("preview");
  preview.innerHTML = element.innerHTML;
  element.style.display = "none";
  element.parentNode.insertBefore(button, element.nextSibling);
  i18n.ready.then(function() {
    hint.classList.add("hint");
    hint.textContent = i18n.t("admin.ckeditor-dialog-button");
  });
  button.addEventListener("click", function() {
    const dialog = new CKEditorDialog({
      title: options.title,
      target: element,
      ckeditor: options
    });

    dialog.open();
  });
  element.addEventListener("change", updateValue);
  updateValue();
}
