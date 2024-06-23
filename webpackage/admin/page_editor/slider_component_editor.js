import NestedComponentEditor from "./nested_component_editor.js";
import GridComponentEditor from "./grid_component_editor.js";

export default class extends GridComponentEditor(NestedComponentEditor) {
  constructor(parent, element, components) {
    super(parent, element, components);
    this.root.classList.add("cms-slider");
    this.root.dataset.interval = 0;
    this.root.dataset.mode = "carousel";
    this.root.dataset.items = 1;
  }

  initializeProperties() {
    this.properties.mode = {
      type: "select", target: this.root.dataset, attribute: "mode", options: [
        "carousel", "gallery"
      ]
    };
    this.properties.interval = { type: "number", target: this.root.dataset, attribute: "interval", min: 0 };
    this.properties.items = { type: "number", target: this.root.dataset, attribute: "items", min: 1 };
    super.initializeProperties();
  }

  create() {
    const wrapper = document.createElement("div");
    const slider = document.createElement("div");

    slider.classList.add("cms-slider");
    wrapper.appendChild(slider);
    this.root.appendChild(wrapper);
    super.create();
  }

  bindElements() {
    this.wrapper = this.root.lastElementChild;
    this.slider = this.wrapper.lastElementChild;
    super.bindElements();
  }

  get container() {
    return this.slider;
  }
}
