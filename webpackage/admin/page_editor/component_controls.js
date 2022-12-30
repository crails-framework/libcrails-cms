import {ControlMenu, Action} from "./controls.js";
import PropertyEditor from "./property_editor.js";

export default class extends ControlMenu {
  constructor(componentEditor) {
    super();
    this.componentEditor = componentEditor;
  }

  get hasProperties() {
    return Object.keys(this.componentEditor.properties).length > 0;
  }

  initializeActions() {
    this.clear();
    this.addAction(new Action("up", this.moveUp.bind(this)));
    this.addAction(new Action("down", this.moveDown.bind(this)));
    if (this.hasProperties)
      this.addAction(new Action("settings", this.settings.bind(this)));
    this.addAction(new Action("remove", this.remove.bind(this)));
  }

  moveUp() {
    this.componentEditor.parent.moveUp(this.componentEditor);
  }

  moveDown() {
    this.componentEditor.parent.moveDown(this.componentEditor);
  }

  settings() {
    new PropertyEditor(this.componentEditor);
  }

  remove() {
    this.componentEditor.parent.removeComponent(this.componentEditor);
  }
}

