import NestedComponentEditor from "./nested_component_editor.js";

export default class extends NestedComponentEditor {
  constructor(parent, element, componentTypes) {
    super(parent, element, componentTypes);
    this.isFooter = true;
  }

  initializeProperties() {
    super.initializeProperties();
    this.actions.removeAction("up");
    this.actions.removeAction("down");
  }
};
