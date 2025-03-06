import basic_initializer from "./i18n_text_input.js";
import i18n from "../i18n.js";
import Style from '../style.js';

function createLocaleSelect() {
  const select = document.createElement("select");
  const current_locale = window.tr_current_locale;

  window.tr_locales.forEach(function(locale) {
    const option = document.createElement("option");
    option.value = locale;
    option.selected = current_locale == locale;
    select.appendChild(option);
    i18n.ready.then(function() {
      option.textContent = i18n.t(`locale-names.${locale}`);
    });
  });
  select.value = current_locale;
  return select;
}

function createLocalePicker(input) {
  const group = document.createElement("div");
  const label = document.createElement("label");

  Style.ready.then(function() { Style.apply("formGroup", group); });
  i18n.ready.then(function() { label.textContent = i18n.t("translation-picker"); });
  group.appendChild(label);
  group.appendChild(input);
  return group;
}

function emplaceLocalePicker(manager, localePicker) {
  const form = document.querySelector("#main-form");

  if (!localePicker.parentElement && manager.inputs.length > 0)
    form.insertBefore(localePicker, form.firstChild);
  else if (localePicker.parentElement && !manager.inputs.length)
    form.removeChild(localePicker);
}

export default function initialize() {
  const manager = basic_initializer();
  const select = createLocaleSelect();
  const localePicker = createLocalePicker(select);

  manager.localeSelector = select;
  manager.localePicker = localePicker;
  select.addEventListener("change", function() {
    manager.setCurrentLocale(select.value);
  });
  manager.setCurrentLocale(window.tr_current_locale);
  manager.onInputsChanged = emplaceLocalePicker.bind(manager, manager, localePicker);
  manager.onInputsChanged();
  return manager;
}
