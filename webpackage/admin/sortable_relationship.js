import SortableTable from "./sortable_table.js";

export default class SortableRelationship extends SortableTable {
  constructor(table) {
    super(table);
    this.dragHandleClass = 'drag-handle';
  }

  onSwappedRows(row1, row2) {
    const payload = {
      "row-id": row1.dataset.id,
      "position": this.getRowIndex(row2)
    };
    const action = `${this.table.dataset.action}?row-id=${payload["row-id"]}&position=${payload["position"]}`;

    if (payload.position == this.getRowIndex(row1))
      return super.onSwappedRows();
    return fetch(action, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      return response.ok;
    });
  }
}

SortableRelationship.loadFromElements = function(selector) {
  const list = [];
  document.querySelectorAll(selector).forEach(table => {
    list.push(new SortableRelationship(table));
  });
  window._sortableRelationships = list;
}
