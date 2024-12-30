function updateIFrameHeight(iframe) {
  const rect = iframe.wrapper.getBoundingClientRect();
  const controls = document.querySelector("form + div");
  let height = window.innerHeight - rect.y;

  if (controls)
    height = controls.getBoundingClientRect().height;
  iframe.wrapper.style.height = `${Math.max(200, height - 130)}px`;
}

function waitForIframeJavaScript(iframe, resolve) {
  try {
    const value = iframe.contentWindow.eval("Cms");
    if (value) {
      resolve();
      return ;
    }
  } catch (err) {
    if (iframe.contentDocument.head.querySelector("script") == null) {
      console.log("PageEditor iframe re-running the assets importers");
      iframe.importers.scripts();
      iframe.importers.styles();
    }
  }
  setTimeout(waitForIframeJavaScript.bind(this, iframe, resolve), 250);
}

function importMetaTag(iframe, name) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (tag) {
    tag = iframe.contentDocument.importNode(tag);
    iframe.contentDocument.head.appendChild(tag);
  }
}

function importStylesheets(iframe, stylesheets) {
  stylesheets.forEach(stylesheet => {
    const link = iframe.contentDocument.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheet;
    iframe.contentDocument.head.appendChild(link);
  });
}

function importScript(iframe, javascripts) {
  javascripts.forEach(javascript => {
    const script = iframe.contentDocument.createElement("script");
    script.src = javascript;
    iframe.contentDocument.head.appendChild(script);
  });
}

export default function createIFrame(textarea, resources = {}) {
  const wrapper = document.createElement("div");
  const iframe = document.createElement("iframe");

  wrapper.classList.add("cms-page-editor");
  wrapper.appendChild(iframe);
  textarea.parentElement.insertBefore(wrapper, textarea);
  iframe.contentDocument.body.classList.add("page-editor-frame");
  iframe.wrapper = wrapper;
  iframe.importers = {
    scripts: importScript.bind(this, iframe, resources.javascripts || []),
    styles:  importStylesheets.bind(this, iframe, resources.stylesheets || []),
    customScripts: importScript.bind(this, iframe),
    customStyles: importStylesheets.bind(this, iframe)
  };
  iframe.ready = new Promise(resolve => {
    waitForIframeJavaScript(iframe, resolve);
  });
  ["attachments-admin-path", "page-list-path"].forEach(importMetaTag.bind(this, iframe));
  iframe.importers.scripts();
  iframe.importers.styles();
  updateIFrameHeight(iframe);
  window.addEventListener("scroll", updateIFrameHeight.bind(this, iframe));
  window.addEventListener("resize", updateIFrameHeight.bind(this, iframe));
  return iframe;
}
