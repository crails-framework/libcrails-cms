import {makeInsertAnchorHighlightPanels} from "./insert_anchor_highlight_panel.js";
import ComponentTypePicker from "./component_type_picker.js";

export default function(anchor) {
  const componentEditor = anchor.parent;
  const highlightPanel = makeInsertAnchorHighlightPanels(anchor);
  const types = Object.keys(componentEditor.componentTypes);
  const callback = function(componentType) {
    anchor.parent.addComponent(componentType, anchor.nextSibling).then(component => {
      Cms.PageEditor.Toolbar.setActiveComponent(component);
    });
    window.pageEditor.closeComponentAdder();
  };

  return {
    commit() {
      if (types.length > 1) {
        const dialog = new ComponentTypePicker();

        dialog.render(componentEditor, callback);
        dialog.open();
      } else {
        callback(types[0]);
      }
    },
    onHover(hovered, marker) {
      if (hovered)
        marker.root.parentElement.appendChild(highlightPanel);
      else
        highlightPanel.remove();
      highlightPanel.classList.toggle("active", hovered);
    }
  };
}
