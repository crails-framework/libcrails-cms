import AddAction from "./add_action.js";
import InsertAction from "./insert_action.js";
import OpenAction from "./open_anchor_action.js";
import {AnchorBar, AnchorZone} from "./anchor_marker.js";
import Funnel from "../funnel.js";
import i18n from "../../i18n.js";

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

function isValidAnchorFor(target, anchor) {
  return anchor.component !== target &&
         anchor.nextSibling !== target &&
         anchor.parent.canInsert(target);
}

function transformScrollDelta(value) {
  const sign = value > 0 ? 1 : -1;
  const baseline = Math.pow(50, -Math.abs(value)); // baseline has an exponentially decreasing slop: little influence on big changes, strongly increasing small changes.
  return baseline * sign + value * 2.5;
}

// == Geometry helpers ==
// Anchors come in two flavours:
// - "insert" anchors (sibling gaps): rendered as a thin bar. Vertical
//   when the two neighbouring components sit side by side, horizontal
//   when they're stacked on top of each other.
// - "context" anchors (nested components): rendered as a translucent
//   rectangle drawn directly over the nested component.

function rectOf(element) {
  return element && typeof element.getBoundingClientRect == "function"
    ? element.getBoundingClientRect()
    : null;
}

function rangesOverlap(minA, maxA, minB, maxB) {
  return minA < maxB && minB < maxA;
}

function isSideBySide(rectA, rectB) {
  return rangesOverlap(rectA.top, rectA.bottom, rectB.top, rectB.bottom) &&
         !rangesOverlap(rectA.left, rectA.right, rectB.left, rectB.right);
}

function containerOrientation(container) {
  const children = Array.from(container.children).filter(el => el.dataset && el.dataset.component);

  for (let i = 0 ; i < children.length - 1 ; ++i) {
    const rectA = children[i].getBoundingClientRect();
    const rectB = children[i + 1].getBoundingClientRect();

    if (isSideBySide(rectA, rectB))
      return "row";
  }
  return "column";
}

function barBetween(rectA, rectB) {
  if (isSideBySide(rectA, rectB)) {
    const left = rectA.left <= rectB.left ? rectA : rectB;
    const right = left === rectA ? rectB : rectA;

    return {
      orientation: "vertical",
      top: Math.min(rectA.top, rectB.top),
      left: (left.right + right.left) / 2,
      height: Math.max(rectA.bottom, rectB.bottom) - Math.min(rectA.top, rectB.top),
      width: 0
    };
  }
  const top = rectA.top <= rectB.top ? rectA : rectB;
  const bottom = top === rectA ? rectB : rectA;

  return {
    orientation: "horizontal",
    top: (top.bottom + bottom.top) / 2,
    left: Math.min(rectA.left, rectB.left),
    width: Math.max(rectA.right, rectB.right) - Math.min(rectA.left, rectB.left),
    height: 0
  };
}

function barAtEdge(container, siblingRect, siblingIsPrevious) {
  const orientation = containerOrientation(container) === "row" ? "vertical" : "horizontal";

  if (!siblingRect) {
    const rect = container.getBoundingClientRect();
    return orientation === "vertical"
      ? { orientation, top: rect.top, left: rect.left + rect.width / 2, height: rect.height, width: 0 }
      : { orientation, top: rect.top + rect.height / 2, left: rect.left, width: rect.width, height: 0 };
  }
  if (orientation === "vertical") {
    const x = siblingIsPrevious ? siblingRect.right : siblingRect.left;
    return { orientation, top: siblingRect.top, left: x, height: siblingRect.height, width: 0 };
  }
  const y = siblingIsPrevious ? siblingRect.bottom : siblingRect.top;
  return { orientation, top: y, left: siblingRect.left, width: siblingRect.width, height: 0 };
}

function insertAnchorGeometry(anchor) {
  const rectA = rectOf(anchor.previousSibling);
  const rectB = rectOf(anchor.nextSibling);

  if (rectA && rectB) return barBetween(rectA, rectB);
  if (rectA) return barAtEdge(anchor.container, rectA, true);
  if (rectB) return barAtEdge(anchor.container, rectB, false);
  return barAtEdge(anchor.container, null, false);
}

function contextAnchorGeometry(anchor) {
  const rect = anchor.newContext.root.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function labelForComponent(component) {
  return i18n.t(`admin.page-editor.components.${component.componentName}`);
}

export default class {
  constructor(component) {
    this.anchorFunnel = new Funnel(300);
    this.container = document.createElement("div");
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
    this.autoPickAttempted = false;
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
    this.autoPickAttempted = false;
    this.scheduleAnchorsUpdate();
  }

  behaviorForAnchor(anchor) {
    return anchor.newContext
      ? OpenAction(anchor, this.target)
      : this.actionType(anchor, this.target);
  }

  makeMarkerForAnchor(anchor, layout) {
    const behavior = this.behaviorForAnchor(anchor);

    if (anchor.newContext) {
      const marker = new AnchorZone(labelForComponent(anchor.newContext));

      marker.setGeometry(contextAnchorGeometry(anchor));
      marker.withCallback(behavior.commit);
      marker.withHoverCallback(hovered => behavior.onHover && behavior.onHover(hovered, marker));
      marker.root.classList.add("context-anchor");
      return marker;
    }

    const geometry = insertAnchorGeometry(anchor);
    const marker = new AnchorBar(geometry.orientation);

    marker.setGeometry(geometry);
    marker.withCallback(behavior.commit);
    marker.withHoverCallback(hovered => behavior.onHover && behavior.onHover(hovered, marker));
    if (anchor.container === layout.container && !layout.singleLevelLayout)
      marker.root.classList.add("layout-anchor");
    return marker;
  }

  validAnchors() {
    return this.anchors.filter(anchor => !this.target || isValidAnchorFor(this.target, anchor));
  }

  updateAnchors() {
    this.$actions = [];
    if (this.enabled) {
      const layout = this.component.layout;
      const anchors = this.validAnchors();

      this.container.classList.remove("loading");
      this.clear();

      // If there's only one place a component could possibly go, skip the picking process
      if (!this.autoPickAttempted && anchors.length === 1) {
        this.autoPickAttempted = true;
        this.behaviorForAnchor(anchors[0]).commit();
        return ;
      }

      anchors.forEach(anchor => {
        const marker = this.makeMarkerForAnchor(anchor, layout);

        this.container.appendChild(marker.root);
        this.$actions.push({ action: marker, anchor: anchor });
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
