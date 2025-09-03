import Style from "../../style.js";
import FilePicker from "../file_picker.js";
import SortableTable from "../sortable_table.js";
import GridComponentEditor from "./grid_component_editor.js";
import {setActionInnerHTML} from "./controls.js";
import Dialog from "../dialog.js";

class SourceDialog extends Dialog {
  constructor(handle, file, row) {
    super();
    this.handle = handle;
    this.file = file;
    this.row = row;
  }

  open() {
    super.open();
    if (!this.rendered) {
      this.render();
      if (typeof crailscms_on_content_loaded == "function")
        crailscms_on_content_loaded(this.popup);
    }
  }

  renderPreview() {
    const video = document.createElement("video");
    const source = document.createElement("source");

    video.style.margin = "0 auto";
    video.style.maxWidth = "100%";
    video.style.maxHeight = "300px";
    video.controls = true;
    source.type = this.file.mimetype;
    source.src = this.file.url;
    video.appendChild(source);
    return video;
  }

  render() {
    const gridModel = GridComponentEditor.model;
    const displaySelect = gridModel.createDisplaySelect();
    const form = document.createElement("div");
    const title = document.createElement("div");
    const confirmButton = document.createElement("button");
    const displayInput = gridModel.createDisplaySelect(this.file.display);
    const mimetypeInput = document.createElement("input");
    const nameInput = document.createElement("input");
    const controls = document.createElement("div");
    const preview = this.renderPreview();

    title.textContent = i18n.t("admin.page-editor.video-source");
    confirmButton.textContent = i18n.t("admin.confirm");
    Style.apply("modalTitle", title);
    Style.apply("modalControls", controls);
    Style.apply("form", form);
    Style.apply("confirmButton", confirmButton);

    {
      const formGroup = document.createElement("div");
      const label = document.createElement("label");
      const input = nameInput;
      label.textContent = i18n.t("form.label.name");
      input.value = this.file.name;
      if (this.file.name)
        input.classList.add("active");
      Style.apply("formGroup", formGroup);
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      form.appendChild(formGroup);
    }

    {
      const formGroup = document.createElement("div");
      const label = document.createElement("label");
      const input = displayInput;
      label.textContent = i18n.t("admin.page-editor.action.display-size");
      Style.apply("formGroup", formGroup);
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      form.appendChild(formGroup);
    }

    {
      const formGroup = document.createElement("div");
      const label = document.createElement("label");
      const input = mimetypeInput;
      label.textContent = i18n.t("admin.mimetype");
      input.value = this.file.mimetype;
      if (this.file.mimetype)
        input.classList.add("active");
      Style.apply("formGroup", formGroup);
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      form.appendChild(formGroup);
    }

    confirmButton.addEventListener("click", event => {
      event.preventDefault();
      this.file.name = nameInput.value;
      this.file.mimetype = mimetypeInput.value;
      this.file.display = displayInput.value;
      this.onUpdated();
      this.close();
      this.row.querySelector("td.filename").textContent = this.file.name;
      this.updatePreview();
    });

    controls.appendChild(confirmButton);
    this.popup.appendChild(title);
    this.popup.appendChild(form);
    this.popup.appendChild(preview);
    this.popup.appendChild(controls);
    this.preview = preview;
    this.rendered = true;
  }

  updatePreview() {
    const newPreview = this.renderPreview();
    this.popup.insertBefore(newPreview, this.preview);
    this.popup.removeChild(this.preview);
    this.preview = newPreview;
  }

  onUpdated() {}
}

function updateValue(handle) {
  const input = handle.input;
  const rows = handle.tbody.querySelectorAll("tr[data-type='file']");
  const array = [];

  for (let row of rows)
    array.push(row.$file);
  input.value = JSON.stringify(array);
}

function loadValue(handle) {
  try {
    if (handle.input.value) {
      const value = JSON.parse(handle.input.value);

      value.forEach(handle.addFile.bind(handle));
    }
  } catch (err) {
    console.log("Failed to load video-input value:", err);
    console.log(handle.input.value);
  }
}

function makeRowControls(handle, file, row, column) {
  const editDialog = new SourceDialog(handle, file, row);
  const editButton = document.createElement("button");
  const removeButton = document.createElement("button");

  Style.ready.then(function() {
    Style.apply("button", editButton);
    Style.apply("dangerButton", removeButton);
    Style.apply("smallButton", editButton, removeButton);
    Style.apply("buttonGroup", column);
  });
  editDialog.onUpdated = function() {
    updateValue(handle);
  };
  setActionInnerHTML(editButton, "edit");
  column.appendChild(editButton);
  editButton.addEventListener("click", event => {
    event.preventDefault();
    editDialog.open();
  });
  setActionInnerHTML(removeButton, "remove");
  column.appendChild(removeButton);
  removeButton.addEventListener("click", event => {
    event.preventDefault();
    handle.remove(row);
  });
}

function makeRow(handle, file) {
  const gridModel = GridComponentEditor.model;
  const row = document.createElement("tr");
  const dragColumn = document.createElement("td");
  const nameColumn = document.createElement("td");
  const controlsColumn = document.createElement("td");

  nameColumn.classList.add("filename");
  nameColumn.dataset.tooltip = file.name || file.url;
  nameColumn.textContent = file.name || file.url;
  dragColumn.innerHTML = '<span class="drag-handle"></span>';
  makeRowControls(handle, file, row, controlsColumn);
  row.appendChild(dragColumn);
  row.appendChild(nameColumn);
  row.appendChild(controlsColumn);
  row.dataset.type = "file";
  row.$file = file;
  return row;
}

function makeAppendButton(handle) {
  const button = document.createElement("button");

  Style.apply("button", button);
  setActionInnerHTML(button, "add");
  button.addEventListener("click", handle.pick.bind(handle));
  return button;
}

function isAttachedToDom(element) {
  while (element && element != document.body)
    element = element.parentElement;
  return element == document.body;
}

export default class {
  constructor(input, filePicker) {
    const addButton = makeAppendButton(this);

    this.input = input;
    this.table = document.createElement("table");
    this.tbody = document.createElement("tbody");
    this.table.appendChild(this.tbody);
    this.table.classList.add("video-input");
    this.table.dataset.dragHandle = "drag-handle";
    this.sortableTable = new SortableTable(this.table);
    this.sortableTable.onSwappedRows = this.onSwappedRows.bind(this);
    this.filePicker = filePicker || (new FilePicker({
      title: i18n.t("admin.video-library"),
      mimetype: "video/*"
    }));
    input.type = "hidden";
    input.parentElement.insertBefore(addButton, input);
    input.parentElement.insertBefore(this.table, addButton);
    loadValue(this);
  }

  reloadInputValue() {
    loadValue(this);
  }

  pick() {
    this.filePicker.plugin = { filePicked: this.addFile.bind(this) };
    this.filePicker.renderLibrary(this.filePicker.json.files);
    this.filePicker.open();
  }

  addFile(file) {
    const row = makeRow(this, file);
    this.tbody.appendChild(row);
    updateValue(this);
    if (isAttachedToDom(row) && typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(row);
  }

  moveUp(row) {
    this.tbody.insertBefore(row, row.previousElementSibling);
    updateValue(this);
  }

  moveDown(row) {
    this.tbody.insertBefore(row, row.nextElementSibling.nextElementSibling);
    updateValue(this);
  }

  onSwappedRows() {
    setTimeout(() => { updateValue(this); }, 0); // updates the value *after* the DOM has been upated
    return Promise.resolve(true);
  }

  remove(row) {
    this.tbody.removeChild(row);
    updateValue(this);
  }
}
