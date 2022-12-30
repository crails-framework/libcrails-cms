import i18n from '../i18n.js';
import Style from '../style.js';

export default class {
  constructor() {
    this.root = document.createElement("form");
    this.root.addEventListener("submit", event => this.onSubmit(event));
    Style.apply("form", this.root);
  }

  addField(name, options = {}) {
    const group = document.createElement("div");
    const label = document.createElement("label");
    const input = options.input || document.createElement("input");

    Style.apply("formGroup", group);
    label.textContent = i18n.t(options.label || name);
    if (!options.input)
      input.type = options.type || "text";
    input.name = name;
    group.dataset.name = name;
    group.appendChild(label);
    group.appendChild(input);
    this.root.appendChild(group);
    return input;
  }

  submit() { this.form.submit(); }

  onSubmit(event) {
  }
}

