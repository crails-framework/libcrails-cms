import {Action} from "./controls.js";
import {ComponentInsertAction} from "./actions.js";
import {makeInsertAnchorHighlightPanels} from "./insert_anchor_highlight_panel.js";

export default function(anchor, target) {
  const controller = target.layout.anchors;
  const highlightPanel = makeInsertAnchorHighlightPanels(anchor);

  return new Action("move", function() {
    const action = new ComponentInsertAction(
      target, anchor.parent, anchor.nextSibling
    );

    action.run();
    //controller.disable();
    controller.scheduleAnchorsUpdate();
  }).withHoverCallback(function(hovered, action) {
    if (hovered)
      action.root.parentElement.appendChild(highlightPanel);
    else
      highlightPanel.remove();
    highlightPanel.classList.toggle("active", hovered);
  });
}
