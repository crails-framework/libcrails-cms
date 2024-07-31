//import {SnapshotHistoryAction} from "../actions.js";
import actions from "../actions.js";
import {EditableSnapshot} from "../actions.js";
import {getOwnedEditableContent} from "../nested_component_editor.js";

const ctClassMatcher = /\bce-element[^\s]*\b/g;

function purgeTagsFromContentTools(el) {
  el.className = el.className.replace(ctClassMatcher, '').trim();
  el.removeAttribute('contenteditable');
  for (let child of el.children) {
    purgeTagsFromContentTools(child);
  }
}

function getNormalizedHtml(el) {
  const clone = el.cloneNode(true);

  purgeTagsFromContentTools(clone);
  return clone.innerHTML;
}

export class ContentToolsWatcher {
  constructor(layout) {
    this.layout = layout;
  }

  watch() {
    if (this.layout.isActive()) {
      this.layout.components.forEach(this.watchComponent.bind(this));
      setTimeout(this.watch.bind(this), 250);
    }
  }

  watchComponent(component) {
    const editables = getOwnedEditableContent(component);

    editables.forEach(editable => {
      if (!editable.$snapshotPending) {
        const newValue = getNormalizedHtml(editable);
        const oldValue = editable.$snapshot;

        if (oldValue === undefined) {
          editable.$snapshot = newValue;
        } else if (newValue != oldValue) {
          this.scheduleSnapshot(component, editable, newValue, oldValue);
        }
      }
    });
    component.components?.forEach(this.watchComponent.bind(this));
  }

  scheduleSnapshot(component, editable, newValue, oldValue) {
    editable.$snapshotPending = true;
    setTimeout(() => {
      const freshValue = getNormalizedHtml(editable);
      const action = new EditableSnapshot(
        component, editable, oldValue, freshValue
      );

      action.state = 1;
      editable.$snapshotPending = false;
      if (action.oldValue == freshValue || action.isSame(actions.currentAction())) {
        console.log("Skipping snapshot action", action, action.oldValue == freshValue, action.isSame(actions.currentAction()));
        editable.$snapshot = freshValue;
        return ;
      } else if (freshValue == newValue) {
        editable.$snapshot = freshValue;
        actions.store(action);
      } else {
        this.scheduleSnapshot(component, editable, freshValue, oldValue);
      }
    }, 500);
  }
}

export default function (iframe) {
  const ContentTools = iframe.contentWindow.Cms.ContentTools;
  const History = class extends ContentTools.History {
    canRedo() {
      return actions.canRedo();
    }

    canUndo() {
      return actions.canUndo();
    }

    length() {
      return actions.length();
    }

    redo() {
      return this.snapshot();
    }

    undo() {
      return this.snapshot();
    }
  }

  return History;
}
