//import {SnapshotHistoryAction} from "../actions.js";
import actions from "../actions.js";
import {EditableSnapshot} from "../actions.js";
import {getOwnedEditableContent} from "../nested_component_editor.js";

function normalizeHtml(html) {
  ['over', 'focused'].forEach(fragment => {
    html = html.replaceAll(` ce-element--${fragment}`, "");
  });
  return html.replace(/\s*contenteditable(="")?/g, "");;
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
        const newValue = normalizeHtml(editable.innerHTML);
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
      const freshValue = normalizeHtml(editable.innerHTML);
      const action = new EditableSnapshot(
        component, editable, oldValue, freshValue
      );

      action.state = 1;
      editable.$snapshotPending = false;
      if (action.oldValue == freshValue || action.isSame(actions.currentAction())) {
        console.log("Skipping snapshot action", action, action.oldValue == freshValue, action.isSame(actions.currentAction()));
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
    constructor(regions) {
      super(regions);
    }

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
      actions.redo();
      return this.snapshot();
    }

    undo() {
      actions.undo();
      return this.snapshot();
    }

    goTo(index) {
      actions.goTo(index);
      return this.snapshot();
    }

    goToSnapshot(snapshotIndex) {
      super.goTo(snapshotIndex);
    }
/*
    _store() {
      super._store();
      if (actions.lastUpdate + 2500 < Date.now()) {
        //console.log("-> New snapshot action", Date.now());
        //actions.store(
        //  new SnapshotHistoryAction(this, this._snapshotIndex)
        //);
      }
    }
*/
  }

  return History;
}
