function listenToLocaleChangeFromInputController(controller, callback) {
  const backup = controller.setCurrentLocale.bind(controller);

  controller.setCurrentLocale = function(locale) {
    backup(locale);
    callback(locale);
  };
}

export default class CKEditorController {
  constructor(editor) {
    this.editor = editor;
    editor.model.document.on('change:data', this.onChanged.bind(this));
    listenToLocaleChangeFromInputController(this.localeController, this.onLocaleChanged.bind(this));
    this.onLocaleChanged();
  }

  get localeController() {
    return this.editor.sourceElement.$localeController;
  }

  get input() {
    return this.localeController.currentInput;
  }

  onChanged() {
    const event = new Event("change");

    this.input.value = this.editor.getData();
    this.input.dispatchEvent(event);
  }

  onLocaleChanged() {
    if (this.input) {
      this.editor.setData(this.localeController.currentInput.value);
      this.input.el.style.display = "none";
    }
  }
}

