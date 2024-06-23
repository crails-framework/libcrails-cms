function replaceJavascriptSrc(html) {
  const pattern = /<script\s+src=["']\//;

  return html.replace(pattern, function(match) {
    const quote =  match[match.length - 2];
    return `<script src=${quote}${window.location.protocol}${window.location.host}/`;
  });
}

export default function(form, action) {
  let data;

  if (window.ckeditors)
    window.ckeditors.forEach(editor => editor.updateSourceElement());
  if (window.pageEditor)
    window.pageEditor.save(window.pageEditor.targetInput);
  data = new FormData(form);
  fetch(action, {
    method: "POST",
    body: data,
    headers: { 'Accept': 'text/html' }
  }).then(response => {
    return response.text();
  }).then(html => {
    const morphedHtml = replaceJavascriptSrc(html);
    const blob = URL.createObjectURL(new Blob([morphedHtml], {type: 'text/html'}));
    window.open(blob, "cms_preview");
  });
}
