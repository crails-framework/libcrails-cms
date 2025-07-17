import filePickerField from "./file_picker_field.js";

function updatePreview(preview, input) {
  try {
    if (input.value[0] == '/')
      preview.src = window.location.origin + input.value;
    else
      preview.src = input.value;
  } catch (err) {
    console.error(err);
  }
}

export default function(formGroup, fileAttribute = "url") {
  const input = formGroup.querySelector("input");
  const preview = formGroup.querySelector("img");

  if (preview) {
    updatePreview(preview, input);
    preview.style.display = "none";
    preview.addEventListener("load", function() {
      preview.style.display = "block";
    });
    preview.addEventListener("error", function() {
      preview.style.display = "none";
    });
    input.addEventListener("change", function() {
       updatePreview(preview, input);
    });
  } else {
    console.warn("image picker field lacks the <img> attribute required to display a preview", formGroup);
  }
  return filePickerField(formGroup, {
    title: i18n.t("admin.image-library"),
    mimetype: "image/*",
    fileAttribute: fileAttribute,
    upddate: function() {
      updatePreview(preview, input)
    }
  });
}
