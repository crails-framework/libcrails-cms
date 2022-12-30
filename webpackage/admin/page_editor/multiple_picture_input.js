import Style from "../../style.js";
import FilePicker from "../file_picker.js";
import {setActionInnerHTML} from "./controls.js";

function makeRowControls(handle, file, row, column) {
  const upButton = document.createElement("button");
  const downButton = document.createElement("button");
  const removeButton = document.createElement("button");

  [upButton, downButton, removeButton].forEach(button => Style.apply("button", button));
  setActionInnerHTML(upButton, "up");
  column.appendChild(upButton);
  setActionInnerHTML(downButton, "down");
  column.appendChild(downButton);
  setActionInnerHTML(removeButton, "remove");
  column.appendChild(removeButton);
  upButton.addEventListener("click", event => {
    event.preventDefault();
    handle.moveUp(row);
  });
  downButton.addEventListener("click", event => {
    event.preventDefault();
    handle.moveDown(row);
  });
  removeButton.addEventListener("click", event => {
    event.preventDefault();
    handle.remove(row);
  });
}

function makeRow(handle, file) {
  const row = document.createElement("tr");
  const nameColumn = document.createElement("td");
  const previewColumn = document.createElement("td");
  const controlsColumn = document.createElement("td");
  const preview = document.createElement("img");

  preview.src = file.miniature_url;
  nameColumn.textContent = file.name;
  makeRowControls(handle, file, row, controlsColumn);
  previewColumn.appendChild(preview);
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
  const rows = handle.table.querySelectorAll("tr[data-type='file']");
  const array = [];

  for (let row of rows)
    array.push(row.$file);
  input.value = JSON.stringify(array);
}

function loadValue(handle) {
  try {
    const value = JSON.parse(handle.input.value);

    value.forEach(handle.addFile.bind(handle));
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
    this.table.classList.add("multiple-picture-input");
    this.filePicker = filePicker || (new FilePicker());
    input.type = "hidden";
    input.parentElement.insertBefore(addButton, input);
    input.parentElement.insertBefore(this.table, addButton);
    loadValue(this);
  }

  pick() {
    this.filePicker.plugin = { filePicked: this.addFile.bind(this) };
    this.filePicker.open();
  }

  addFile(file) {
    const row = makeRow(this, file);
    this.table.insertBefore(row, this.table.lastElementChild);
    updateValue(this);
  }

  moveUp(row) {
    this.table.insertBefore(row, row.previousElementSibling);
    updateValue(this);
  }

  moveDown(row) {
    this.table.insertBefore(row, row.nextElementSibling.nextElementSibling);
    updateValue(this);
  }

  remove(row) {
    this.table.removeChild(row);
    updateValue(this);
  }
}
