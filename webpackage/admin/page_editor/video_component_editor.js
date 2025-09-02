import GridComponentEditor from "./grid_component_editor.js";

function setDisplayOnVideoSource(element, data) {
  const gridModel = GridComponentEditor.model;
  const maxSize = Object.keys(gridModel.sizes).length - 1;
  const display = parseInt(data.display);
  const minWidth = data.display < maxSize ? gridModel.widthFromSize(display) : undefined;

  element.media = minWidth === undefined
    ? 'all'
    : `all and (min-width: ${minWidth}px)`;
  element.dataset.display = data.display;
}

function createVideoSource(document, data) {
  const element = document.createElement("source");

  element.src = data.url;
  element.type = data.mimetype;
  if (data.display !== undefined)
    setDisplayOnVideoSource(element, data);
  return element;
}

export default class extends GridComponentEditor() {
  constructor(parent, element, components) {
    if (!element)
      element = parent.document.createElement("video");
    super(parent, element, components);
  }

  get translationGroup() {
    return "video";
  }

  initializeProperties() {
    this.properties.sources  = { type: "videos", target: this,       attribute: "sources" };
    this.properties.poster   = { type: "image",  target: this.video, attribute: "poster" };
    this.properties.controls = { type: "bool",   target: this.video, attribute: "controls" };
    this.properties.autoplay = { type: "bool",   target: this.video, attribute: "autoplay" };
    this.properties.loop     = { type: "bool",   target: this.video, attribute: "loop" };
    this.properties.muted    = { type: "bool",   target: this,       attribute: "muted" };
    this.properties.inline   = { type: "bool",   target: this.video, attribute: "playsInline" };
    this.properties.noPnP    = { type: "bool",   target: this.video, attribute: "disablePictureInPicture" };
    super.initializeProperties();
  }

  bindElements() {
    this.video = this.root.tagName == "VIDEO" ? this.root : this.root.querySelector("video");
    super.bindElements();
  }

  set sources(value) {
    this.video.innerHTML = "";
    value = JSON.parse(value);
    value.forEach(data => {
      this.video.appendChild(
        createVideoSource(this.document, data)
      );
    });
  }

  get sources() {
    const elements = this.video.querySelectorAll("source");
    const result = [];

    for (let element of elements) {
      const data = {
        url: element.src,
        mimetype: element.type,
        display: element.dataset.display
      };
      result.push(data);
    }
    return JSON.stringify(result);
  }

  get muted() {
    return this.video.hasAttribute("muted");
  }

  set muted(value) {
    if (value)
      this.video.setAttribute("muted", "");
    else
      this.video.removeAttribute("muted");
  }
}
