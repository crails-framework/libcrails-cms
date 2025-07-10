import {ComponentPropertyAction} from "./actions.js";
import i18n from "../../i18n.js";
import FilePicker from "../file_picker.js";
import UrlPicker from "../url_picker.js";
import MultiplePictureInput from "./multiple_picture_input.js";
import Style from "../../style.js";

const filePicker = new FilePicker({
  mimetype: "image/*"
});

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

function makeFilePickerInput(input) {
  const button = document.createElement("button");

  Style.apply("button", button);
  button.textContent = i18n.t("admin.image-library");
  button.addEventListener("click", function(event) {
    event.preventDefault();
    filePicker.title = i18n.t("admin.image-library");
    filePicker.plugin.filePicked = function(file) {
      input.value = file.url;
    };
    filePicker.open();
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
    const title = document.createElement("div");
    const content = document.createElement("div");

    //content.appendChild(title);
    this.component = component;
    this.content = content;
    title.classList.add("popup-title");
    title.textContent = i18n.t("admin.page-editor.property-editor");
    content.classList.add("page-property-editor");
    Style.apply("form", content);
    this.inputs = {};
    for (let property in component.properties) {
      const formGroup = document.createElement("div");
      const label = document.createElement("label");
      const inputGroup = document.createElement("div");
      const input = document.createElement("input");
      const value = component.propertyValue(property);

      Style.apply("formGroup", formGroup);
      formGroup.classList.add("property");
      formGroup.classList.add(`property-${property}`);
      label.dataset.type = component.properties[property].type;
      label.textContent = i18n.tt(
        `admin.page-editor.properties.${component.component_type}.${property}`,
        `admin.page-editor.properties.${property}`
      );
      input.value = value;
      inputGroup.classList.add("input-group");
      inputGroup.appendChild(input);
      switch (component.properties[property].type) {
      case "href":
      case "link":
        inputGroup.appendChild(makeUrlPickerInput(input));
        break ;
      case "image":
      case "picture":
        inputGroup.appendChild(makeFilePickerInput(input));
        break ;
      case "gallery":
      case "images":
      case "pictures":
        new MultiplePictureInput(input);
        break ;
      case "bool":
      case "boolean":
        makeCheckboxInput(input, label);
        input.checked = component.propertyValue(property);
        break ;
      case "color":
        input.type = "color";
        Style.apply("button", input);
        break ;
      case "number":
        input.type = "number";
        input.min = component.properties[property].min;
        input.max = component.properties[property].max;
        break ;
      case "range":
        makeRangeInput(inputGroup, input, component.properties[property]);
        break ;
      case "select":
        makeSelectInput(inputGroup, input, component.properties[property]);
        break ;
      }
      if (component.properties[property].optional)
        makeOptionalInput(inputGroup, input, value);
      formGroup.appendChild(label);
      formGroup.appendChild(inputGroup);
      content.appendChild(formGroup);
      this.inputs[property] = input;
    }
    component.layout.toolbar.setControls(content);
    if (typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(content);
    this.scheduleAutoUpdate();
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

