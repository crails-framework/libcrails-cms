import i18n from "../../i18n.js";
import ComponentEditor from "./component_editor.js";
import {MetaAction, Action} from "./controls.js";
import DefaultControlMenu from "./component_controls.js";
import {withInjections} from "./injected_component_editor.js";
import InjectableComponentEditor from "./injected_component_editor.js";
import {ComponentInsertAction} from "./actions.js";

function probeComponentTypes(self) {
  if (self.componentTypes)
    return self.componentTypes;
  return self.parent ? probeComponentTypes(self.parent) : undefined;
}

function animate(element, property, duration, transformCallback) {
  return new Promise(solve => {
    element.style.transition = `${property} ${duration}ms`;
    element.style.position = "relative";
    setTimeout(transformCallback, 50);
    setTimeout(solve, duration);
  }).then(function() {
    element.style.transition = null;
    element.style.position = null;
  });
}

function createAddComponentAction(componentEditor) {
  const types = Object.keys(componentEditor.componentTypes);
  if (types.length > 1) {
    const list = new MetaAction("add");

    for (let type of types) {
      list.addAction(new Action(type, function() {
        componentEditor.addComponent(type);
      }).withText(i18n.t(`admin.page-editor.components.${type}`)));
    }
    return list;
  } else if (types.length > 0) {
    return new Action("add", function() {
      componentEditor.addComponent(types[0]);
    });
  }
  return null;
}

export function getOwnedEditableContent(componentEditor) {
  const list = [];
  const candidates = componentEditor.root.querySelectorAll("[data-editable]");

  if (componentEditor.components) {
    for (let i = 0 ; i < candidates.length ; ++i) {
      const candidate = candidates[i];
      let owned = true;
      for (let component of componentEditor.components) {
        if (component.root.contains(candidate)) {
          owned = false;
          break ;
        }
      }
      if (owned)
        list.push(candidate);
    }
  }
  return candidates;
}

export class ControlMenu extends DefaultControlMenu {
  initializeActions() {
    super.initializeActions();
    if (Object.keys(this.componentEditor.componentTypes).length > 0)
      this.prependAction(createAddComponentAction(this.componentEditor));
  }
}

export default class NestedComponentEditor extends ComponentEditor {
  constructor(parent, element, componentTypes) {
    super(parent, element);
    if (withInjections() && !componentTypes.injectable)
      componentTypes.injectable = InjectableComponentEditor;
    this.componentTypes = componentTypes || probeComponentTypes(parent) || {};
    this.components = [];
    this.actions = new ControlMenu(this);
  }

  get container() {
    return this.root;
  }

  get componentElements() {
    return this.container.querySelectorAll(":scope > [data-component]");
  }

  get lastComponentElement() {
    return this.componentElements[this.componentElements.length - 1];
  }

  get lastAnchor() {
    const lastComponentElement = this.lastComponentElement;
    return lastComponentElement
      ? lastComponentElement.nextElementSibling
      : this.container.children[0];
  }

  bindElements() {
    for (let i = 0 ; i < this.componentElements.length ; ++i) {
      const element = this.componentElements[i];
      const typename = element.dataset.component;
      const type = this.componentTypes[typename];

      if (typename == undefined)
        continue ;
      else if (type == undefined)
        console.warn("unknown component type", typename, "in", this);
      else {
        try {
          const component = new type(this, element);
          element.$component = component;
          component.componentType = typename;
          component.bindElements();
          this.components.push(component);
        } catch (error) {
          console.error("Failed to bindElements on component", component, error);
          element.remove();
          i--;
        }
      }
    }
    this.initializeProperties();
  }

  componentsChanged() {
  }

  componentAnchors() {
    let anchors = [];

    this.components.forEach(child => {
      if (typeof child.componentTypes == "object") {
        anchors.push({
          parent: this,
          container: this.container,
          component: child,
          newContext: child
        });
      }
      anchors.push({
        parent:          this,
        container:       this.container,
        component:       child,
        previousSibling: child.root.previousElementSibling,
        nextSibling:     child.root
      });
    });
    anchors.push({
      parent:          this,
      container:       this.container,
      component:       this,
      previousSibling: this.lastComponentElement,
      nextSibling:     this.lastAnchor
    });
    return anchors;
  }

  // shouldn't this just collect all elements with data-editable property ?
  collectEditableElements() {
    const list = [];
    const owned = getOwnedEditableContent(this);

    owned.forEach(element => list.push(element));
    this.components.forEach(component => {
      for (let element of component.collectEditableElements()) {
        if (list.indexOf(element) <= 0) {
          list.push(element);
        }
      }
    });
   return list;
  }

