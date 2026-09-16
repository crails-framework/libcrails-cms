import CmsDialog from "./dialog.js";
import Style from '../style.js';
import i18n from "../i18n.js";
import iconHtml from "./icons.js";

function optionsPath() {
  const meta = document.head.querySelector("meta[name='injectable-options-path']");
  return meta && meta.content.length > 0 ? meta.content : null;
}

function renderSearchForm(searchCallback) {
  const searchForm = document.createElement("form");
  const searchControl = document.createElement("input");
  const searchButton = document.createElement("button");

  Style.apply("searchForm", searchForm);
  searchForm.classList.add("pure-u-1-1");
  searchForm.appendChild(searchControl);
  searchForm.appendChild(searchButton);
  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchCallback(searchControl.value);
  });
  searchControl.placeholder = i18n.t("search") + "...";
  searchButton.type = "submit";
  searchButton.innerHTML = iconHtml("search");
  Style.apply("button", searchButton);
  return searchForm;
}

// Same shape as UrlPicker, but instead of searching client-side through a
// site-wide URL map fetched once, it re-queries the server on every search:
// the option list is specific to one injector's one parameter, and it's
// meant to be backed by arbitrary, potentially large, database-driven data
// (typically a Model's instances) rather than a small static index.
export default class extends CmsDialog {
  constructor(injectorName, paramName, vars, callback) {
    super();
    this.root.id = "cms-injector-option-picker";
    this.injectorName = injectorName;
    this.paramName = paramName;
    this.vars = vars || {};
    this.callback = callback;
    this.prerender();
    this.search("");
  }

  get optionsUrl() {
    const path = optionsPath();

    if (path) {
      const url = new URL(path, window.location.origin);

      url.searchParams.set("name", this.injectorName);
      url.searchParams.set("param", this.paramName);
      for (const key in this.vars)
        url.searchParams.set(`vars[${key}]`, this.vars[key]);
      return url;
    }
    return null;
  }

  prerender() {
    const title = document.createElement("div");
    const view = document.createElement("div");

    title.textContent = i18n.t("admin.injector-option-library");
    Style.apply("modalTitle", title);
    this.view = view;
    this.popup.appendChild(title);
    this.popup.appendChild(renderSearchForm(this.search.bind(this)));
    this.popup.appendChild(view);
  }

  search(pattern) {
    const url = this.optionsUrl;

    if (!url) {
      this.renderOptionSet([]);
      return ;
    }
    if (pattern)
      url.searchParams.set("q", pattern);
    fetch(new Request(url)).then(response => {
      return response.json();
    }).then(options => {
      this.renderOptionSet(options);
    });
  }

  renderOptionSet(options) {
    const ul = document.createElement("ul");

    options.forEach(option => {
      const li = document.createElement("li");
      const name = document.createElement("div");

      name.classList.add("name");
      name.textContent = option.label;
      li.addEventListener("click", event => {
        event.preventDefault();
        this.callback(option.value, option.label);
        this.close();
      });
      li.appendChild(name);
      ul.appendChild(li);
    });
    ul.classList.add("no-miniatures");
    Style.apply("collection", ul);
    Style.apply("collectionItem", ...ul.children);
    this.view.innerHTML = "";
    this.view.appendChild(ul);
  }
}
