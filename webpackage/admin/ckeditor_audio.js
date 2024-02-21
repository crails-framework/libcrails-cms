import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import CmsFilePicker from "./file_picker.js";
import proudcmsEmbedIcon from './icons/library.svg';
import i18n from "../i18n.js";

function collectAttributesFromElement(viewElement) {
  const src = viewElement.getAttribute("src");

  return { "src": src };
}

export default class extends Plugin {
  static toolName = "crailscmsAudioEmbed";

  init() {
    const editor = this.editor;
    i18n.ready.then(() => {
      editor.ui.componentFactory.add(this.constructor.toolName, this.createButton.bind(this));
      this.title = i18n.t("admin.audio-library");
    });
    this.mimetype = "audio/*";
    this.defineSchema();
    this.defineConverters();
  }

  createButton() {
    const button = new ButtonView();
    button.set({label: i18n.t("admin.audio-library"), icon: proudcmsEmbedIcon });
    button.on("execute", this.buttonClicked.bind(this));
    return button;
  }

  buttonClicked() {
    const editor = this.editor;
    editor.model.change(writer => {
      new CmsFilePicker(this).open();
    });
  }

  filePicked(file) {
    console.log("File picked", file);
    try {
      this.editor.model.change(writer => {
        this.editor.model.insertContent(
          writer.createElement("audioEmbed", { src: file.url })
        );
      });
    } catch (err) {
      console.warn("Failed", err);
    }
  }

  defineSchema() {
    const schema = this.editor.model.schema;
    schema.register("audioEmbed", {
      isObject: true,
      allowWhere: '$block',
      allowAttributes: ['url', 'type']
    });
  }

  defineConverters() {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("upcast").elementToElement({
      view: { name: "audio", classes: "audio-embed" },
      model: (viewElement, { writer: modelWriter }) => {
        return this.createModel(viewElement, modelWriter);
      }
    });
    conversion.for("dataDowncast").elementToElement({
      model: "audioEmbed",
      view: (modelElement, { writer: viewWriter }) => {
        return this.createElement(modelElement, viewWriter);
      }
    });
    conversion.for("editingDowncast").elementToElement({
      model: "audioEmbed",
      view: (modelElement, { writer: viewWriter }) => {
        return this.createElement(modelElement, viewWriter, false);
      }
    });
  }

  createModel(viewElement, modelWriter) {
    return modelWriter.createElement("audioEmbed",
      collectAttributesFromElement(viewElement)
    );
  }

  createElement(modelElement, viewWriter, withLink = true) {
    const audio = viewWriter.createRawElement("audio", {
      class: "audio-embed",
      src: modelElement.getAttribute("src"),
      controls: "controls"
    });
    viewWriter.insert(viewWriter.createPositionAt(audio, 0), wrapper);
    return toWidget(audio, viewWriter, { label: "audio" });
  }
}
