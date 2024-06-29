import Style from "../../style.js";
import FilePicker from "../file_picker.js";
import SortableTable from "../sortable_table.js";
import {setActionInnerHTML} from "./controls.js";

function makeRowControls(handle, file, row, column) {
  const upButton = document.createElement("button");
  const downButton = document.createElement("button");
  const removeButton = document.createElement("button");

  Style.ready.then(function() {
    Style.apply("dangerButton", removeButton);
  });
  setActionInnerHTML(removeButton, "remove");
  column.appendChild(removeButton);
  removeButton.addEventListener("click", event => {
    event.preventDefault();
    handle.remove(row);
  });
}

function makeRow(handle, file) {
  const row = document.createElement("tr");
  const dragColumn = document.createElement("td");
  const nameColumn = document.createElement("td");
  const previewColumn = document.createElement("td");
  const controlsColumn = document.createElement("td");
  const preview = document.createElement("img");

  preview.src = file.miniature_url;
  nameColumn.textContent = file.name;
  dragColumn.innerHTML = '<span class="drag-handle"></span>';
  makeRowControls(handle, file, row, controlsColumn);
  previewColumn.appendChild(preview);
  row.appendChild(dragColumn);
  row.appendChild(previewColumn);
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
    console.log("Failde to load multiple-picture-input value:", err);
    console.log(handle.input.value);
  }
}

export default class {
  constructor(input, filePicker) {
    const addButton = makeAppendButton(this);

    this.input = input;
    this.table = document.createElement("table");
    this.tbody = document.createElement("tbody");
    this.table.appendChild(this.tbody);
    this.table.classList.add("multiple-picture-input");
    this.table.dataset.dragHandle = "drag-handle";
    this.sortableTable = new SortableTable(this.table);
    this.sortableTable.onSwappedRows = this.onSwappedRows.bind(this);
    this.filePicker = filePicker || (new FilePicker({
      title: i18n.t("admin.image-library"),
      mimetype: "image/*"
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
    this.filePicker.open();
  }

  addFile(file) {
    const row = makeRow(this, file);
    this.tbody.appendChild(row);
    updateValue(this);
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
