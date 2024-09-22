import CmsDialog from "./dialog.js";
import Style from '../style.js';
import i18n from "../i18n.js";
import iconHtml from "./icons.js";
  
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

export default class extends CmsDialog {
  constructor(callback) {
    const url = document.head.querySelector("meta[name='sitemap-path']");

    super();
    this.root.id = "cms-uri-picker";
    this.callback = callback;
    this.prerender();
    fetch(new Request(`${url.content}/json`)).then(response => {
      return response.json();
    }).then(json => {
      this.data = json;
      this.renderIndex();
    });
  }

  prerender() {
    const title = document.createElement("div");
    const view = document.createElement("div");

    title.textContent = i18n.t("admin.url-library");
    Style.apply("modalTitle", title);
    this.view = view;
    this.popup.appendChild(title);
    this.popup.appendChild(renderSearchForm(this.search.bind(this)));
    this.popup.appendChild(view);
  }

  search(pattern) {
    const urls = [];

    pattern = pattern.toLowerCase();
    for (let indexName in this.data) {
      this.data[indexName].forEach(url => {
        if (url.title.toLowerCase().indexOf(pattern) >= 0)
          urls.push(url);
      });
    }
    this.renderUrlSet(urls);
  }

  renderIndex() {
    const ul = document.createElement("ul");

    for (let indexName in this.data) {
      const li = document.createElement("li");
      const name = document.createElement("div");

      name.classList.add("name");
      name.textContent = indexName;
      li.addEventListener("click", event => {
        event.preventDefault();
        this.renderUrlSet(this.data[indexName]);
      });
      li.appendChild(name);
      ul.appendChild(li);
    }
    ul.classList.add("no-miniatures");
    Style.apply("collection", ul);
    Style.apply("collectionItem", ...ul.children);
    this.view.innerHTML = "";
    this.view.appendChild(ul);
  }

  renderUrlSet(urlSet) {
    const ul = document.createElement("ul");

    urlSet.forEach(urlData => {
      const li = document.createElement("li");
      const name = document.createElement("div");
      const caption = document.createElement("div");

      name.classList.add("name");
      caption.classList.add("caption");
      name.textContent = urlData.title;
      caption.textContent = urlData.href;
      li.addEventListener("click", event => {
        event.preventDefault();
        this.callback(urlData.href);
        this.close();
      });
      li.appendChild(name);
      li.appendChild(caption);
      ul.appendChild(li);
    });
    ul.classList.add("no-miniatures");
    Style.apply("collection", ul);
    Style.apply("collectionItem", ...ul.children);
    this.view.innerHTML = "";
    this.view.appendChild(ul);
  }
}
