import ContentTools from "ContentTools";
import FilePicker from "../../file_picker.js";

export default class extends ContentTools.Tool {
  constructor() {
    super();
    this.icon = "image";
    this.label = "Image";
    ContentTools.ToolShelf.stow(this, "image");
  }

  canApply(element, selection) {
    return element != null;
  }

  isApplied(element, selection) {
    if (element && element._domElement && element._domElement.children[0])
      return element._domElement.children[0].tagName == "img";
    return false;
  }

  apply(element, selection, callback) {
    const picker = new FilePicker({
      title:      i18n.t("admin.image-library"),
      mimetype:   "image/*",
      filePicked: this.onFilePicked.bind(this, element, selection, callback),
      aborted:    this.onCanceled.bind(this, element, callback)
    });

    element.storeState();
    picker.open();
  }

  onCanceled(element, callback) {
    element.restoreState();
    callback(false);
  }

  onFilePicked(element, selection, callback, file) {
    let from, to;
    [from, to] = selection.get();

    // #1 Doesn't do anything, but should work ?
    const tag = new HTMLString.Tag("img", {
      class: "ct-img",
      src: file.url
    });

    element.content = element.content.format(selection.from, selection.to, tag);
    element.updateInnerHTML();
    element.taint();
    // END #1

    // #2 Works, but isn't the proper way to go
    window.ctElement = element;
    const base = element._cached || "<span></span>";
    const html = base.substr(0, "<span>".length + from)
      + `<img src="${file.url}" class="ct-img" />`
      + base.substr("<span>".length + to);
    element._domElement.innerHTML = html;
    // END #2

    callback(true);
  }
}
