import {fetchOpenGraphFromUrl} from './opengraph.js';
import ProudCmsDialog from './dialog.js';
import ProudCmsForm from './form.js';
import i18n from '../i18n.js';
import Style from '../style.js';

export default class extends ProudCmsDialog {
  constructor(callback) {
    const title = document.createElement("div");
    const button = document.createElement("button");
    const urlGroup = document.createElement("div");
    const urlInput = document.createElement("input");
    const urlFetch = document.createElement("button");

    Style.apply("button", urlFetch);
    urlFetch.textContent = i18n.t("admin.opengraph-fetch");
    urlGroup.appendChild(urlInput);
    urlGroup.appendChild(urlFetch);
    urlInput.name = "url";

    title.className = "popup-title";
    title.textContent = i18n.t("admin.opengraph-form");

    super();
    this.callback = callback;
    this.form = new ProudCmsForm();
    this.form.addField("url", { input: urlGroup });

    this.url = urlInput;
    this.type = this.form.addField("type");
    this.title = this.form.addField("title");
    this.image = this.form.addField("image");
    this.image_width = this.form.addField("image:width");
    this.image_height = this.form.addField("image:height");
    this.description = this.form.addField("description", { input: document.createElement("textarea") });
    this.video = this.form.addField("video");
    this.audio = this.form.addField("audio");

    Style.apply("button", button);
    button.type = "submit";
    button.textContent = i18n.t("admin.confirm");
    this.form.root.appendChild(button);
    this.form.onSubmit = this.onConfirmed.bind(this);

    this.popup.classList.add("opengraph-popup");
    this.popup.appendChild(title);
    this.popup.appendChild(this.form.root);

    urlFetch.addEventListener("click", this.fetchOpenGraphData.bind(this));
    if (typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(this.popup);
  }

  fetchOpenGraphData(event) {
    event.preventDefault();
    fetchOpenGraphFromUrl(this.url.value).then(data => {
      Object.keys(data).forEach(key => {
        const field_name = key.replace(':', '_');

        if (this[field_name])
          this[field_name].value = data[key];
      });
    }).catch(this.onError.bind(this));
  }

  onConfirmed(event) {
    const data = {};

    event.preventDefault();
    for (let input of this.form.root.querySelectorAll("[name]"))
      data[input.name] = input.value;
    console.log("submit event", data);
    this.callback(data);
  }

  onError() {
    alert("Could not fetch OpenGraph data from " + this.url.value);
  }

  open() {
    super.open();
    this.url.focus();
  }
}
