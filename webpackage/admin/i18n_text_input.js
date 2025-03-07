import I18nCKEditorController from "./i18n_ckeditor.js";

function updateData(data, input) {
  data[input.locale] = input.value;
  return data;
}

function copyDataset(source, target) {
  for (let key in source.dataset) {
    if (["localized"].indexOf(key) < 0) {
      target.dataset[key] = source.dataset[key];
    }
  }
}

class LocalizedInput {
  constructor(controller, locale) {
    this.locale = locale;
    this.el = controller.input.ownerDocument.createElement(controller.input.tagName);
    if (this.el.tagName == "INPUT") this.el.type = "text";
    this.el.className = controller.input.className;
    this.el.value = controller.data[locale] ? controller.data[locale] : '';
    copyDataset(controller.input, this.el);
  }

  addChangeListener(callback) {
    ["keyup", "change"].forEach(event => this.el.addEventListener(event, callback));
  }

  get value() {
    return this.el.value;
  }

  set value(v) {
    const event = new Event("change");

    this.el.value = v;
    this.el.dispatchEvent(event);
  }
}

class LocalizedInputController {
  constructor(manager, input) {
    this.manager = manager;
    this.input = input;
    if (input.tagName == "INPUT")
      input.type = "hidden";
    else
      input.style.display = "none";
  }

  get container() {
    return this.input.parentElement;
  }

  get data() {
    try {
      return JSON.parse(this.input.value);
    } catch (err) {
      console.error("LocalizedInput could not parse data:", err);
      return {};
    }
  }

  set data(value) {
    this.input.value = JSON.stringify(value);
    if (this.currentInput && this.currentInput.value != value[this.currentInput.locale])
      this.currentInput.value = value[this.currentInput.locale];
  }

  setCurrentLocale(locale) {
    if (!this.currentInput || this.currentInput.locale != locale) {
      const input = new LocalizedInput(this, locale);

      input.addChangeListener(() => {
        this.data = updateData(this.data, input);
      });
      this.emplaceInput(input);
    }
  }

  emplaceInput(input) {
    crailscms_on_content_unload(this.container);
    if (this.currentInput)
      this.container.removeChild(this.currentInput.el);
    this.currentInput = input;
    this.container.insertBefore(input.el, this.input.nextElementSibling);
    crailscms_on_content_loaded(this.container);
  }
}

class LocalizedInputManager {
  constructor(root) {
    this.root = root;
    this.inputs = [];
    this.observer = new MutationObserver(this.initializeNewInputs.bind(this));
    this.observer.observe(root, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ["data-localized"]
    });
  }

  get localizedInputs() {
    return Array.from(this.root.querySelectorAll("input[data-localized='1'], textarea[data-localized='1']"));
  }

  get unhandledInputs() {
    return this.localizedInputs.filter(input => this.inputs.indexOf(input) < 0);
  }

  initializeNewInputs() {
    this.unhandledInputs.forEach(input => {
      this.inputs.push(input);
      input.$localeController = new LocalizedInputController(this, input);
      if (input.$ckeditor)
        input.$ckeditor.i18nController = new I18nCKEditorController(input.$ckeditor);
    });
    this.onInputsChanged();
  }

  setCurrentLocale(locale) {
    this.inputs.forEach(input => input.$localeController.setCurrentLocale(locale));
  }

  onInputsChanged() {
  }
}

export default function initialize() {
  const manager = new LocalizedInputManager(document.body);

  manager.initializeNewInputs();
  return manager;
}
