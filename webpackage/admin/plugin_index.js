const pluginCheckboxSelector = "input[data-plugin]";

function pluginPage() {
  return document.querySelector("#cms-plugins-view");
}

function updatePluginSelect() {
  const select = document.querySelector("#main-form select");
  const checkboxes = pluginPage().querySelectorAll(pluginCheckboxSelector);

  checkboxes.forEach(function(input) {
    const option = select.querySelector(`option[value=${input.dataset.plugin}]`);
    option.checked = input.checked;
  });
}

function initializePluginBox(item) {
  const checkbox = item.querySelector(pluginCheckboxSelector);
  const option = document.querySelector(`#main-form select option[value=${checkbox.dataset.plugin}]`);

  checkbox.addEventListener("change", updatePluginSelect);
  item.addEventListener("click", function() {
    option.selected = checkbox.checked = !checkbox.checked;
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const page = pluginPage();

  if (page)
    page.querySelectorAll("li").forEach(initializePluginBox);
});
