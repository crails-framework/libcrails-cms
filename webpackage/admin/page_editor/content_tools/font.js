import i18n from "../../../i18n.js";
import Style from "../../../style.js";
import CmsDialog from "../../dialog.js";

function cssRgbToHex(value) {
  const matches = value && value.match(/rgb\(([0-9]+),\s*([0-9]+),\s*([0-9]+)\)/);
  if (matches) {
    const r = parseInt(matches[1]).toString(16).padStart(2, '0');
    const g = parseInt(matches[2]).toString(16).padStart(2, '0');
    const b = parseInt(matches[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '';
}

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
  if (!PageEditor.fonts?.length) return document.createElement("span");
  const input = document.createElement("select");
  const emptyOption = document.createElement("option");
  let selectedOption;

  dialog.fontInput = input;
  emptyOption.textContent = i18n.t("admin.page-editor.font-default");
  input.appendChild(emptyOption);
  (PageEditor.fonts || []).forEach(font => {
    const option = document.createElement("option");

    option.value = font;
    option.textContent = font;
    if (dialog.element.style.fontFamily.match(`^"?${font}"?$`, "i")) {
      option.checked = true;
      selectedOption = option;
    }
    input.appendChild(option);
  });
  input.value = selectedOption?.value;
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
  const checkbox = document.createElement("input");
  const wrapper = document.createElement("div");
  let colorGroup, checkboxGroup;

  dialog.colorInput = input;
  dialog.colorCheckbox = checkbox;
  input.type = "color";
  input.value = cssRgbToHex(dialog.element.style.color);
  input.addEventListener("change", dialog.updatePreview.bind(dialog));
  Style.apply("button", input);
  checkbox.type = "checkbox";
  checkbox.checked = dialog.element.style.color;
  checkbox.addEventListener("change", function() {
    input.value = '';
    dialog.updatePreview();
  });
  colorGroup = makeFormGroup("color", input);
  checkboxGroup = makeFormGroup("withColor", checkbox);
  wrapper.appendChild(checkboxGroup);
  wrapper.appendChild(colorGroup);
  return wrapper;
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
    this.initialStyle = getComputedStyle(this.element);
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
    if (!this.selectedFont)
      this.previewElement.style.fontFamily = this.initialStyle.fontFamily;
  }

  applyStyleOnElement(target) {
    const size = parseInt(this.sizeInput.value);
    const font = this.selectedFont;
    const hasColor = this.colorCheckbox.checked;

    this.setStyle(target, "fontSize", !isNaN(size) ? `${size}px` : null);
    this.setStyle(target, "fontFamily", font ? font : null);
    this.setStyle(target, "color", hasColor ? this.colorInput.value : null);
  }

  setStyle(target, property, value) {
    if (value !== null)
      target.style[property] = value;
    else
      target.style[property] = '';
  }

  get selectedFont() {
    return this.fontInput ? this.fontInput.querySelector(":scope > :checked")?.value : '';
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
        return element.domElement().attributes?.style?.value?.length > 0;
      return false;
    }

    apply(element, selection, callback) {
      const dialog = new FontDialog(element.domElement());

      window.lacrosse = element;
      dialog.onAccepted = function() {
        element.attr("style", element.domElement().attributes.style.value);
        callback(true);
      };
      dialog.onAborted = function() { callback(false); };
      dialog.open();
    }
  };
}
