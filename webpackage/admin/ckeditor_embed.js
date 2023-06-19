import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ProudCmsPicker from "./file_picker.js";
import proudcmsEmbedIcon from './icons/library.svg';
import i18n from "../i18n.js";

export default class extends Plugin {
  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add("proudcmsEmbed", this.createButton.bind(this));
    i18n.ready.then(() => { this.title = i18n.t("admin.image-library"); });
    this.mimetype = "image/*";
  }

  createButton() {
    const button = new ButtonView();
    button.set({label: "Embed from library", icon: proudcmsEmbedIcon });
    button.on("execute", this.buttonClicked.bind(this));
    return button;
  }

  buttonClicked() {
    const editor = this.editor;
    editor.model.change(writer => {
      new ProudCmsPicker(this).open();
    });
  }

  filePicked(file) {
    console.log("File picked", file);
    this.editor.execute("insertImage", { source: file.url });
  }
}
