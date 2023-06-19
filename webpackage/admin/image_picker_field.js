import FilePicker from "./file_picker.js";

function updatePreview(preview, input) {
  window.poil = input;
  console.log("updatePreview", preview, input, input.value);
  if (input.value[0] == '/')
    preview.src = window.location.origin + input.value;
  else
    preview.src = input.value;
}

export default function(formGroup, fileAttribute = "url") {
  const input = formGroup.querySelector("input");
  const libraryButton = formGroup.querySelector("button");
  const preview = formGroup.querySelector("img");

  updatePreview(preview, input);
  preview.style.visibility = "hidden";
  preview.addEventListener("load", function() {
    preview.style.visibility = "visible";
  });
  preview.addEventListener("error", function() {
    preview.style.visibility = "hidden";
  });
  input.addEventListener("change", function() {
     updatePreview(preview, input);
  });
  libraryButton.addEventListener("click", function(event) {
    event.preventDefault();
    new FilePicker({
      title: i18n.t("admin.image-library"),
      mimetype: "image/*",
      filePicked: function(file) {
        console.log("File picked", file);
        input.value = file[fileAttribute];
        updatePreview(preview, input);
      }
    }).open();
  });
}
