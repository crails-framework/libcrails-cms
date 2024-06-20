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

function addColumnProperty(gridModel, sizeKey, self) {
  const name = `column${sizeKey}Span`;
  const sizeId = gridModel.sizes[sizeKey];

  self.properties[name] = {
    category: "grid",
    position: self.gridModel.sizes[sizeKey],
    min: 1, max: gridModel.maxColumns,
    target: self,
    getter: () => {
      return gridModel.spanForElement(self.root, sizeId);
    },
    setter: (value) => {
      if (value != null)
        gridModel.updateElementSpan(self.root, sizeId, value);
      else
        gridModel.unsetElementSpan(self.root, sizeId);
    },
    optional: true
  };
}

function GridComponentEditor(parentClass = ComponentEditor) {
  return class extends parentClass {
    constructor(parent, element, components) {
      super(parent, element, components);
      this.gridModel = GridComponentEditor.model;
    }

    initializeColumnProperties() {
      for (let sizeKey in Object.keys(this.gridModel.sizes)) {
        addColumnProperty(this.gridModel, sizeKey, this);
      }
    }

    initializeProperties() {
      if (isGridContainer(this.parent, this.gridModel))
        this.initializeColumnProperties();
      super.initializeProperties();
    }

    get columnSpan() {
      return this.gridModel.currentSpanForElement(this.root);
    }

    set columnSpan(value) {
      this.gridModel.updateElementCurrentSpan(this.root, value);
    }

    resetColumnSpan() {
      this.gridModel.resetElementSizes(this.root);
    }

    create() {
      this.columnSpan = this.gridModel.maxColumns;
      super.create();
    }
  };
}

GridComponentEditor.sizes = {
  Small: 3, Medium: 2, Large: 1, VeryLarge: 0
};

GridComponentEditor.Model = class {
  set currentSize(value) {
    GridComponentEditor.currentSize = value;
  }
  get currentSize() {
    return GridComponentEditor.currentSize == undefined
      ? GridComponentEditor.sizes.Medium
      : GridComponentEditor.currentSize;
  }
  get sizes() { return GridComponentEditor.sizes; }
  get maxColumns() { return 12; }
  get gridClassList() { return ["pure-g"]; }
  get componentClassPattern() { return /^pure-u-(sm|md|lg|xxl)-([0-9]+)-([0-9]+)/; }
  mediaSizeName(value) { return ['xxl', 'lg', 'md', 'sm'][value]; }
  sizeFromMediaName(value) {
    return {
      'sm': this.sizes.Small, 'md': this.sizes.Medium,
      'lg': this.sizes.Large, 'xxl': this.sizes.VeryLarge
    }[value];
  }
  extractSizeAndSpanFromClassMatch(match) {
    return { media: match[1], span: parseInt(match[2]) / parseInt(match[3]) };
  }
  sizesForComponent(component) {
    return this.sizesForElement(component.root);
  }
  sizesForElement(element) {
    const list = {};
    element.classList.forEach(className => {
      const match = this.componentClassPattern.exec(className);
      if (match !== null) {
        const { media, span } = this.extractSizeAndSpanFromClassMatch(match);
        const key = this.sizeFromMediaName(media);
        const value = span * this.maxColumns;
        if (key) { list[key] = value; }
      }
    });
    return list;
  }
  currentSpanForElement(element) {
    return this.spanForElement(element, this.currentSize);
  }
  spanForElement(element, sizeId) {
    const sizes = this.sizesForElement(element);
    const value = sizes[sizeId];
    return value || this.maxColumns;
  }
  unsetElementSpan(element, sizeId) {
    const sizes = this.sizeForElement(element);
    delete sizes[sizeId];
    this.updateElementSizes(sizes);
  }
  updateElementCurrentSpan(element, span) {
    this.updateElementSpan(element, this.currentSize, span);
  }
  updateElementSpan(element, size, span) {
    const sizes = this.sizesForElement(element);
    sizes[size] = span;
    if (!sizes[GridComponentEditor.sizes.Small]) {
      sizes[GridComponentEditor.sizes.Small] = this.maxColumns;
    }
    this.updateElementSizes(element, sizes);
  }
  updateElementSizes(element, sizes) {
    this.resetElementSizes(element);
    for (let key in sizes) {
      const sizeName = this.mediaSizeName(key);
      element.classList.add(this.classNameForSpan(sizeName, sizes[key]));
    }
  }
  classNameForSpan(media, span) {
    const ratio = (span / this.maxColumns) * 24;
    if (ratio == 24)
      return `pure-u-${media}-1-1`;
    return `pure-u-${media}-${ratio}-24`;
  }
  resetElementSizes(element) {
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
