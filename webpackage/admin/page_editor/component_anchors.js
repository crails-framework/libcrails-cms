import AddAction from "./add_action.js";
import InsertAction from "./insert_action.js";

function anchorPosition(anchor, iframe) {
  const sibling = anchor.nextSibling;
  let rect;

  if (sibling) {
    rect = sibling.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  }
  rect = anchor.container.getBoundingClientRect();
  return { y: rect.bottom, x: rect.x + rect.width / 2 };
}

export default class {
  constructor(component) {
    this.container = document.createElement("ul");
    this.container.classList.add("anchors-container");
    this.container.addEventListener("click", this.containerClicked.bind(this));
    this.container.addEventListener("mousewheel", this.containerScrolled.bind(this));
    this.component = component;
    this.iframe.contentWindow.addEventListener("scroll",
      this.updateAnchors.bind(this));
    this.iframe.contentWindow.addEventListener("resize",
      this.updateAnchors.bind(this));
    this.iframe.parentElement.appendChild(this.container);
    this.disable();
  }

  get anchors() {
    return this.component.componentAnchors();
  }

  get iframe() {
    return this.component.layout.iframe;
  }

  get enabled() {
    return this.container.style.display == "block";
  }

  enable(mode = 'add') {
    this.container.style.display = "block";
    this.actionType = mode == 'add' ? AddAction : InsertAction;
    this.updateAnchors();
  }

  disable() {
    this.container.style.display = "none";
    delete this.actionType;
    delete this.target;
  }

  clear() {
    while (this.container.children.length) {
      this.container.removeChild(this.container.children[0]);
    }
  }

  updateAnchors() {
    if (this.enabled) {
      this.clear();
      this.anchors.forEach(anchor => {
        const action = this.actionType(anchor, this.target);
        const position = anchorPosition(anchor, this.iframe);

        Style.apply("button", action.root);
        action.root.style.position = "absolute";
        action.root.style.top = `${position.y}px`;
        action.root.style.left = `${position.x}px`;
        this.container.appendChild(action.root);
      });
      if (typeof crailscms_on_content_loaded == "function")
        crailscms_on_content_loaded(this.container);
    }
  }

  containerClicked(event) {
    if (event.target == this.container) {
      event.preventDefault();
      this.disable();
    }
  }

  containerScrolled(event) {
    this.iframe.contentWindow.scrollBy({
      top: -event.wheelDeltaY,
      left: -event.wheelDeltaX,
      behavior: 'smooth'
    });
  }
}
