import HtmlTextArea from "../html_textarea.js";
import indent from "indent.js";

let indentSize = 2;

function formatHtml(source) {
  source = source.replace(/<br\s*\/?>i/i, "<br/>\n");
  source = source.replace(/(<\/[^>]+>)/, "$1\n");
  return indent.indent.html(source, {
    tabString: ' '.repeat(indentSize)
  });
}

export default function(ContentTools) {
  const callback = ContentTools.PropertiesDialog.prototype.mount;

  ContentTools.PropertiesDialog.prototype.mount = function() {
    let htmlTextArea;

    callback.bind(this)();
    htmlTextArea = new HtmlTextArea(this._domInnerHTML);
    this._domInnerHTML.value = formatHtml(this._domInnerHTML.value);
    htmlTextArea.updateCode();
    htmlTextArea.replaceTextArea();
    window.ctHtmlTextArea = htmlTextArea;
  };
}
