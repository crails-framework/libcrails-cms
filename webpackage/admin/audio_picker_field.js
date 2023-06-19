import FilePicker from "./file_picker.js";

function updatePreview(preview, input) {
  preview.innerHTML = "";
  console.log("updatePreview", preview, input, input.value);
  if (input.value[0] == '/')
    preview.src = window.location.origin + input.value;
  else
    preview.src = input.value;
}

export default function(formGroup) {
  const input = formGroup.querySelector("input");
  const libraryButton = formGroup.querySelector("button");
  const preview = formGroup.querySelector("audio");

  updatePreview(preview, input);
  libraryButton.addEventListener("click", function(event) {
    event.preventDefault();
    new FilePicker({
      title: i18n.t("admin.audio-library"),
      mimetype: "audio/*",
      filePicked: function(file) {
        console.log("File picked", file);
        input.value = file.url;
        updatePreview(preview, input);
      }
    }).open();
  });
}
