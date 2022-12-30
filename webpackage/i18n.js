class I18n {
  constructor() {
    this.ready = fetch(new Request("/cms/locale"), {
      method: "GET"
    }).then(response => {
      return response.json();
    }).then(json => {
      this.data = json;
    });
    window.i18n = this;
  }

  t(key, options) {
    const parts = key.split(".");
    let translation = this.data;

    while (parts.length)
    {
      translation = translation[parts.shift()];
      if (!translation) return key;
    }
    for (let key in options)
      translation = translation.replace(`{{${key}}}`, options[key]);
    return translation;
  }

  tt(key, fallback, options) {
    const result = this.t(key, options);

    if (result == key)
      return this.t(fallback, options);
    return result;
  }
};

const i18n = new I18n();

export default i18n;
