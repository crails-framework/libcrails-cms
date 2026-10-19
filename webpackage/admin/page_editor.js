import i18n from "../i18n.js";
import Style from "../style.js";
import createIFrame from "./page_editor/iframe.js";
import createToolbar from "./page_editor/toolbar.js";
import overloadCtHistoryTools from "./page_editor/content_tools/undo.js";
import overloadCtToolbox from "./page_editor/content_tools/toolbar.js";

function setIframeHTML(iframe, textarea) {
  const html = textarea.dataset.localized == '1'
    ? textarea.$localeController.currentInput.value
    : textarea.value;
  iframe.contentDocument.body.innerHTML = html;
}

function initializeTextArea(textarea, pageEditor) {
  textarea.style.display = 'none';
  if (textarea.dataset.localized == '1') {
    textarea = textarea.$localeController.currentInput;
    textarea.el.display = 'none';
  }
  pageEditor.targetInput = textarea;
}

export default function(layout, form, fieldName, mode, resources) {
  return Promise.all([i18n.ready, Style.ready]).then(function() {
    const textarea = form.querySelector(`textarea[name='${fieldName}']`);
    const hasFooter = form.querySelector("input[name='page[has_footer]']");
    const iframe = createIFrame(textarea, resources);
    const themeVariables = document.querySelector("#layout-variables");

    return iframe.ready.then(function() {
      setIframeHTML(iframe, textarea);
      if (themeVariables)
        iframe.contentDocument.head.appendChild(themeVariables);
      Cms.initializers.ContentTools(iframe);
    }).then(function() {
      const pageEditor = new layout(iframe, mode);
      const textAreaInitializer = function() { initializeTextArea(textarea, pageEditor); };

      textAreaInitializer();
      if (textarea.dataset.localized == '1') {
        pageEditor.localeController = textarea.$localeController;
        textarea.$localeController.onLocaleChanged(function() {
          const previous = pageEditor.targetInput;

          // Keep what was done on the page in the language we're leaving, then
          // load the other one and bind its components.
          if (previous && previous !== textarea.$localeController.currentInput)
            previous.value = pageEditor.serialize();
          textAreaInitializer();
          pageEditor.loadHtml(textarea.$localeController.currentInput.value);
        });
      }
      pageEditor.toolbar = createToolbar(pageEditor);
      pageEditor.ctToolbox = overloadCtToolbox(pageEditor.window.Cms.ContentTools);
      pageEditor.bindElements();
      pageEditor.updateEditableComponents();
      overloadCtHistoryTools(pageEditor);
      form.addEventListener("submit", function(event) {
        try {
          pageEditor.save(pageEditor.targetInput);
          if (hasFooter)
            hasFooter.value = pageEditor.hasFooter ? 1 : 0;
        } catch (err) {
          event.preventDefault();
          console.warn("PageEditor saved to fail:", err);
        }
      });
      return pageEditor;
    });
  });
}
