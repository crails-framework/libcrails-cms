import ComponentEditor from "./component_editor.js";

export default class extends ComponentEditor {
  constructor(layout) {
    super(null, document.createElement("div"));
    delete this.root;
    this._layout = layout;
  }

  get layout() {
    return this._layout;
  }

  get document() {
    return this.layout.document;
  }

  get componentType() {
    return "settings";
  }
}
