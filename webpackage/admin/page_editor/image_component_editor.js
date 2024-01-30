import GridComponentEditor from "./grid_component_editor.js";

export default class extends GridComponentEditor() {
  initializeProperties() {
    this.properties.image = { type: "image", target: this.image, attribute: "src" };
    this.properties.width = { type: "number", target: this, attribute: "imageWidth", optional: true };
    this.properties.height = { type: "number", target: this, attribute: "imageHeight", optional: true };
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

  get imageWidth() {
    return this.root.dataset.width;
  }

  get imageHeight() {
    return this.root.dataset.height;
  }

  set imageWidth(value) {
    this.root.dataset.width = value;
    if (value != null)
      this.image.setAttribute("width", value);
    else
      this.image.removeAttribute("width");
  }

  set imageHeight(value) {
    this.root.dataset.height = value;
    if (value != null)
      this.image.setAttribute("height", value);
    else
      this.image.removeAttribute("height");
  }
}

