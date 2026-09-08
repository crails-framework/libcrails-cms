import NestedComponentEditor from "./nested_component_editor.js";
import ComponentEditor from "./component_editor.js";

function ListItemComponentEditor(parentClass = ComponentEditor) {
  return class extends parentClass {
    constructor(parent, element, components) {
      if (!element) element = parent.document.createElement("li");
      super(parent, element, components);
    }
  };
}

export default class ListComponentEditor extends NestedComponentEditor {
  constructor(parent, element, componentTypes) {
    Object.keys(componentTypes).forEach(function(componentName) {
      componentTypes[componentName] = ListItemComponentEditor(componentTypes[componentName]);
    });
    if (!element)
      element = parent.document.createElement("ul");
    super(parent, element, componentTypes);
  }
}
