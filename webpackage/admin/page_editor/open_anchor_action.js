import {Action} from "./controls.js";
import {makeHighlightPanel} from "./insert_anchor_highlight_panel.js";

export default function(anchor, target) {
  const controller = anchor.component.layout.anchors;
  const action = new Action("open", function() {
    controller.changeContext(anchor.newContext);
  });
  const highlightPanel = makeHighlightPanel(anchor.newContext.root);

  action.withHoverCallback(function(hovered) {
    if (hovered)
      action.root.parentElement.appendChild(highlightPanel);
    else
      highlightPanel.remove();
    highlightPanel.classList.toggle("active", hovered);
  });
  return action;
}
