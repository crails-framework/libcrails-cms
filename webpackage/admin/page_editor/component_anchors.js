import AddAction from "./add_action.js";
import InsertAction from "./insert_action.js";
import Funnel from "../funnel.js";

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

function isValidAnchorFor(target, anchor) {
  return anchor.component !== target &&
         anchor.nextSibling !== target &&
         anchor.parent.canInsert(target);
}

function transformScrollDelta(value) {
  const sign = value > 0 ? 1 : -1;
  // baseline has an exponentially decreasing slope,
  // having little influence on big changes, but strongly
  // increasing small changes.
  const baseline = Math.pow(25, -Math.abs(value));

  return baseline * sign + value;
}

export default class {
  constructor(component) {
    this.anchorFunnel = new Funnel(150);
    this.container = document.createElement("ul");
    this.container.classList.add("anchors-container");
    this.container.addEventListener("click", this.containerClicked.bind(this));
    this.container.addEventListener("mousewheel", this.containerScrolled.bind(this));
    this.component = component;
    this.iframe.contentWindow.addEventListener("scroll", this.scheduleAnchorsUpdate.bind(this));
    //this.iframe.contentWindow.addEventListener("resize", this.scheduleAnchorsUpdate.bind(this));
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
    this.scheduleAnchorsUpdate();
  }

  disable() {
    this.container.style.display = "none";
    this.target = this.actionType = undefined;
  }

  clear() {
    if (typeof crailscms_on_content_unload == "function")
      crailscms_on_content_unload(this.container);
    this.container.innerHTML = "";
  }

  scheduleAnchorsUpdate() {
    this.anchorFunnel.trigger(this.updateAnchors.bind(this));
  }

  updateAnchors() {
    if (this.enabled) {
      console.error("UPDATE ANCHORS CALLED");
      this.clear();
      this.anchors.forEach(anchor => {
        if (!this.target || isValidAnchorFor(this.target, anchor)) {
          const action = this.actionType(anchor, this.target);
          const position = anchorPosition(anchor, this.iframe);

          Style.apply("button", action.label);
          action.root.style.position = "absolute";
          action.root.style.top = `${position.y}px`;
          action.root.style.left = `${position.x}px`;
          this.container.appendChild(action.root);
        }
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
      top: -transformScrollDelta(event.wheelDeltaY),
      left: -transformScrollDelta(event.wheelDeltaX),
      behavior: 'smooth'
    });
  }
}
