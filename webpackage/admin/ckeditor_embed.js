import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import CmsPicker from "./file_picker.js";
import toolbarIcon from './icons/picture.svg';
import i18n from "../i18n.js";

export default class extends Plugin {
  static toolName = "cmsPictureEmbed";

  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add(this.constructor.toolName, this.createButton.bind(this));
    i18n.ready.then(() => { this.title = i18n.t("admin.image-library"); });
    this.mimetype = "image/*";
  }

  createButton() {
    const button = new ButtonView();
    i18n.ready.then(function() {
      button.set({label: i18n.t("admin.image-library"), icon: toolbarIcon });
    });
    button.on("execute", this.buttonClicked.bind(this));
    return button;
  }

  buttonClicked() {
    const editor = this.editor;
    editor.model.change(writer => {
      new CmsPicker(this).open();
    });
  }

  filePicked(file) {
    console.log("File picked", file);
    this.editor.execute("insertImage", { source: file.url });
  }
}
