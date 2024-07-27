import {Action} from "./controls.js";
import i18n from "../../i18n.js";

export default function(anchor, target) {
  const controller = target.layout.anchors;
  return new Action("move", function() {
    anchor.parent.insertComponent(target, anchor.nextSibling);
    //controller.disable();
    controller.scheduleAnchorsUpdate();
  });
}
