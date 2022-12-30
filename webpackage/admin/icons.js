export default function (name) {
  const icon = document.querySelector(`#icon-templates [data-icon='${name}']`);

  return icon ? icon.innerHTML : "";
}
