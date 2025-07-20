import {ControlMenu, Action} from "./controls.js";
import i18n from "../../i18n.js";
import {ComponentRemovalAction, ComponentSwapAction} from "./actions.js";

export default class extends ControlMenu {
  constructor(component) {
    super();
    this.componentEditor = component;
    this.name = component.componentName;
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
    const parent = this.componentEditor.parent;
    const action = new ComponentSwapAction(this.componentEditor, 'up');
    const canMoveUp = parent.componentElements[0] != this.componentEditor.root;

    if (canMoveUp)
      action.run();
  }

  moveDown() {
    const parent = this.componentEditor.parent;
    const action = new ComponentSwapAction(this.componentEditor, 'down');
    const canMoveDown = parent.lastComponentElement != this.componentEditor.root;

    if (canMoveDown)
      action.run();
  }

  remove() {
    if (confirm(i18n.t("admin.page-editor.confirm-component-delete"))) {
      const action = new ComponentRemovalAction(this.componentEditor);
      action.run();
    }
  }
}

