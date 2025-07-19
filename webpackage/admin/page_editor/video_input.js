import Style from "../../style.js";
import FilePicker from "../file_picker.js";
import SortableTable from "../sortable_table.js";
import GridComponentEditor from "./grid_component_editor.js";

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
  const gridModel = GridComponentEditor.model;
  const row = document.createElement("tr");
  const dragColumn = document.createElement("td");
  const nameColumn = document.createElement("td");
  const displayColumn = document.createElement("td");
  const mimeColumn = document.createElement("td");
  const controlsColumn = document.createElement("td");

  nameColumn.textContent = file.name;
  mimeColumn.textContent = file.mimetype;
  dragColumn.innerHTML = '<span class="drag-handle"></span>';
  makeRowControls(handle, file, row, controlsColumn);
  displayColumn.appendChild(gridModel.createDisplaySelect());
  row.appendChild(dragColumn);
  row.appendChild(displayColumn);
  row.appendChild(mimeColumn);
  row.appendChild(nameColumn);
  row.appendChild(controlsColumn);
  row.dataset.type = "file";
  row.$url = file.url;
  return row;
}

function updateValue(handle) {
  const input = handle.input;
  const rows = handle.tbody.querySelectorall("tr[data-type='file']");
  const array = [];

  for (let row of rows) {
    const displaySelect = row.querySelector("[data-type='grid-display.select']");
    array.push({
      url: row.$url,
      mimetype: row.querySelector("td[data-type='mimetype']").textContent,
      display: displaySelect.options[displaySelect.selectedIndex].value
    });
  }
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
