import GridComponentEditor from "./grid_component_editor.js";

export default class extends GridComponentEditor() {
  initializeProperties() {
    this.properties.image = { type: "image", target: this.image, attribute: "src" };
    super.initializeProperties();
  }

  create() {
    const image = document.createElement("img");

    this.root.appendChild(image);
    super.create();
  }

  bindElements() {
    this.image = this.root.querySelector("img");
    super.bindElements();
  }
}

