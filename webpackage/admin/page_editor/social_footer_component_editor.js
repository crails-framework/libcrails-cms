import ComponentEditor from "./component_editor.js";

export default class extends ComponentEditor {
  constructor(parent, element) {
    super(parent, element);
    this.socials = {};
  }

  get socialContainer() {
    return this.root;
  }

  initializeProperties() {
    console.log("Initialize social properties", this.socials);
    for (let key in this.socials) {
      const social = this.socials[key];
      console.log("Initialize social property", key, social);
      this.properties[social.property] = {
        type: "url",
        target: this,
        attribute: social.property
      };
    }
    super.initializeProperties();
  }

  getSocialButton(type) {
    return this.socialContainer.querySelector(`.${type}`);
  }

  getSocialButtonValue(type) {
    const link = this.getSocialButton(type);
    return link && link.attributes.href ? link.attributes.href.value : "";
  }

  setSocialButtonValue(type, value) {
    const link = this.getSocialButton(type);
    link.href = value;
    link.target = "_blank";
  }

  updateSocialButton(type, value) {
    let element = this.getSocialButton(type);

    if (element && !value)
      this.socialContainer.removeChild(element);
    else if (value) {
      if (!element)
        this.socialContainer.appendChild(this.createSocialButton(type));
      this.setSocialButtonValue(type, value);
    }
  }

  createSocialButton(type) {
    const link = document.createElement("a");

    link.textContent = type;
    return link;
  }
}
