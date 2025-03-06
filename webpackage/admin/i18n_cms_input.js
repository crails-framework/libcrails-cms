import basic_initializer from "./i18n_text_input.js";

function createLocaleSelect() {
  const select = document.createElement("select");
  const current_locale = window.tr_current_locale;

  window.tr_locales.forEach(function(locale) {
    const option = document.createElement("option");
    option.value = locale;
    option.textContent = locale;
    option.selected = current_locale == locale;
    select.appendChild(option);
  });
  select.value = current_locale;
  return select;
}

export default function initialize() {
  const manager = basic_initializer();
  const select = createLocaleSelect();

  manager.localeSelector = select;
  select.addEventListener("change", function() {
    manager.setCurrentLocale(select.value);
  });
  manager.setCurrentLocale(window.tr_current_locale);
  return manager;
}
