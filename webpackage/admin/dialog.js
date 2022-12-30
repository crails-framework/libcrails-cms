import Style from "../style.js";

const transitionDuration = 215;
const popupTransition = `transform ${transitionDuration}ms`;
const overlayTransition = `opacity ${transitionDuration}ms`;

export default class {
  constructor() {
    this.popup = document.createElement("div");
    this.popup.style.transition = popupTransition;
    this.root = document.createElement("div");
    this.root.style.transition = overlayTransition;
    this.root.classList.add("proudcms-dialog");
    Style.ready.then(() => { Style.apply("modal", this.popup); });
    this.setVisibility(0);
    this.root.addEventListener("click", event => {
      if (event.target == this.root)
        this.abort();
    });
    this.root.appendChild(this.popup);
    document.addEventListener("DOMContentLoaded", () => {
      document.body.removeChild(this.root);
    });
  }

  open() {
    document.body.appendChild(this.root);
    setTimeout(this.setVisibility.bind(this, 1), 50);
  }

  abort() {
    this.close();
  }

  close() {
    this.setVisibility(0);
    setTimeout(() => {
      document.body.removeChild(this.root);
    }, transitionDuration);
  }

  setVisibility(value) {
    this.root.style.opacity = value;
    this.popup.style.transform = `scaleX(${value}) scaleY(${value})`;
  }		
}

