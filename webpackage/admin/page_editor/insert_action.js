import {Action} from "./controls.js";
import {ComponentInsertAction} from "./actions.js";
import i18n from "../../i18n.js";

export default function(anchor, target) {
  const controller = target.layout.anchors;
  return new Action("move", function() {
    const action = new ComponentInsertAction(
      target, anchor.parent, anchor.nextSibling
    );

    action.run();
    //controller.disable();
    controller.scheduleAnchorsUpdate();
  });
}
