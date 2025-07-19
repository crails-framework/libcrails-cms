import GridComponentEditor from "./grid_component_editor.js";

function setDisplayOnVideoSource(element, data) {
  const minWidth = this.gridModel.widthFromSize(data.display - 1);

  element.media = minWidth === undefined
    ? 'all'
    : `all and (min-width: ${minWidth})`;
  element.dataset.display = data.display;
}

function createVideoSource(document, data) {
  const element = document.createElement("source");

  element.src = data.url;
  element.type = data.mimetype;
  if (source.display)
    setDisplayOnVideoSource(element, data);
}

export default class extends GridComponentEditor() {
  constructor(parent, element, components) {
    if (!element)
      element = parent.document.createElement("video");
    super(parent, element, components);
  }

  initializeProperties() {
    this.properties.sources  = { type: "videos", target: this, attribute: "sources" };
    this.properties.poster   = { type: "image", target: this.videoElement, attribute: "poster" };
    this.properties.controls = { type: "bool", targets: this.videoElement, attribute: "controls" };
    this.properties.autoplay = { type: "bool", targets: this.videoElement, attribute: "autoplay" };
    this.properties.loop     = { type: "bool", targets: this.videoElement, attribute: "loop" };
    this.properties.muted    = { type: "bool", targets: this.videoElement, attribute: "muted" };
    this.properties.inline   = { type: "bool", targets: this.videoElement, attribute: "playsInline" };
    this.properties.noPnP    = { type: "bool", targets: this.videoElement, attribute: "disablePictureInPicture" };
    super.initializeProperties();
  }

  bindElements() {
    this.video = this.root.tagName == "VIDEO" ? this.root : this.root.querySelector("video");
    super.bindElements();
  }

  set sources(value) {
    this.root.innerHTML = "";
    value.forEach(data => {
      this.root.appendChild(
        createVideoSource(this.document, data)
      );
    });
  }

  get sources() {
    const elements = this.root.querySelectorAll("source");
    const result = [];

    for (let element of elements) {
      const data = {
        url: element.src,
        mimetype: element.type,
        display: parseInt(element.dataset.display)
      };
    }
    return result;
  }
}
