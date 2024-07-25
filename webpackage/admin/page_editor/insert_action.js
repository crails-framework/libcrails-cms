import {Action} from "./controls.js";

export default function(anchor, target) {
  return new Action("insert", function() {
    anchor.parent.insertComponent(target, anchor.nextSibling);
  });
}
