// Lightweight, un-themed markers used to represent anchors visually:
// - AnchorBar: a thin line drawn between two components (or at an edge),
//   used to show where a component will be inserted/moved.
// - AnchorZone: a translucent rectangle drawn over a nested component,
//   used to show that dropping/opening here will step into that component.
//
// Both expose the same minimal interface as the old `Action` class
// (`.root`, `.callback`, `.withHoverCallback()`) so they can be wired up
// the same way from component_anchors.js.

class AnchorMarker {
  constructor(className) {
    this.root = document.createElement("div");
    this.root.classList.add(className);
    this.root.addEventListener("click", this.onClicked.bind(this));
    this.root.addEventListener("mouseenter", this.onHovered.bind(this, true));
    this.root.addEventListener("mouseleave", this.onHovered.bind(this, false));
  }

  onClicked(event) {
    event.preventDefault();
    if (typeof this.callback == "function")
      this.callback();
    return false;
  }

  onHovered(state) {
    this.root.classList.toggle("hovered", state);
    if (typeof this.hoverCallback == "function")
      this.hoverCallback(state, this);
  }

  withCallback(callback) {
    this.callback = callback;
    return this;
  }

  withHoverCallback(callback) {
    this.hoverCallback = callback;
    return this;
  }
}

export class AnchorBar extends AnchorMarker {
  constructor(orientation) {
    super("anchor-bar");
    this.root.classList.add(orientation);
    this.line = document.createElement("div");
    this.line.classList.add("anchor-bar-line");
    this.labelElement = document.createElement("span");
    this.labelElement.classList.add("anchor-bar-label");
    this.labelElement.textContent = "+";
    this.root.appendChild(this.line);
    this.root.appendChild(this.labelElement);
  }

  // { top, left, width, height } in the same coordinate space as
  // getBoundingClientRect() results within the editor's iframe.
  setGeometry({ top, left, width, height }) {
    const style = this.root.style;

    style.top = `${top}px`;
    style.left = `${left}px`;
    if (this.root.classList.contains("vertical"))
      style.height = `${height}px`;
    else
      style.width = `${width}px`;
  }
}

export class AnchorZone extends AnchorMarker {
  constructor(label) {
    super("anchor-zone");
    this.labelElement = document.createElement("span");
    this.labelElement.classList.add("anchor-zone-label");
    this.labelElement.textContent = label || "";
    this.root.appendChild(this.labelElement);
  }

  setGeometry({ top, left, width, height }) {
    const style = this.root.style;

    style.top = `${top}px`;
    style.left = `${left}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
  }
}
