import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {toWidget} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import proudcmsShareIcon from './icons/share.svg';
import Dialog from './opengraph_dialog.js';
import {createOpenGraphView} from './opengraph.js';

const attributeMap = {
  "url": "data-url",
  "type": "data-type",
  "title": "data-title",
  "description": "data-description",
  "image": "data-image",
  "image:width": "data-image-width",
  "image:height": "data-image-height",
  "image:alt": "data-image-alt",
  "video": "data-video",
  "audio": "data-audio"
};

function collectAttributesFromElement(viewElement) {
  const data = {};

  for (let key in attributeMap) {
    const value = viewElement.getAttribute(attributeMap[key]);

    if (value)
      data[key] = value;
  }
  return data;
}

function generateDatasetFromModel(modelElement) {
  const dataset = {};

  for (let key in attributeMap) {
    const value = modelElement.getAttribute(key);

    if (value)
      dataset[attributeMap[key]] = value;
  }
  return dataset;
}

export default class extends Plugin {
  static toolName = "cmsOpenGraph";

  init() {
    this.defineSchema();
    this.defineConverters();
    this.editor.ui.componentFactory.add(this.constructor.toolName, this.createButton.bind(this));
  }

  defineSchema() {
    const schema = this.editor.model.schema;
    schema.register("opengraphPreview", {
      isObject: true,
      allowWhere: '$block',
      allowAttributes: ['url', 'type', 'title', 'description', 'image', 'imageWidth', 'imageHeight']
    });
  }

  defineConverters() {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("upcast").elementToElement({
      view: { name: "figure", classes: "opengraph-preview" },
      model: (viewElement, { writer: modelWriter }) => {
        return this.createModel(viewElement, modelWriter);
      }
    });
    conversion.for("dataDowncast").elementToElement({
      model: "opengraphPreview",
      view: (modelElement, { writer: viewWriter }) => {
        return this.createElement(modelElement, viewWriter);
      }
    });
    conversion.for("editingDowncast").elementToElement({
      model: "opengraphPreview",
      view: (modelElement, { writer: viewWriter }) => {
        return this.createElement(modelElement, viewWriter, false);
      }
    });
  }

  createModel(viewElement, modelWriter) {
    return modelWriter.createElement("opengraphPreview",
      collectAttributesFromElement(viewElement)
    );
  }

  createElement(modelElement, viewWriter, withLink = true) {
    const attributes = generateDatasetFromModel(modelElement);
    attributes.class = "opengraph-preview";
    const figure = viewWriter.createContainerElement("figure", attributes);
    const wrapper = viewWriter.createRawElement("div", {
      class: "opengraph-preview-content"
    }, function(domElement) {
      domElement.innerHTML = createOpenGraphView(collectAttributesFromElement(figure));
      if (!withLink)
        domElement.children[0].removeAttribute("href");
    });
    viewWriter.insert(viewWriter.createPositionAt(figure, 0), wrapper);
    return toWidget(figure, viewWriter, { label: "opengraph preview widget" });
  }

  createButton() {
    const button = new ButtonView();
    button.set({label: "Embed shared link", icon: proudcmsShareIcon});
    button.on("execute", this.buttonClicked.bind(this));
    return button;
  }

  buttonClicked() {
    const dialog = new Dialog(data => {
      this.appendOpenGraph(data);
      dialog.close();
    });
    dialog.open();
  }

  appendOpenGraph(data) {
    try {
      this.editor.model.change(writer => {
        this.editor.model.insertContent(
          writer.createElement("opengraphPreview", data)
        );
      });
    } catch (err) {
      console.warn("Failed", err);
    }
  }
}
