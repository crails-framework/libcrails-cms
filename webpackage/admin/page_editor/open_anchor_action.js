export default function(anchor, target) {
  const controller = anchor.component.layout.anchors;

  return {
    commit() {
      controller.changeContext(anchor.newContext);
    }
    // No onHover needed: the anchor zone itself is the persistent
    // highlight over the nested component, and it brightens on hover
    // purely through CSS (see .anchor-zone:hover / .anchor-zone.hovered).
  };
}
