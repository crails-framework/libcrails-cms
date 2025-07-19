export function makeHighlightPanel(root, relativePosition) {
  const highlightPanel = document.createElement("div");
  const rect = root.getBoundingClientRect();
  const style = highlightPanel.style;

  highlightPanel.classList.add("highlight-panel");
  if (relativePosition)
    highlightPanel.classList.add(`insert-${relativePosition}-anchor-action`);
  style.top = `${rect.top}px`;
  style.left = `${rect.left}px`;
  style.height = `${rect.height}px`;
  style.width = `${rect.width}px`;
  return highlightPanel;
}

export function makeInsertAnchorHighlightPanels(anchor) {
  const container = document.createElement("div");
  const afterComponent = anchor.component;
  const beforeComponent = anchor.component.previousComponent;

  if (anchor.previousSibling)
    container.appendChild(makeHighlightPanel(anchor.previousSibling, "after"));
  if (anchor.nextSibling)
    container.appendChild(makeHighlightPanel(anchor.nextSibling, "before"));
  if (!anchor.previousSibling && !anchor.nextSibling)
    return makeHighlightPanel(anchor.component.container || anchor.component.root);
  return container;
}
