import i18n from "../../i18n.js";
import ComponentEditor from "./component_editor.js";
import GridComponentEditor from "./grid_component_editor.js";
import Funnel from "../funnel.js";

function previewPath() {
  const meta = document.querySelector('meta[name="injectable-preview-path"]');
  return meta && meta.content.length > 0 ? meta.content : null;
}

function injectorListElement() {
  return document.querySelector("[data-role='injector-list']");
}

function parseInjectorParams(element) {
  const raw = element.dataset.params;

  if (!raw)
    return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("failed to parse injector params for", element.dataset.name, error);
    return [];
  }
}

function collectInjectors() {
  const injectorList = injectorListElement();
  const result = [];

  if (injectorList) {
    injectorList.querySelectorAll("[data-name]").forEach(injectable => {
      result.push({
        value: injectable.dataset.name,
        text: i18n.t(`admin.injectors.${injectable.dataset.name}`),
        params: parseInjectorParams(injectable)
      });
    });
  }
  return result;
}

// Maps the server-side param type onto the PropertyEditor's own vocabulary
// of input types. Most of them already match one-to-one; the exceptions are
// spelled out explicitly, everything else (string, number, boolean, color,
// picture, video, audio, gallery) is passed through as-is.
function propertyTypeForParam(param) {
  switch (param.type) {
  case "choice":
    return "select";
  case "selection":
    return "injector-selection";
  case "url":
    return "href";
  default:
    return param.type;
  }
}

// Builds the extra bits a property needs on top of {type, category, target,
// attribute, optional}, depending on where its list of values comes from.
function propertyExtrasForParam(param, component) {
  switch (param.type) {
  case "choice":
    return {
      options: (param.options || []).map(option => ({ value: option.value, text: option.label }))
    };
  case "selection":
    return {
      injectorName: component.injectableName,
      paramName: param.name,
      vars: () => ({ ...component.injector.dataset })
    };
  default:
    return {};
  }
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
    const injectors = collectInjectors();

    this.properties.injectorType = {
      type: "select",
      target: this,
      attribute: "injectableName",
      options: injectors.map(injector => ({ value: injector.value, text: injector.text }))
    };
    this.initializeInjectorParamProperties(injectors);
    super.initializeProperties();
  }

  // Builds one PropertyEditor property per parameter declared, server-side,
  // by the currently selected injector. They're tagged with category
  // "injector" so the PropertyEditor renders them in their own section,
  // and their values live on the <inject> element's dataset, same as before.
  initializeInjectorParamProperties(injectors = collectInjectors()) {
    const current = injectors.find(injector => injector.value == this.injectableName);
    const params = current ? current.params : [];

    params.forEach(param => {
      this.properties[param.name] = {
        type: propertyTypeForParam(param),
        category: "injector",
        target: this.injector.dataset,
        attribute: param.name,
        optional: param.optional !== false,
        ...propertyExtrasForParam(param, this)
      };
    });
  }

  get injectableName() {
    return this.root.dataset.injectable;
  }

  set injectableName(value) {
    this.root.dataset.injectable = value;
    this.injector.setAttribute("name", value);
    this.updatePlaceholder();
    this.properties = {};
    this.initializeProperties();
    this.reloadPropertyEditor();
  }

  reloadPropertyEditor() {
    const toolbar = this.layout.toolbar;

    if (toolbar && toolbar.currentComponent === this)
      toolbar.reloadActiveComponent();
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
