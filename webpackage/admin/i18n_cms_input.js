import basic_initializer from "./i18n_text_input.js";

function createLocaleSelect() {
  const select = document.createElement("select");

  window.tr_locales.forEach(function(locale) {
    const option = document.createElement("option");
    option.value = locale;
    option.textContent = locale;
    option.selected = window.tr_current_locale == locale;
    select.appendChild(option);
  });
  select.value = locale;
  return select;
}

export default function initialize() {
  const manager = basic_initializer();
  const select = createLocaleSelect();

  manager.localeSelector = select;
  select.addEventListener("change", function() {
    manager.setCurrentLocale(select.value);
  });
  return manager;
}
