import GridComponentEditor from "./grid_component_editor.js";
import indent from "indent.js";
import HtmlTextArea from "../html_textarea.js";
import FilePicker from "../file_picker.js";
import Style from "../../style.js";
import i18n from "../../i18n.js";

let indentSize;

function createActionButton(name, callback) {
  const button = document.createElement("div");

  button.textContent = name;
  button.addEventListener("click", function(event) {
    event.preventDefault();
    callback();
  });
  return button;
}

export default class extends GridComponentEditor() {
  initializeProperties() {
    this.properties.html = { type: "text", target: this.content, attribute: "innerHTML" };
    super.initializeProperties();
  }

  create() {
    this.content = document.createElement("div")
    this.content.textContent = i18n.t("admin.page-editor.html-editor-placeholder");
    this.root.appendChild(this.content);
    super.create();
  }

  bindElements() {
    this.content = this.root.querySelector(":scope > div");
    this.htmlEditor = this.createContentEditor();
    super.bindElements();
    this.root.addEventListener("dblclick", this.startEditing.bind(this));
  }

  get html() {
    return indent.indent.html(this.content.innerHTML, {
      tabString: ' '.repeat(indentSize)
    });
  }

  set html(value) {
    this.content.innerHTML = value;
  }

  createContentEditor() {
    const wrapper = document.createElement("div");
    const input = document.createElement("textarea");
    const actionGroup = document.createElement("div");
    const actionButtons = [];
    const buttonGroup = document.createElement("div");
    const acceptButton = document.createElement("div");
    const cancelButton = document.createElement("div");
    const editor = new HtmlTextArea(input);

    input.value = this.html;
    actionButtons.push(createActionButton("fullscreen", this.toggleFullscreen.bind(this)));
    actionButtons.push(createActionButton("image", this.insertPicture.bind(this)));
    actionButtons.forEach(button => actionGroup.appendChild(button));
    Style.ready.then(function() {
      Style.apply("buttonGroup", buttonGroup, actionGroup);
      Style.apply("confirmButton", acceptButton);
      Style.apply("dangerButton", cancelButton);
      Style.apply("formInput", input);
      Style.apply("button", ...actionButtons);
    });
    i18n.ready.then(function() {
      acceptButton.textContent = i18n.t("admin.save");
      cancelButton.textContent = i18n.t("admin.cancel");
    });
    wrapper.$editor = editor;
    wrapper.classList.add("html-editor");
    wrapper.appendChild(actionGroup);
    wrapper.appendChild(input);
    wrapper.appendChild(buttonGroup);
    buttonGroup.appendChild(acceptButton);
    buttonGroup.appendChild(cancelButton);
    acceptButton.addEventListener("click", this.endEditing.bind(this, true));
    cancelButton.addEventListener("click", this.endEditing.bind(this, false));
    editor.replaceTextArea();
    editor.updateCode();
    return wrapper;
  }

  insertPicture() {
    new FilePicker({
      title: Cms.i18n.t("admin.image-library"),
      mimetype: "image/*",
      filePicked: file => {
        this.htmlEditor.$editor.insert(`<img src="${file.url}" />`);
      }
    }).open();
  }

  get fullscreenEnabled() {
    return this.htmlEditor.parentElement && this.htmlEditor.parentElement.classList.contains("fullscreen-component");
  }

  toggleFullscreen() {
    this.fullscreenEnabled ? this.disableFullscreen() : this.enableFullscreen();
  }

  enableFullscreen() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("fullscreen-component");
    wrapper.appendChild(this.htmlEditor);
    document.body.appendChild(wrapper);
  }

  disableFullscreen() {
    const wrapper = document.querySelector(".fullscreen-component");
    if (this.state === "edit")
      this.root.appendChild(this.htmlEditor);
    document.body.removeChild(wrapper);
  }

  startEditing() {
    if (this.state !== "edit") {
      this.state = "edit";
      this.htmlEditor.querySelector("textarea").value = this.html;
      this.root.removeChild(this.content);
      this.root.appendChild(this.htmlEditor);
    }
  }

  endEditing(save, event) {
    if (event) event.preventDefault();
    if (this.state === "edit") {
      if (this.fullscreenEnabled) this.disableFullscreen();
      if (save) this.html = this.htmlEditor.querySelector("textarea").value;
      setTimeout(() => { this.state = "show"; }, 1);
      this.root.removeChild(this.htmlEditor);
      this.root.appendChild(this.content);
    }
  }

  disableEditMode() {
    super.disableEditMode();
    this.endEditing(true);
  }
}
