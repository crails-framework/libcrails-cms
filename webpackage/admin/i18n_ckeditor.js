function listenToLocaleChangeFromInputController(controller, callback) {
  const backup = controller.setCurrentLocale.bind(controller);

  controller.setCurrentLocale = function(locale) {
    backup(locale);
    callback(locale);
  };
}

export default class CKEditorController {
  constructor(editor) {
    editor.realSourceElement = editor.sourceElement;
    editor.sourceElement = document.createElement("textarea");
    this.editor = editor;
    editor.model.document.on('change:data', this.onChanged.bind(this));
    listenToLocaleChangeFromInputController(this.localeController, this.onLocaleChanged.bind(this));
    this.onLocaleChanged();
  }

  get localeController() {
    return this.editor.realSourceElement.$localeController;
  }

  get input() {
    return this.localeController.currentInput;
  }

  onChanged() {
    this.input.value = this.editor.getData();
  }

  onLocaleChanged() {
    if (this.input) {
      this.editor.setData(this.localeController.currentInput.value);
      this.input.el.style.display = "none";
    }
  }
}

