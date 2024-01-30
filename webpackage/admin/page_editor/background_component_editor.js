import ComponentEditor from "./component_editor.js";

function updateBackgroundTint(component) {
  const style = component.root.querySelector("style[data-type='background']");

  if (style) {
    if (component.backgroundTint) {
      style.innerHTML = `[data-id="${component.id}"]:before { background-color: ${component.backgroundTint}; }`
    } else {
      style.innerHTML = "";
    }
  } else {
    console.err("Did not find the background style element for", component.id);
  }
}

export default function (parentClass = ComponentEditor) {
  return class extends parentClass {
    initializeProperties() {
      this.properties.background = { category: "background", type: "image", target: this.root, style: "backgroundImage" };
      this.properties.fixedBackground = { category: "background", type: "bool", target: this, attribute: "fixedBackground" };
      this.properties.tint = { category: "background", type: "color", target: this, attribute: "backgroundTint", optional: true };
      this.properties.textColor = { type: "color", target: this.root, style: "color", optional: true };
      super.initializeProperties();
    }

    get backgroundTint() {
      return this.root.dataset.tint || "transparent";
    }

    set backgroundTint(value) {
      this.root.dataset.tint = value;
      updateBackgroundTint(this);
    }

    get fixedBackground() {
      return this.root.style.backgroundAttachment == "fixed";
    }

    set fixedBackground(value) {
      if (value)
        this.root.style.backgroundAttachment = "fixed";
      else
        delete this.root.style.backgroundAttachment;
    }

    create() {
      const style = document.createElement("style");

      style.dataset.type = "background";
      this.root.classList.add("background-component");
      this.root.appendChild(style);
      super.create();
    }
  };
};
