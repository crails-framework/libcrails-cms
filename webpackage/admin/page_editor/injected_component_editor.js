import i18n from "../../i18n.js";
import ComponentEditor from "./component_editor.js";
import GridComponentEditor from "./grid_component_editor.js";
import Funnel from "../funnel.js";

function previewPath() {
  const meta = document.querySelector('meta[name="injectable-preview-path"]');
  return meta && meta.content.length > 0 ? meta.content : null;
}

function collectInjectors() {
  const injectorList = document.querySelector("[data-role='injector-list']");
  const result = [];

  if (injectorList) {
    injectorList.querySelectorAll("[data-name]").forEach(injectable => {
      result.push({ value: injectable.dataset.name, text: i18n.t(`admin.injectors.${injectable.dataset.name}`) });
    });
  }
  return result;
}

export function withInjections() {
  return collectInjectors().length > 0;
}

export function stripInjectionPreviews(root) {
  root.querySelectorAll(".cms-inject-placeholder").forEach(placeholder => {
    placeholder.innerHTML = "";
  });
  return root;
}

export default class InjectableComponentEditor extends GridComponentEditor(ComponentEditor) {
  initializeProperties() {
    this.properties.injectorType = { type: "select", target: this, attribute: "injectableName", options: collectInjectors()};
    this.properties.idValue = { type: "string", target: this.injector.dataset, attribute: "id", optional: true };
    this.properties.count = { type: "number", target: this.injector.dataset, attribute: "count", optional: true };
    super.initializeProperties();
  }

  get injectableName() {
    return this.root.dataset.injectable;
  }

  set injectableName(value) {
    this.root.dataset.injectable = value;
    this.injector.setAttribute("name", value);
    this.updatePlaceholder();
  }

  updateProperty(name, value) {
    super.updateProperty(name, value);
    this.updatePlaceholder();
  }

  create() {
    const injector = this.document.createElement("inject");
    const placeholder = this.document.createElement("div");

    this.root.appendChild(injector);
    injector.appendChild(placeholder);
    placeholder.classList.add("cms-inject-placeholder");
    super.create();
  }

  bindElements() {
    this.injector = this.root.children[0];
    super.bindElements();
    this.updatePlaceholder();
  }

  get placeholder() {
    return this.root.querySelector(".cms-inject-placeholder");
  }

  get fallbackPlaceholderHTML() {
    return `<p>Component injection</p><p>Component type: ${this.injectableName}</p>`;
  }

  get previewUrl() {
    const path = previewPath();

    if (path) {
      const url = new URL(path, window.location.origin);

      url.searchParams.set("name", this.injectableName);
      for (const key in this.injector.dataset)
        url.searchParams.set(`vars[${key}]`, this.injector.dataset[key]);
      return url;
    }
    return null;
  }

  updatePlaceholder() {
    if (this.injectableName) {
      this.previewFunnel ||= new Funnel(400);
      this.previewFunnel.trigger(this.refreshPreview.bind(this));
    } else {
      this.placeholder.innerHTML = this.fallbackPlaceholderHTML;
    }
  }

  refreshPreview() {
    const url = this.previewUrl;

    if (url) {
      return fetch(url).then(response => {
        if (response.ok)
          return response.text();
        else
          throw new Error(`injectable preview request failed (${response.status})`);
      }).then(html => {
        this.placeholder.innerHTML = html;
      }).catch(() => {
        this.placeholder.innerHTML = this.fallbackPlaceholderHTML;
      });;
    } else {
      return Promise.resolve(this.placeholder.innerHTML = this.fallbackPlaceholderHTML);
    }
  }
}
