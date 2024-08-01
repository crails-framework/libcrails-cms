export default function(ContentTools) {
  class MockCtEditor extends ContentTools.ComponentUI {
    constructor() {
      super();
      this._document = document;
      this._domElement = document.createElement("div");
      this._domElement.classList.add("ct-app");
      document.body.appendChild(this._domElement);
    }
  };

  const callback = ContentTools.ToolboxUI.prototype.mount;
  const ctApp = new MockCtEditor();
  const ctToolbox = new ContentTools.ToolboxUI(ContentTools.DEFAULT_TOOLS);

  ctToolbox._document = document;
  ctApp.attach(ctToolbox);
  return ctToolbox;
}
