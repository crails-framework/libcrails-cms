import i18n from "../../i18n.js";
import ProudCmsDialog from "../dialog.js";
import FilePicker from "../file_picker.js";
import MultiplePictureInput from "./multiple_picture_input.js";
import Style from "../../style.js";

const filePicker = new FilePicker({
  mimetype: "image/*"
});

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

function makeOptionalInput(inputGroup, input, value) {
  const wrapper = document.createElement("span");
  const checkbox = document.createElement("input");
  const update = function() { input.disabled = !checkbox.checked; };

  inputGroup.classList.add("optional");
  inputGroup.insertBefore(wrapper, input);
  wrapper.classList.add("optional-checkbox");
  wrapper.appendChild(checkbox);
  makeCheckboxInput(checkbox);
  checkbox.checked = value && (typeof value !== "string" || value.length > 0) && value !== "null";
  checkbox.addEventListener("change", update);
  update();
}

export default class extends ProudCmsDialog {
  constructor(component) {
    const title = document.createElement("div");
    const confirmButton = document.createElement("button");
    const content = document.createElement("div");
    const controls = document.createElement("div");

    Style.apply("modalContent", content);
    Style.apply("modalControls", controls);
    content.appendChild(title);
    controls.appendChild(confirmButton);
    super();
    this.component = component;
    title.classList.add("popup-title");
    title.textContent = i18n.t("admin.page-editor.property-editor");
    confirmButton.textContent = i18n.t("admin.confirm");
    this.popup.appendChild(content);
    this.popup.appendChild(controls);
    this.popup.classList.add("page-property-editor");
    Style.apply("form", this.popup);
    Style.apply("confirmButton", confirmButton);
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
    confirmButton.addEventListener("click", this.accepted.bind(this));
    this.open();
    if (typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(this.popup);
  }

  accepted() {
    for (let property in this.inputs) {
      let value = this.inputs[property].value;

      if (this.inputs[property].disabled)
        value = null;
      else if (this.inputs[property].type == "checkbox")
        value = this.inputs[property].checked;
      this.component.updateProperty(property, value);
    }
    this.close();
  }
}

