import FilePicker from "./file_picker.js";

export default function(formGroup, options = {}) {
  const input = formGroup.querySelector("input");
  const libraryButton = formGroup.querySelector("button");

  if (typeof options.updated == "function")
    options.updated();
  libraryButton.addEventListener("click", function(event) {
    event.preventDefault();
    new FilePicker({
      title: options.title || i18n.t("admin.menu.files"),
      mimetype: options.mimetype || "*/*",
      filePicked: function(file) {
        console.log("File picked", file);
        input.value = file[options.fileAttribute || "url"];
        if (typeof options.updated == "function")
          options.updated(file);
      }
    }).open();
  });
}