  indexOf(component) {
    for (let i = 0 ; i < this.container.children.length ; ++i) {
      if (this.container.children[i] == component.root)
        return i;
    }
    return -1;
  }

  canInsert(component) {
    const types = Object.keys(this.componentTypes);
    for (let name in this.componentTypes) {
      if (this.componentTypes[name] == component.constructor)
        return true;
    }
    return false;
  }

  insertComponent(component, insertAnchor) {
    let startPosition = { top: window.innerHeight, left: 0 };

    if (component.parent && component.parent !== this) {
      startPosition = component.root.getBoundingClientRect();
      component.parent.removeComponent(component);
    }
    this.components.push(component);
    this.container.insertBefore(component.root, insertAnchor);
    component.enableEditMode();
    component.root.style.top = startPosition.top;
    component.root.style.left = startPosition.left;
    return animate(component.root, "all", 500, () => {
      component.root.style.top = 0;
      component.root.style.left = 0;
    }).then(() => {
      window.scroll({
        top: component.root.getBoundingClientRect().top + window.scrollY,
        behavior: 'smooth'
      });
      this.componentsChanged();
    }).catch(err => {
      console.error("Exception happened in insertComponent", err);
    });
  }

  addComponent(type, insertAnchor) {
    console.log("Adding component", type, "to", this, "at", insertAnchor);
    const component = new this.componentTypes[type](this);
    const action = new ComponentInsertAction(
      component, this, insertAnchor || this.lastAnchor
    );

    action.oldParent = null;
    component.root.$component = component;
    component.create();
    component.componentType = type;
    return action.run().then(() => {
      this.layout.updateEditableComponents();
      component.enableEditMode();
      if (typeof crailscms_on_content_loaded == "function")
        crailscms_on_content_loaded(component.root);
      return component;
    }).catch(err => {
      console.error("Exception happened in addComponent", err);
    });
  }

  removeComponent(component) {
    return animate(component.root, "left", 500, () => {
      component.root.style.left = window.outerWidth - component.root.offsetLeft + 100;
    }).then(() => {
      this.container.removeChild(component.root);
      this.components = this.components.filter(item => {
        return item != component;
      });
      this.componentsChanged();
    });
  }

  swapElement(topElement, bottomElement) {
    const { newX, newY, oldX, oldY, offsetX, offsetY } = {
      newX: topElement.offsetLeft || 0,
      newY: topElement.offsetTop || 0,
      oldX: bottomElement.offsetLeft || 0,
      oldY: bottomElement.offsetTop || 0,
      offsetX: (bottomElement.width || 0) - (topElement.width || 0),
      offsetY: (bottomElement.height || 0) - (topElement.height || 0)
    };
    const duration = 500;

    bottomElement.style.top = bottomElement.style.left = topElement.style.top = topElement.style.left = 0;
    const promises = [
      animate(bottomElement, "all", duration, () => {
        bottomElement.style.top  = newY - oldY;
        bottomElement.style.left = newX - oldX;
      }),
      animate(topElement, "all", duration, () => {
        topElement.style.top = (oldY - newY) + offsetY;
        topElement.style.left = (oldX - newX) + offsetX;
      })
    ];
    return Promise.all(promises).then(() => {
      bottomElement.style.transition = topElement.style.transition = null;
      bottomElement.style.position = topElement.style.position = null;
      bottomElement.style.top = bottomElement.style.left
        = topElement.style.top = topElement.style.left = 0;
    });
  }

  moveUp(component) {
    if (this.componentElements[0] == component.root) return ;
    const otherElement = component.root.previousElementSibling;
    return this.swapElement(otherElement, component.root).then(() => {
      this.container.insertBefore(component.root, otherElement);
      this.componentsChanged();
    });
  }

  moveDown(component) {
    if (this.lastComponentElement == component.root) return ;
    const otherElement = component.root.nextElementSibling;
    if (!otherElement || otherElement.$component.isFooter) return ;
    return this.swapElement(component.root, otherElement).then(() => {
      this.container.insertBefore(component.root, otherElement.nextElementSibling);
      this.componentsChanged();
    });
  }

  enableEditMode() {
    this.components.forEach(component => component.enableEditMode());
    super.enableEditMode();
  }

  disableEditMode() {
    this.components.forEach(component => component.disableEditMode());
    super.disableEditMode();
  }
}
