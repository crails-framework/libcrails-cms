import {ComponentPropertyAction} from "./actions.js";
import i18n from "../../i18n.js";
import FilePicker from "../file_picker.js";
import UrlPicker from "../url_picker.js";
import InjectorOptionPicker from "../injector_option_picker.js";
import MultiplePictureInput from "./multiple_picture_input.js";
import VideoInput from "./video_input.js";
import Style from "../../style.js";

function makeUrlPickerInput(input) {
  const button = document.createElement("button");

  Style.apply("button", button);
  button.textContent = i18n.t("admin.search");
  button.addEventListener("click", function(event) {
    event.preventDefault();
    const dialog = new UrlPicker(function(url) { input.value = url; });
    dialog.open();
  });
  return button;
}

function makeFilePickerInput(input, title, options) {
  const button = document.createElement("button");

  Style.apply("button", button);
  button.textContent = title;
  button.addEventListener("click", function(event) {
    event.preventDefault();
    const dialog = new FilePicker(options);
    dialog.title = title;
    dialog.plugin.filePicked = function(file) {
      input.value = file.url;
    };
    dialog.open();
  });
  return button;
}

function makeCheckboxInput(input, label) {
  const span = document.createElement("span");

  input.type = "checkbox";
  span.textContent = label ? label.textContent : " ";
  input.parentElement.insertBefore(span, input.nextSibling);
  span.addEventListener("click", function() {
    input.checked = !input.checked;
    input.dispatchEvent(new Event("change"));
  });
}

function makeSelectInput(inputGroup, input, property) {
  const select = document.createElement("select");

  input.type = "hidden";
  property.options.forEach(option => {
    const element = document.createElement("option");
    element.value = typeof option == "object" ? option.value : option;
    element.textContent = typeof option == "object" ? option.text : option; 
    element.selected = option.value == input.value;
    select.appendChild(element);
  });
  select.addEventListener("change", function() {
    const option = select.querySelector("option:checked");
    input.value = option.value;
  });
  inputGroup.appendChild(select);
  input.value = select.value;
}

function makeRangeInput(inputGroup, input, property) {
  const label = document.createElement("span");
  const onUpdate = function() {
    label.textContent = input.max !== undefined
      ? `${input.value} / ${input.max}`
      : input.value;
  };

  Style.apply("badge", label);
  inputGroup.classList.add("range-field");
  input.type = "range";
  input.min = property.min;
  input.max = property.max;
  input.addEventListener("change", onUpdate);
  inputGroup.appendChild(label);
  onUpdate();
}

// Like makeUrlPickerInput, but backed by a per-injector, per-parameter,
// server-resolved list of value/label pairs instead of the site's URL map.
// Used for anything an injector wants to designate dynamically - most
// notably picking a specific Model instance.
function makeInjectorSelectionInput(inputGroup, input, property) {
  const label = document.createElement("span");
  const button = document.createElement("button");
  const updateLabel = function() {
    label.textContent = property.lastLabel || input.value || i18n.t("admin.page-editor.no-value");
  };

  input.type = "hidden";
  Style.apply("badge", label);
  Style.apply("button", button);
  button.textContent = i18n.t("admin.search");
  button.addEventListener("click", function(event) {
    event.preventDefault();
    const dialog = new InjectorOptionPicker(
      property.injectorName,
      property.paramName,
      property.vars ? property.vars() : {},
      function(value, optionLabel) {
        input.value = value;
        property.lastLabel = optionLabel;
        updateLabel();
        input.dispatchEvent(new Event("change"));
      }
    );
    dialog.open();
  });
  inputGroup.appendChild(label);
  inputGroup.appendChild(button);
  updateLabel();
}

function isValueNull(value) {
  switch (typeof value) {
    case 'number':
      return isNaN(value);
    case 'string':
      return value == "" || value == "null";
  }
  return value == null;
}

function makeOptionalInput(inputGroup, input, value) {
  const wrapper = document.createElement("span");
  const checkbox = document.createElement("input");
  const update = function() { input.disabled = !checkbox.checked; };

  inputGroup.classList.add("optional");
  inputGroup.insertBefore(wrapper, input);
  wrapper.classList.add("optional-checkbox");
  wrapper.appendChild(checkbox);
  makeCheckboxInput(checkbox);
  checkbox.checked = !isValueNull(value);
  checkbox.addEventListener("change", update);
  update();
}

