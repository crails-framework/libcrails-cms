import {Action} from "./controls.js";
import {makeInsertAnchorHighlightPanels} from "./insert_anchor_highlight_panel.js";
import ComponentTypePicker from "./component_type_picker.js";

function createAddComponentAction(list, anchor, componentEditor, callback) {
  const highlightPanel = makeInsertAnchorHighlightPanels(anchor);
  const types = Object.keys(componentEditor.componentTypes);

  return new Action("add", function() {
    if (types.length > 1) {
      const dialog = new ComponentTypePicker();

      dialog.render(componentEditor, callback);
      dialog.open();
    } else {
      callback(types[0]);
    }
  }).withHoverCallback(function(hovered, action) {
    if (hovered)
      action.root.parentElement.appendChild(highlightPanel);
    else
      highlightPanel.remove();
    highlightPanel.classList.toggle("active", hovered);
  });
}

export default function(anchor) {
  return createAddComponentAction(this, anchor, anchor.parent, function(componentType) {
    anchor.parent.addComponent(componentType, anchor.nextSibling).then(component => {
      Cms.PageEditor.Toolbar.setActiveComponent(component);
    });
    pageEditor.closeComponentAdder();
  });
}
