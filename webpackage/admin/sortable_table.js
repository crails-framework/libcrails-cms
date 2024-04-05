function getStyle(target, styleName) {
  let compStyle = getComputedStyle(target),
      style = compStyle[styleName];

  return style ? style : null;
}

function getMouseCoords(event) {
  return {
      x: event.clientX,
      y: event.clientY
  };
}

function getTargetRowFromDragHandle(target, handleClass) {
  if (target.classList.contains(handleClass))
    return target.closest("tr");
}

function getTargetRow(target) {
  switch (target.tagName.toLowerCase()) {
    case "tr": return target;
    case "td": return target.closest("tr");
  }
}

function isIntersecting(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
            Math.min(min0, max0) <= Math.max(min1, max1);
}

export default class SortableTable {
  constructor(table) {
    this.table = table;
    this.table.classList.add('sortable-table');
    this.tableDraggingClass = 'sortable-table__drag';
    this.draggingClass = 'is-dragging';
    this.dragHandleClass = table.dataset.dragHandle;
    this.tbody = table.querySelector('tbody');
    this.currRow = null;
    this.dragElem = null;
    this.mouseDownX = 0;
    this.mouseDownY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDrag = false;
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  getTargetRow(target) {
    return this.dragHandleClass
      ? getTargetRowFromDragHandle(target, this.dragHandleClass)
      : getTargetRow(target);
  }

  getRowIndex(row) {
    return Array.from(this.tbody.children).indexOf(row);
  }

  onMouseDown(event) {
    if (event.button != 0)
      return true;
    const target = this.getTargetRow(event.target);
    if (target) {
      this.currRow = target;
      this.addDraggableRow(target);
      this.currRow.classList.add(this.draggingClass);

      const coords = getMouseCoords(event);
      this.mouseDownX = coords.x;
      this.mouseDownY = coords.y;
      this.mouseDrag = true;
    }
  }

  onMouseMove(event) {
    if(!this.mouseDrag)
      return;
    const coords = getMouseCoords(event);
    this.mouseX = coords.x - this.mouseDownX;
    this.mouseY = coords.y - this.mouseDownY;
    this.moveRow(this.mouseX, this.mouseY);
  }

  onMouseUp(event) {
    if(!this.mouseDrag)
      return;
    this.currRow.classList.remove(this.draggingClass);
    this.table.removeChild(this.dragElem);
    this.dragElem = null;
    this.mouseDrag = false;
  }

  onSwappedRows(row1, row2) {
    return Promise.resolve(true);
  }

  swapRow(row, index) {
    const currIndex = this.getRowIndex(this.currRow),
          row1 = currIndex > index ? this.currRow : row,
          row2 = currIndex > index ? row : this.currRow;
    this.onSwappedRows(row1, row2).then(success => {
      if (success)
        this.tbody.insertBefore(row1, row2);
    });
  }

  moveRow(x, y) {
    this.dragElem.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";

    const dPos = this.dragElem.getBoundingClientRect(),
          currStartY = dPos.y,
          currEndY = currStartY + dPos.height,
          rows = this.getRows();

    for (let i = 0; i < rows.length; i++) {
      let rowElem = rows[i],
          rowSize = rowElem.getBoundingClientRect(),
          rowStartY = rowSize.y, rowEndY = rowStartY + rowSize.height;

      if (this.currRow !== rowElem && isIntersecting(currStartY, currEndY, rowStartY, rowEndY)) {
        if (Math.abs(currStartY - rowStartY) < rowSize.height / 2)
          this.swapRow(rowElem, i);
      }
    }
  }

  addDraggableRow(target) {
    this.dragElem = target.cloneNode(true);
    this.dragElem.classList.add(this.tableDraggingClass);
    this.dragElem.style.height = getStyle(target, 'height');
    this.dragElem.style.background = getStyle(target, 'backgroundColor');
    for (let i = 0; i < target.children.length; i++) {
      let oldTD = target.children[i],
          newTD = this.dragElem.children[i];
      newTD.style.width = getStyle(oldTD, 'width');
      newTD.style.height = getStyle(oldTD, 'height');
      newTD.style.padding = getStyle(oldTD, 'padding');
      newTD.style.margin = getStyle(oldTD, 'margin');
    }
    this.table.appendChild(this.dragElem);

    const tPos = target.getBoundingClientRect(),
          dPos = this.dragElem.getBoundingClientRect();
    this.dragElem.style.bottom = ((dPos.y - tPos.y) - tPos.height) + "px";
    this.dragElem.style.left = "-1px";
    document.dispatchEvent(new MouseEvent('mousemove',
      { view: window, cancelable: true, bubbles: true }
    ));
  }

  getRows() {
    return this.table.querySelectorAll('tbody tr');
  }
}
