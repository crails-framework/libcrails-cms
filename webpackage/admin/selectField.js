import TomSelect from "tom-select/dist/js/tom-select.base.js";
import TomSelect_remove_button from 'tom-select/dist/js/plugins/remove_button.js';
import i18n from "../i18n.js";

TomSelect.define("remove_button", TomSelect_remove_button);

window.myTomSelect = TomSelect;

export default function create(selector = "#tagPicker") {
  return i18n.ready.then(function() {
    return new TomSelect(selector, {
      createOnBlur: true,
      create: true,
      plugins: {
        remove_button: {
          title: i18n.t("tomSelect.removeItem")
        }
      }
    });
  });
}
