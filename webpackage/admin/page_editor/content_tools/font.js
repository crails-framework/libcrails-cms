import i18n from "../../../i18n.js";
import Style from "../../../style.js";
import CmsDialog from "../../dialog.js";

function makeFormGroup(name, input) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");

  Style.apply("formGroup", wrapper);
  label.textContent = i18n.t(`admin.page-editor.properties.${name}`);
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

function makeFontFamilyInput(dialog) {
  const input = document.createElement("select");
  const emptyOption = document.createElement("option");

  dialog.fontInput = input;
  input.appendChild(emptyOption);
  (PageEditor.fonts || []).forEach(font => {
    const option = document.createElement("option");

    option.value = font;
    option.textContent = font;
    if (dialog.element.style.fontFamily == font)
      option.checked = true;
    input.appendChild(option);
  });
  input.value = dialog.element.style.fontFamily;
  input.addEventListener("change", dialog.updatePreview.bind(dialog));
  return makeFormGroup("font", input);
}

function makeFontSizeInput(dialog) {
  const input = document.createElement("input");

  dialog.sizeInput = input;
  input.type = "number";
  input.value = parseFloat(dialog.element.style.fontSize);
  input.addEventListener("change", dialog.updatePreview.bind(dialog));
  return makeFormGroup("size", input);
}

function makeFontColorInput(dialog) {
  const input = document.createElement("input");

  dialog.colorInput = input;
  input.type = "color";
  input.value = dialog.element.style.color;
  input.addEventListener("change", dialog.updatePreview.bind(dialog));
  Style.apply("button", input);
  return makeFormGroup("color", input);
}

class FontDialog extends CmsDialog {
  constructor(element) {
    const title = document.createElement("div");
    const confirmButton = document.createElement("button");
    const preview = document.createElement("div");
    const content = document.createElement("div");
    const controls = document.createElement("div");

    Style.apply("modalContent", content);
    Style.apply("modalControls", controls);
    Style.apply("confirmButton", confirmButton);
    preview.textContent = "The quick brown fox jumps over a lazy dog.";
    content.appendChild(title);
    controls.appendChild(confirmButton);
    super();
    window.labite = this;
    this.element = element;
    this.previewElement = preview;
    this.popup.appendChild(content);
    this.popup.appendChild(controls);
    Style.apply("form", this.popup);
    title.classList.add("popup-title");
    title.textContent = i18n.t("admin.page-editor.font-editor");
    confirmButton.textContent = i18n.t("admin.confirm");
    content.appendChild(makeFontFamilyInput(this));
    content.appendChild(makeFontSizeInput(this));
    content.appendChild(makeFontColorInput(this));
    content.appendChild(preview);
    confirmButton.addEventListener("click", this.accepted.bind(this));
  }

  open() {
    super.open();
    if (typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(this.popup);
    this.updatePreview();
  }

  accepted() {
    this.applyStyleOnElement(this.element);
    this.close();
    this.onAccepted();
  }

  abort() {
    this.close();
    this.onAborted();
  }

  updatePreview() {
    this.applyStyleOnElement(this.previewElement);
  }

  applyStyleOnElement(target) {
    target.style.fontSize   = `${this.sizeInput.value}px`;
    target.style.color      = this.colorInput.value;
    target.style.fontFamily = this.fontInput.querySelector(":scope > :checked").value
  }
}

export default function(iframe) {
  const ContentTools = iframe.contentWindow.Cms.ContentTools;
  return class extends ContentTools.Tool {
    constructor() {
      super();
      this.icon = "font-size";
      this.label = "Fonts";
      ContentTools.ToolShelf.stow(this, "fonts");
      ContentTools.DEFAULT_TOOLS[0].push("fonts");
    }

    canApply(element, selection) {
      return element != null;
    }

    isApplied(element, selection) {
      if (element)
        return element._domElement.style.fontFamily.length > 0;
      return false;
    }

    apply(element, selection, callback) {
      const dialog = new FontDialog(element._domElement);

      dialog.onAccepted = function() { callback(true); };
      dialog.onAborted = function() { callback(false); };
      dialog.open();
    }
  };
}
