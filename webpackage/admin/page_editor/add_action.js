import {Action} from "./controls.js";
import Dialog from "../dialog.js";
import Style from "../../style.js";
import i18n from "../../i18n.js";

class ComponentTypePicker extends Dialog {
  render(componentEditor, callback) {
    const title = document.createElement("div");
    const wrapper = document.createElement("div");
    const list = this.renderList(componentEditor);
 
    title.classList.add("popup-title");
    title.textContent = i18n.t("admin.page-editor.component-picker");
    Style.apply("modalContent", wrapper);
    wrapper.classList.add("page-editor-component-picker");
    wrapper.appendChild(title);
    wrapper.appendChild(list);
    this.popup.appendChild(wrapper);
    this.callback = callback;
  }

  renderList(componentEditor) {
    const types = Object.keys(componentEditor.componentTypes);
    const ul = document.createElement("ul");

    for (let type of types) {
      const li = document.createElement("li");
      const title = document.createElement("div");
      const description = document.createElement("div");
      const icon = document.createElement("div");

      Style.apply("card", li);
      li.dataset.type = type.toString();
      title.textContent = i18n.t(`admin.page-editor.components.${type}`);
      title.dataset.role = "title";
      description.textContent = i18n.t(`admin.page-editor.component-descriptions.${type}`);
      description.dataset.role = "description";
      icon.dataset.role = "icon";
      li.appendChild(title);
      li.appendChild(description);
      li.appendChild(icon);
      li.addEventListener("click", this.onPicked.bind(this, type));
      ul.appendChild(li);
    }
    return ul;
  }

  onPicked(type) {
    if (typeof this.callback == "function")
      this.callback(type);
    else
      console.log("ComponentTypePicker without a callback", this);
    this.close();
  }
}

function createAddComponentAction(list, componentEditor, callback) {
  const types = Object.keys(componentEditor.componentTypes);

  return new Action("add", function() {
    if (types.length > 1) {
      const dialog = new ComponentTypePicker();

      dialog.render(componentEditor, callback);
      dialog.open();
    } else {
      callback(types[0]);
    }
  });
}

export default function(anchor) {
  return createAddComponentAction(this, anchor.parent, function(componentType) {
    anchor.parent.addComponent(componentType, anchor.nextSibling).then(component => {
      Cms.PageEditor.Toolbar.setActiveComponent(component);
    });
    pageEditor.closeComponentAdder();
  });
}
