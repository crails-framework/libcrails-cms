import i18n from "../../i18n.js";
import Style from "../../style.js";
import NestedComponentEditor from "./nested_component_editor.js";

function componentTitle(component) {
  const typename = component.componentType || component.root.dataset.component;
  return i18n.t(`admin.page-editor.components.${typename}`);
}

function isElementVisible(element, win) {
  if (!element || !win) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (win.innerHeight || win.document.documentElement.clientHeight) &&
    rect.right <= (win.innerWidth || win.document.documentElement.clientWidth)
  );
}

function scrollToComponent(component) {
  const win = component.window;
  const el = component.root;
  if (el && win && !isElementVisible(el, win)) {
    const rect = el.getBoundingClientRect();
    win.scrollTo({
      top: rect.top + win.scrollY - 60,
      behavior: 'smooth'
    });
  }
}

export default class StructurePreview {
  constructor(anchorsController) {
    this.anchorsController = anchorsController;
    this.root = document.createElement("div");
    this.root.classList.add("page-structure-preview");
    Style.apply("form", this.root);
    this.render();
  }

  render() {
    this.root.innerHTML = "";
    const heading = document.createElement("div");
    heading.classList.add("property-section-title");
    Style.apply("menuHeading", heading);
    heading.textContent = i18n.t("admin.page-editor.document-structure");
    this.root.appendChild(heading);

    const rootComponent = this.anchorsController.component;
    const treeContainer = document.createElement("ul");
    treeContainer.classList.add("structure-tree");
    treeContainer.style.listStyleType = "none";
    treeContainer.style.paddingLeft = "0";

    this.renderComponentNode(rootComponent, treeContainer);
    this.root.appendChild(treeContainer);
  }

  renderComponentNode(component, parentElement) {
    if (!(component instanceof NestedComponentEditor))
      return;

    const li = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = componentTitle(component);
    link.style.display = "block";
    link.style.padding = "6px 8px";
    link.style.cursor = "pointer";
    link.style.textDecoration = "none";

    // Highlight the container currently active in the anchor layer
    if (component === this.anchorsController.context) {
      link.style.fontWeight = "bold";
      link.classList.add("active-context");
    }

    // When moving, check if container can receive the target component
    const target = this.anchorsController.target;
    let isDisabled = false;
    if (target) {
      if (typeof component.canInsert === "function" && !component.canInsert(target)) {
        isDisabled = true;
      }
    }

    if (isDisabled) {
      link.style.opacity = "0.4";
      link.style.cursor = "not-allowed";
      link.classList.add("disabled");
    } else {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        scrollToComponent(component);
        this.anchorsController.changeContext(component);
      });

      // Highlight corresponding anchors in the anchor view on hover
      link.addEventListener("mouseenter", () => {
        scrollToComponent(component);
        if (this.anchorsController.$actions) {
          this.anchorsController.$actions.forEach(item => {
            if (item.anchor.newContext === component || item.anchor.container === component) {
              item.action.root.classList.add("hovered");
            }
          });
        }
      });

      link.addEventListener("mouseleave", () => {
        if (this.anchorsController.$actions) {
          this.anchorsController.$actions.forEach(item => {
            if (item.anchor.newContext === component || item.anchor.container === component) {
              item.action.root.classList.remove("hovered");
            }
          });
        }
      });
    }

    li.appendChild(link);

    // Recursively render child container components
    if (component.components && component.components.length > 0) {
      const subUl = document.createElement("ul");
      subUl.style.listStyleType = "none";
      subUl.style.paddingLeft = "16px";
      let hasContainerChildren = false;
      component.components.forEach(child => {
        if (child instanceof NestedComponentEditor) {
          hasContainerChildren = true;
          this.renderComponentNode(child, subUl);
        }
      });
      if (hasContainerChildren) {
        li.appendChild(subUl);
      }
    }

    parentElement.appendChild(li);
  }

  update() {
    this.render();
  }
}
