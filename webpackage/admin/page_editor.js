import i18n from "../i18n.js";
import Style from "../style.js";
import createIFrame from "./page_editor/iframe.js";
import createToolbar from "./page_editor/toolbar.js";

export default function(layout, form, fieldName, mode, resources) {
  return Promise.all([i18n.ready, Style.ready]).then(function() {
    //const element = form.querySelector(".cms-page-editor");
    const textarea = form.querySelector(`textarea[name='${fieldName}']`);
    const hasFooter = form.querySelector("input[name='page[has_footer]'");
    const iframe = createIFrame(textarea, resources);

    return iframe.ready.then(function() {
      iframe.contentDocument.body.innerHTML = textarea.value;
      Cms.initializers.ContentTools(iframe);
    }).then(function() {
      const pageEditor = new layout(iframe, mode);

      textarea.style.display = 'none';
      pageEditor.toolbar = createToolbar(pageEditor);
      pageEditor.bindElements();
      pageEditor.updateEditableComponents();
      pageEditor.targetInput = textarea;
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
