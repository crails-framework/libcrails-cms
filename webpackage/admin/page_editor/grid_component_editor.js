import ComponentEditor from "./component_editor.js";

function isGridContainer(component, gridModel) {
  if (component) {
    for (let classname of gridModel.gridClassList) {
      if (!component.container.classList.contains(classname))
        return false;
    }
    return true;
  }
  return false;
}

function GridComponentEditor(parentClass = ComponentEditor) {
  return class extends parentClass {
    constructor(parent, element, components) {
      super(parent, element, components);
      this.gridModel = GridComponentEditor.model;
    }

    initializeProperties() {
      if (isGridContainer(this.parent, this.gridModel)) {
        this.properties.columnSpan = {
          category: "grid",
          type: "range", min: 1, max: this.gridModel.maxColumns, target: this, attribute: "columnSpan"
        };
      }
      super.initializeProperties();
    }

    get columnSpan() {
      return parseInt(this.root.dataset.columnSpan);
    }

    set columnSpan(value) {
      this.root.dataset.columnSpan = value;
      this.resetColumnSpan();
      this.gridModel.componentClassList(value).forEach(klass => {
        this.root.classList.add(klass);
      });
    }

    resetColumnSpan() {
      this.gridModel.resetColumnSpan(this.root);
    }

    create() {
      this.columnSpan = this.gridModel.maxColumns;
      super.create();
    }
  };
}

GridComponentEditor.Model = class {
  get maxColumns() { return 12; }
  get gridClassList() { return ["pure-g"]; }
  get componentClassPattern() { return /^pure-u/; }
  componentClassList(span) {
    const ratio = 24 / this.maxColumns;
    return [`pure-u-md-${span * ratio}-24`, 'pure-u-sm-1-1'];
  }
  componentClassListByRatio(ratio) {
    return this.componentClassList(this.maxColumns * ratio);
  }
  resetColumnSpan(element) {
    let i = 0;
    while (i < element.classList.length) {
      const klass = element.classList[i];
      if (klass.match(this.componentClassPattern) != null)
        element.classList.remove(klass);
      else
        i++;
    }
  }
};

GridComponentEditor.model = new GridComponentEditor.Model();

GridComponentEditor.decorateContainer = function(element) {
  GridComponentEditor.model.gridClassList.forEach(
    element.classList.add.bind(element.classList)
  );
};

export default GridComponentEditor;
