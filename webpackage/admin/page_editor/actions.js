let actions;

export default actions = new class {
  constructor() {
    this.actions = [];
    this.actionsIndex = 0;
    this.done = Promise.resolve();
  }

  canRedo() {
    return this.actions.length > this.actionsIndex;
  }

  canUndo() {
    return this.actionsIndex > 0;
  }

  length() {
    return this.actions.length;
  }

  currentAction() {
    return this.actionsIndex > 0 ? this.actions[this.actionsIndex - 1] || this.lastAction() : null;
  }

  lastAction() {
    return this.actions[this.actions.length - 1];
  }

  undo() {
    const action = this.actions[this.actionsIndex - 1];

    if (action && action.state) {
      this.actionsIndex -= 1;
      return this.done.then(() => {
        return action.unapply();
      });
    }
    return this.done;
  }

  redo() {
    const action = this.actions[this.actionsIndex];

    if (action && !action.state) {
      this.actionsIndex += 1;
      return this.done.then(() => {
        return action.apply();
      });
    }
    return this.done;
  }

  store(action) {
    this.actions = this.actions.splice(0, this.actionsIndex);
    this.actions.push(action);
    this.actionsIndex++;
    this.lastUpdate = Date.now();
    console.log("-> Storing action", action, this.lastUpdate);
  }
}

export class HistoryAction {
  constructor(type) {
    this.type = type;
    this.state = 0;
  }
  isSame() { return false; }
  unapply() { this.state = 0; return Promise.resolve(true); }
  apply() { this.state = 1; return Promise.resolve(true); }
  run() {
    actions.store(this);
    return this.apply();
  }
}

export class EditableSnapshot extends HistoryAction {
  constructor(component, editable, oldHtml, newHtml) {
    super("editable-snapshot");
    this.component = component;
    this.editable = editable;
    this.oldHtml = oldHtml;
    this.newHtml = newHtml;
  }

  isSame(action) {
    return action && this.editable == action.editable && this.newHtml == action.newHtml;
  }

  get contentEditor() {
    return this.component.contentEditor;
  }

  apply() {
    const contentEditor = this.contentEditor;
    contentEditor.syncRegions([]);
    this.editable.innerHTML = this.editable.$snapshot = this.newHtml;
    //this.editable.setAttribute('contenteditable', '');
    contentEditor.syncRegions([this.editable]);
    return super.apply();
  }

  unapply() {
    const contentEditor = this.contentEditor;
    contentEditor.syncRegions([]);
    this.editable.innerHTML = this.editable.$snapshot = this.oldHtml;
    //this.editable.setAttribute('contenteditable', '');
    contentEditor.syncRegions([this.editable]);
    return super.unapply();
  }

  reloadContentTools() {
    this.component.layout.restartContentEditor();
  }
}

export class ComponentPropertyAction extends HistoryAction {
  constructor(component, property, value, oldValue) {
    super("component-property");
    this.component = component;
    this.property = property;
    this.newValue = value;
    this.oldValue = oldValue;
  }

  withInput(input) {
    this.input = input;
    return this;
  }

  apply() {
    if (this.input)
      this.input.value = this.newValue;
    this.component.updateProperty(this.property, this.newValue);
    return super.apply();
  }

  unapply() {
    if (this.input)
      this.input.value = this.oldValue;
    this.component.updateProperty(this.property, this.oldValue);
    return super.unapply();
  }
}

export class ComponentRemovalAction extends HistoryAction {
  constructor(component) {
    super("component-removal");
    this.parent = component.parent;
    this.component = component;
    this.nextSibling = component.root.nextElementSibling;
  }

  apply() {
    return this.parent.removeComponent(this.component).then(() => {
      this.state = 1;
    });
  }

  unapply() {
    return this.parent.insertComponent(this.component, this.nextSibling).then(() => {
      this.state = 0;
    });
  }
}

export class ComponentInsertAction extends HistoryAction {
  constructor(component, newParent, nextSibling) {
    super("component-insert");
    this.component = component;
    this.oldParent = component.parent;
    this.newParent = newParent;
    this.nextSibling = nextSibling;
    this.oldSibling = component.root.nextElementSibling;
  }

  apply() {
    return this.newParent.insertComponent(this.component, this.nextSibling).then(() => {
      this.state = 1;
    });
  }

  unapply() {
    let promise;

    if (this.oldParent) {
      promise = this.oldParent.insertComponent(this.component, this.oldSibling);
    } else {
      promise = this.newParent.removeComponent(this.component);
    }
    return promise.then(() => {
      this.state = 0;
    });
  }
}

export class ComponentSwapAction extends HistoryAction {
  constructor(component, direction) {
    super(`swap-${direction}`);
    this.component = component;
    this.direction = direction;
  }

  apply() {
    return this[this.direction]().then(() => this.state = 1);
  }

  unapply() {
    return this.invertApply().then(() => this.state = 0);
  }

  invertApply() {
    switch (this.direction) {
      case 'up': return this.down();
      case 'down': return this.up();
    }
  }

  up() {
    return this.component.parent.moveUp(this.component);
  }

  down() {
    return this.component.parent.moveDown(this.component);
  }
}
