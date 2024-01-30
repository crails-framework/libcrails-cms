import i18n from "../../i18n.js";
import ComponentEditor from "./component_editor.js";
import GridComponentEditor from "./grid_component_editor.js";

function collectInjectors() {
  const injectorList = document.querySelector("[data-role='injector-list']");
  const result = [];

  if (injectorList) {
    injectorList.querySelectorAll("[data-name]").forEach(injectable => {
      result.push({ value: injectable.dataset.name, text: i18n.t(`admin.injectors.${injectable.dataset.name}`) });
    });
  }
  return result;
}

export function withInjections() {
  return collectInjectors().length > 0;
}

export default class InjectableComponentEditor extends GridComponentEditor(ComponentEditor) {
  initializeProperties() {
    this.properties.injectorType = { type: "select", target: this, attribute: "injectableName", options: collectInjectors()};
    this.properties.idValue = { type: "string", target: this.injector.dataset, attribute: "id", optional: true };
    this.properties.count = { type: "number", target: this.injector.dataset, attribute: "count", optional: true };
    super.initializeProperties();
  }

  get injectableName() {
    return this.injector.attributes.name ? this.injector.attributes.name.value : null;
  }

  set injectableName(value) {
    console.log("Update injectable name", value);
    this.injector.setAttribute("name", value);
    this.updatePlaceholder();
  }

  create() {
    const injector = document.createElement("inject");
    const placeholder = document.createElement("div");

    this.root.appendChild(injector);
    injector.appendChild(placeholder);
    placeholder.classList.add("cms-inject-placeholder");
    super.create();
  }

  bindElements() {
    this.injector = this.root.children[0];
    super.bindElements();
  }

  get placeholder() {
    return this.root.querySelector(".cms-inject-placeholder");
  }

  updatePlaceholder() {
    this.placeholder.innerHTML = `<p>Component injection</p><p>Component type: ${this.injectableName}</p>`;
  }
}
