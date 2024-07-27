import {MetaAction, Action} from "./controls.js";

function createAddComponentAction(list, componentEditor, callback) {
  const types = Object.keys(componentEditor.componentTypes);
  if (types.length > 1) {
    const list = new MetaAction("add");

    for (let type of types) {
      list.addAction(new Action(type, function() {
        callback(type);
      }).withText(i18n.t(`admin.page-editor.components.${type}`)));
    }
    return list;
  } else if (types.length > 0) {
    return new Action("add", function() {
      callback(types[0]);
    });
  }
  return null;
}

export default function(anchor) {
  return createAddComponentAction(this, anchor.parent, function(componentType) {
  anchor.parent.addComponent(componentType, anchor.nextSibling);
  pageEditor.closeComponentAdder();
});
}
