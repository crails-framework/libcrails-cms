// The Layout must define window.cmsConfigureIconPicker(picker, definition),
// called once on the shared picker instance to set `iconLibraries` and
// `iconLibrariesCss` (e.g. via picker.setOptions()).

import i18n from "../../i18n.js";
import Style from "../../style.js";
import "@migliori/universal-icon-picker/assets/js/universal-icon-picker.js";

const TRIGGER_ID = "cms-icon-picker-trigger";
let shared = null;          // { picker, trigger }, created once
let pendingHandler = null;  // who gets the next onSelect

// parse -> outerHTML; components must use the same normalization.
export function normalizeIconHtml(html) {
  const template = document.createElement("template");

  template.innerHTML = (html || "").trim();
  return template.content.firstElementChild?.outerHTML || "";
}

// The picker binds to a trigger element by selector and appends a modal to the
// body per instance, so a single hidden trigger + one instance is shared by
// every property editor instead of leaking one picker per selected component.
function ensurePicker(definition) {
  if (shared)
    return shared;
  const trigger = document.createElement("button");
  let picker;

  trigger.type = "button";
  trigger.id = TRIGGER_ID;
  trigger.hidden = true;
  document.body.appendChild(trigger);
  picker = new UniversalIconPicker(`#${TRIGGER_ID}`, {
    onSelect: function(data) {
      const handler = pendingHandler;

      pendingHandler = null;
      if (handler)
        handler(normalizeIconHtml(data.iconHtml));  // iconHtml is null for "no icon"
    }
  });
  if (typeof window.cmsConfigureIconPicker == "function")
    window.cmsConfigureIconPicker(picker, definition);
  else
    console.warn("window.cmsConfigureIconPicker is not defined: the icon picker has no icon libraries");
  shared = { picker, trigger };
  return shared;
}

function openIconPicker(definition, handler) {
  const instance = ensurePicker(definition);

  if (instance) {
    pendingHandler = handler;
    instance.trigger.click();
  }
}

export default function makeIconPickerInput(inputGroup, input, definition) {
  const preview = document.createElement("span");
  const chooseButton = document.createElement("button");
  const clearButton = document.createElement("button");
  const update = function() {
    if (input.value)
      preview.innerHTML = input.value;
    else
      preview.textContent = i18n.t("admin.page-editor.no-value");
    clearButton.disabled = !input.value;
  };
  const setValue = function(value) {
    input.value = value;
    update();
    input.dispatchEvent(new Event("change"));
  };

  input.type = "hidden";
  Style.apply("badge", preview);
  [chooseButton, clearButton].forEach(button => {
    Style.apply("button", button);
    button.type = "button";
  });
  chooseButton.textContent = i18n.t("admin.page-editor.icon-picker.choose");
  clearButton.textContent = i18n.t("admin.page-editor.icon-picker.clear");
  chooseButton.addEventListener("click", function(event) {
    event.preventDefault();
    openIconPicker(definition, setValue);
  });
  clearButton.addEventListener("click", function(event) {
    event.preventDefault();
    setValue("");
  });
  inputGroup.appendChild(preview);
  inputGroup.appendChild(chooseButton);
  inputGroup.appendChild(clearButton);
  // Instantiating loads the icon fonts' CSS, needed for the preview.
  ensurePicker(definition);
  update();
}