export default class {
  constructor(component) {
    const content = document.createElement("div");

    this.component = component;
    this.content = content;
    this.inputs = {};
    this.sections = {};
    content.classList.add("page-property-editor");
    Style.apply("form", content);
    for (let property in component.properties)
      this.appendProperty(content, property, component.properties[property]);
    this.reorderSections();
  }

  // Properties tagged with a `category` (e.g. "grid", "background",
  // "injector") get grouped together under their own heading instead of
  // being interleaved with the rest; untagged properties stay directly in
  // the root of the editor, as before.
  sectionFor(content, category) {
    if (!this.sections[category]) {
      const section = document.createElement("div");
      const heading = document.createElement("div");

      section.classList.add("property-section");
      section.classList.add(`property-section-${category}`);
      heading.classList.add("property-section-title");
      Style.apply("menuHeading", heading);
      heading.textContent = i18n.tt(
        `admin.page-editor.property-categories.${category}`,
        `admin.page-editor.properties.${category}`
      );
      section.appendChild(heading);
      content.appendChild(section);
      this.sections[category] = section;
    }
    return this.sections[category];
  }

  // Sections land in `content` in whatever order their first property
  // happens to be encountered in while iterating component.properties,
  // which is fine for most of them - except the grid layout controls, which
  // read better pinned at the very end no matter where they were built.
  // appendChild on a node that's already attached just moves it, so this is
  // enough to force the order without touching how sections get built.
  reorderSections() {
    ["grid"].forEach(category => {
      if (this.sections[category])
        this.content.appendChild(this.sections[category]);
    });
  }

  appendProperty(content, property, definition) {
    const formGroup = document.createElement("div");
    const label = document.createElement("label");
    const inputGroup = document.createElement("div");
    const input = document.createElement("input");
    const value = this.component.propertyValue(property);
    const target = definition.category ? this.sectionFor(content, definition.category) : content;

    Style.apply("formGroup", formGroup);
    formGroup.classList.add("property");
    formGroup.classList.add(`property-${property}`);
    label.dataset.type = definition.type;
    label.textContent = i18n.tt(
      `admin.page-editor.properties.${this.component.translationGroup}.${property}`,
      `admin.page-editor.properties.${property}`
    );
    input.value = value;
    inputGroup.classList.add("input-group");
    inputGroup.appendChild(input);
    switch (definition.type) {
    case "href":
    case "link":
      inputGroup.appendChild(makeUrlPickerInput(input));
      break ;
    case "video":
      inputGroup.appendChild(
        makeFilePickerInput(input, i18n.t("admin.video-library"), { mimetype: "video/*" })
      );
      break ;
    case "audio":
      inputGroup.appendChild(
        makeFilePickerInput(input, i18n.t("admin.audio-library"), { mimetype: "audio/*" })
      );
      break ;
    case "image":
    case "picture":
      inputGroup.appendChild(
        makeFilePickerInput(input, i18n.t("admin.image-library"), { mimetype: "image/*" })
      );
      break ;
    case "videos":
      new VideoInput(input);
      break ;
    case "gallery":
    case "images":
    case "pictures":
      new MultiplePictureInput(input);
      break ;
    case "bool":
    case "boolean":
      makeCheckboxInput(input, label);
      input.checked = this.component.propertyValue(property);
      break ;
    case "color":
      input.type = "color";
      Style.apply("button", input);
      break ;
    case "number":
      input.type = "number";
      input.min = definition.min;
      input.max = definition.max;
      break ;
    case "range":
      makeRangeInput(inputGroup, input, definition);
      break ;
    case "select":
      makeSelectInput(inputGroup, input, definition);
      break ;
    case "injector-selection":
      makeInjectorSelectionInput(inputGroup, input, definition);
      break ;
    }
    if (definition.optional)
      makeOptionalInput(inputGroup, input, value);
    formGroup.appendChild(label);
    formGroup.appendChild(inputGroup);
    target.appendChild(formGroup);
    this.inputs[property] = input;
  }

  scheduleAutoUpdate() {
    if (this.content.parentElement) {
      setTimeout(this.scheduleAutoUpdate.bind(this), 1500);
      this.apply();
    }
  }

  apply(debug = false) {
    for (let property in this.inputs) {
      const input = this.inputs[property];
      const oldValue = this.component.propertyValue(property);
      let value = input.value;

      if (this.inputs[property].disabled)
        value = null;
      else if (this.inputs[property].type == "checkbox")
        value = this.inputs[property].checked;
      if (isValueNull(value) && isValueNull(oldValue))
        continue ;
      if (value != oldValue) {
        (new ComponentPropertyAction(
          this.component, property, value, oldValue
        )).withInput(input).run();
      }
    }
  }
}
