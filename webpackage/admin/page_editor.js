import i18n from "../i18n.js";
import Style from "../style.js";

export default function(layout, form, fieldName, mode) {
  return Promise.all([i18n.ready, Style.ready]).then(function() {
    const element = form.querySelector(".proudcms-page-editor");
    const textarea = form.querySelector(`textarea[name='${fieldName}']`);
    const hasFooter = form.querySelector("input[name='page[has_footer]'");
    const pageEditor = new layout(element, mode);

    textarea.style.display = 'none';
    element.innerHTML = textarea.value;
    pageEditor.bindElements();
    pageEditor.updateEditableComponents();
    pageEditor.contentEditor.start();
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
}
