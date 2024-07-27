import {ControlMenu, Action} from "./controls.js";
import PropertyEditor from "./property_editor.js";
import i18n from "../../i18n.js";

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
    this.addAction(new Action("move", this.startMove.bind(this)));
    this.addAction(new Action("up", this.moveUp.bind(this)));
    this.addAction(new Action("down", this.moveDown.bind(this)));
    this.addAction(new Action("remove", this.remove.bind(this)));
  }

  startMove() {
    const anchorsController = this.componentEditor.layout.anchors;
    anchorsController.target = this.componentEditor;
    anchorsController.enable('insert');
  }

  moveUp() {
    this.componentEditor.parent.moveUp(this.componentEditor);
  }

  moveDown() {
    this.componentEditor.parent.moveDown(this.componentEditor);
  }

  remove() {
    if (confirm(i18n.t("admin.page-editor.confirm-component-delete"))) {
      this.componentEditor.parent.removeComponent(this.componentEditor);
    }
  }
}

