import Uppy, { debugLogger } from '@uppy/core';
import {configureUppy, getUppyLocale, attachmentsPath} from "./uppy.js";
import {updateCsrfTokenFromResponse} from "./csrf_token.js";
import CmsDialog from "./dialog.js";
import i18n from "../i18n.js";
import Style from "../style.js";
import iconHtml from "./icons.js";
import TomSelect from "tom-select/dist/js/tom-select.base.js";

function attachmentsAdminPath() {
  return document.querySelector("meta[name='attachments-admin-path']").content;
}

function makeUrl(url, params) {
  let sep = '?';

  for (let item in params) {
    url += `${sep}${item}=${encodeURIComponent(params[item])}`;
    sep = '&';
  }
  return url;
}

function makeUrlParams(self, params) {
  console.log("makeUrlParams", self, params);
  if (!params)
    params = {};
  if (self.plugin && self.plugin.mimetype && !params.mimetype)
    params.mimetype = self.plugin.mimetype.replaceAll('*', '');
  return params;
}

export default class extends CmsDialog {
  constructor(plugin) {
    super();
    window.picker = this;
    this.params = {};
    this.plugin = plugin;
    this.root.id = "proudcms-file-picker";
    this.popup.classList.add("pure-g");
    Promise.all([i18n.ready, Style.ready]).then(() => {
      this.fetch();
    });
  }

  set title(value) {
    const element = this.popup.querySelector(".popup-title");
    element.textContent = this.plugin.title = value;
  }

  fetch(params = {}) {
    const headers = new Headers();
    const urlParams = makeUrlParams(this, params);
    const url = makeUrl(attachmentsAdminPath(), urlParams);
    headers.append("Accept", "application/json");
    return fetch(new Request(url), {
      method: 'GET', headers: headers
    }).then(response => {
      return response.json();
    }).then(json => {
      updateCsrfTokenFromResponse(json);
      this.tags = json.tag_options;
      this.resultCount = json.count;
      this.params = params;
      this.currentPage = params ? (params.page || 1) : 1;
      this.itemsPerPage = 10;
      this.renderLibrary(json.files);
    });
  }

  search(query, tag) {
    return this.fetch({ search: query, tag: tag });
  }

  renderLibrary(files) {
    const title = document.createElement("div");
    const list = document.createElement("ul");
    const uploadControl = document.createElement("button");
    const searchForm = document.createElement("form");
    const searchControl = document.createElement("input");
    const searchTagControl = document.createElement("select");
    const searchButton = document.createElement("button");
    const paginator = document.createElement("div");

    this.popup.innerHTML = "";
    title.classList.add("popup-title");
    title.classList.add("pure-u-3-5");
    title.textContent = this.plugin.title;
    this.popup.appendChild(title);

    Style.apply("button", uploadControl);
    uploadControl.classList.add("pure-u-2-5");
    uploadControl.textContent = i18n.t("admin.new-attachment");
    uploadControl.addEventListener("click", this.renderUploader.bind(this));
    this.popup.appendChild(uploadControl);

    for (let tag in this.tags) {
      const option = document.createElement("option");
      option.value = option.textContent = tag;
      searchTagControl.appendChild(option);
    }
    searchTagControl.placeholder = "Tag";
    Style.apply("searchForm", searchForm);
    searchForm.classList.add("pure-u-1-1");
    searchForm.appendChild(searchControl);
    searchForm.appendChild(searchTagControl);
    searchForm.appendChild(searchButton);
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      this.search(searchControl.value, searchTagControl.value);
    });
    searchControl.placeholder = i18n.t("search") + "...";
    searchButton.type = "submit";
    searchButton.innerHTML = iconHtml("search");
    Style.apply("button", searchButton);
    this.popup.appendChild(searchForm);
    new TomSelect(searchTagControl);

    files.forEach(file => {
      const item = this.renderFile(file);
      item.classList.add("candidate");
      list.appendChild(item);
    });

    Style.apply("collection", list);
    this.popup.appendChild(list);

    if (this.resultCount > files.length) {
      this.renderPagination(paginator);
      this.popup.appendChild(paginator);
    }

    searchControl.focus();
  }

  renderFile(file) {
    const item = document.createElement("li");
    const name = document.createElement("div");
    const caption = document.createElement("div");
    const miniature = document.createElement("div");

    Style.apply("collectionItem", item);
    [miniature, name, caption].forEach(el => { item.appendChild(el); });
    caption.classList.add("caption");
    caption.textContent = file.description;
    name.classList.add("name");
    name.textContent = file.name;
    miniature.classList.add("miniature");
    if (file.miniature_url) {
      const image = document.createElement("img");
      image.src = file.miniature_url;
      miniature.appendChild(image);
    }
    if (file.mimetype.startsWith("audio/")) {
      const audio = document.createElement("audio");
      const source = document.createElement("source");
      source.src = file.url;
      source.type = file.mimetype;
      audio.controls = true;
      audio.appendChild(source);
      miniature.appendChild(audio);
    }
    else if (file.mimetype.startsWith("video/")) {
      const video = document.createElement("video");
      const source = document.createElement("source");
      source.src = file.url;
      source.type = file.mimetype;
      video.controls = true;
      video.appendChild(source);
      miniature.appendChild(video);
    }
    if (file.processing)
      item.classList.add("file-processing");
    else
      item.addEventListener("click", this.onFilePicked.bind(this, file));
    return item;
  }

  renderPagination(root) {
    const pageCount = Math.ceil(this.resultCount / this.itemsPerPage);
    const rangeStart = Math.max(2, this.currentPage - 2);
    const rangeEnd = Math.min(pageCount - 1, this.currentPage + 2);
    const makeButton = (page) => {
      const button = document.createElement("button");

      Style.apply(page == this.currentPage ? "button" : "activeButton", button);
      button.textContent = page;
      button.addEventListener("click", event => {
        const newParams = {};

        event.preventDefault();
        for (let key in this.params)
          newParams[key] = this.params[key];
        newParams.page = page;
        this.fetch(newParams);
      });
      return button;
    };

    Style.apply("paginator", root);
    root.append(makeButton(1));
    root.append(document.createElement("div"));
    for (let i = rangeStart ; i < rangeEnd && i < pageCount ; ++i)
      root.append(makeButton(i));
    root.append(document.createElement("div"));
    root.append(makeButton(pageCount));
  }

  abort() {
    super.abort();
    if (typeof this.plugin.aborted == "function")
      this.plugin.aborted();
  }

  onFilePicked(file, event) {
    if (event)
      event.preventDefault();
    this.plugin.filePicked(file);
    this.close();
  }

  renderUploader() {
    const uppy = window.uppy = new Uppy({
      logger: debugLogger,
      locale: getUppyLocale(),
      restrictions: {
        maxNumberOfFiles: 1
      }
    });
    const uploadZone = document.createElement("div");
    const uploadForm = document.createElement("form");

    uploadZone.id = "upload-block";
    uploadForm.id = "upload-form";
    uploadForm.appendChild(uploadZone);
    this.popup.innerHTML = "";
    this.popup.appendChild(uploadForm);
    uppy.cms_endpoint = `${attachmentsPath()}/upload`
    uppy.cms_domTarget = uploadZone;
    uppy.cms_formTarget = uploadForm;
    configureUppy(uppy, this.onFileUploaded.bind(this));
  }

  onFileUploaded(uppyResult) {
    if (uppyResult.successful.length > 0) {
      const files = uppyResult.successful[0].response.body.files;
      for (let id in files) {
        this.onFilePicked(files[id]);
        break ;
      }
    }
  }
};
