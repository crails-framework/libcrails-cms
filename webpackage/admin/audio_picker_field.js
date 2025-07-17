import filePickerField from "./file_picker_field.js";

function updatePreview(preview, input) {
  try {
    preview.innerHTML = "";
    console.log("updatePreview", preview, input, input.value);
    if (input.value[0] == '/')
      preview.src = window.location.origin + input.value;
    else
      preview.src = input.value;
  } catch (err) {
    console.error(err);
  }
}

export default function(formGroup) {
  const input = formGroup.querySelector("input");
  const preview = formGroup.querySelector("audio");

  return filePickerField(formGroup, {
    title: i18n.t("admin.audio-library"),
    mimetype: "audio/*",
    update: function() {
      updatePreview(preview, input);
    }
  });
}
