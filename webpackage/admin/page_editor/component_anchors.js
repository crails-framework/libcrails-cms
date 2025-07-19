import AddAction from "./add_action.js";
import InsertAction from "./insert_action.js";
import OpenAction from "./open_anchor_action.js";
import Funnel from "../funnel.js";

function areSameAnchors(a, b) {
  return a.container === b.container && a.nextSibling === b.nextSibling && a.newContext == b.newContext;
}

function removeDuplicateAnchors(result) {
  for (let i = 0 ; i < result.length ; ++i) {
    let ii = i + 1;
    while (ii < result.length) {
      if (areSameAnchors(result[i], result[ii])) {
        result.splice(ii, 1);
      } else {
        ii++;
      }
    }
  }
  return result;
}

function anchorPosition(anchor, iframe) {
  const sibling = anchor.nextSibling;
  let rect;

  if (anchor.newContext) {
    rect = anchor.newContext.container.getBoundingClientRect();
    return { y: rect.y + rect.height / 2, x: rect.x + rect.width / 2 };
  } else if (sibling) {
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
  const baseline = Math.pow(50, -Math.abs(value));

  return baseline * sign + value * 2.5;
}

export default class {
  constructor(component) {
    this.anchorFunnel = new Funnel(300);
    this.container = document.createElement("ul");
    this.container.classList.add("anchors-container");
    this.container.addEventListener("click", this.containerClicked.bind(this));
    this.container.addEventListener("mousewheel", this.containerScrolled.bind(this));
    this.component = component;
    this.iframe.contentWindow.addEventListener("scroll", this.scheduleAnchorsUpdate.bind(this));
    this.iframe.contentWindow.addEventListener("resize", this.scheduleAnchorsUpdate.bind(this));
    this.iframe.parentElement.appendChild(this.container);
    this.disable();
  }

  get anchors() {
    return removeDuplicateAnchors(
      (this.context || this.component).componentAnchors()
    );
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
    this.context = mode == 'add' ? this.component : this.target.parent;
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
    if (!this.container.classList.contains("loading"))
      this.container.classList.add("loading");
    this.anchorFunnel.trigger(this.updateAnchors.bind(this));
  }

  changeContext(context) {
    this.context = context;
    this.scheduleAnchorsUpdate();
  }

  actionForAnchor(anchor) {
    if (anchor.newContext)
      return OpenAction(anchor, this.target);
    return this.actionType(anchor, this.target);
  }

  updateAnchors() {
    this.$actions = [];
    if (this.enabled) {
      const layout = this.component.layout;
      this.container.classList.remove("loading");
      this.clear();
      this.anchors.forEach(anchor => {
        if (!this.target || isValidAnchorFor(this.target, anchor)) {
          const action = this.actionForAnchor(anchor);
          const position = anchorPosition(anchor, this.iframe);

          Style.apply("button", action.label);
          action.root.style.top = `${position.y}px`;
          action.root.style.left = `${position.x}px`;
          if (position.x == 0)
            action.root.style.left = "50%";
          if (anchor.newContext)
            action.root.classList.add("context-anchor");
          else if (anchor.container === layout.container && !layout.singleLevelLayout)
            action.root.classList.add("layout-anchor");
          this.container.appendChild(action.root);
          this.$actions.push({ action: action, anchor: anchor });
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
