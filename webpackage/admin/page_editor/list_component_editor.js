import NestedComponentEditor from "./nested_component_editor.js";

function ListItemComponentEditor(parentClass = ComponentEditor) {
  return class extends parentClass {
    constructor(parent, element, components) {
      if (!element) element = document.createElement("li");
      super(parent, element, components);
    }
  };
}

export default class ListComponentEditor extends NestedComponentEditor {
  constructor(parent, element, componentTypes) {
    Object.keys(componentTypes).forEach(function(componentName) {
      componentTypes[componentName] = ListItemComponentEditor(componentTypes[componentName]);
    });
    super(parent, element, componentTypes);
    this.root = element || document.createElement("ul");
  }
}
