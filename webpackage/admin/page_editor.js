import i18n from "../i18n.js";
import Style from "../style.js";
import createIFrame from "./page_editor/iframe.js";
import createToolbar from "./page_editor/toolbar.js";
import overloadCtHistoryTools from "./page_editor/content_tools/undo.js";
import overloadCtToolbox from "./page_editor/content_tools/toolbar.js";

export default function(layout, form, fieldName, mode, resources) {
  return Promise.all([i18n.ready, Style.ready]).then(function() {
    //const element = form.querySelector(".cms-page-editor");
    const textarea = form.querySelector(`textarea[name='${fieldName}']`);
    const hasFooter = form.querySelector("input[name='page[has_footer]'");
    const iframe = createIFrame(textarea, resources);
    const themeVariables = document.querySelector("#layout-variables");

    return iframe.ready.then(function() {
      iframe.contentDocument.body.innerHTML = textarea.value;
      iframe.contentDocument.head.appendChild(themeVariables);
      Cms.initializers.ContentTools(iframe);
    }).then(function() {
      const pageEditor = new layout(iframe, mode);

      textarea.style.display = 'none';
      pageEditor.toolbar = createToolbar(pageEditor);
      pageEditor.ctToolbox = overloadCtToolbox(pageEditor.window.Cms.ContentTools);
      pageEditor.bindElements();
      pageEditor.updateEditableComponents();
      pageEditor.targetInput = textarea;
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
