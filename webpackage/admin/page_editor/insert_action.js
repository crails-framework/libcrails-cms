import {ComponentInsertAction} from "./actions.js";
import {makeInsertAnchorHighlightPanels} from "./insert_anchor_highlight_panel.js";

export default function(anchor, target) {
  const controller = target.layout.anchors;
  const highlightPanel = makeInsertAnchorHighlightPanels(anchor);

  return {
    commit() {
      const action = new ComponentInsertAction(
        target, anchor.parent, anchor.nextSibling
      );

      action.run();
      controller.scheduleAnchorsUpdate();
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
