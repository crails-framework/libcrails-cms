import FilePicker from "../../file_picker.js";

class ImageUploader {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.addEventListener("imageuploader.mount", this.onMounted.bind(this));
  }

  onMounted(event) {
    event.preventDefault();
    this.dialog._domUpload.addEventListener("click", this.onRequireFile.bind(this));
  }

  onRequireFile() {
      const picker = new FilePicker({
        title:      i18n.t("admin.image-library"),
        mimetype:   "image/*",
        filePicked: this.onFilePicked.bind(this),
      });

      picker.open();
  }

  onFilePicked(file) {
    ImageUploader.imagePath = file.url;
    ImageUploader.imageSize = [file.width, file.height];
    this.dialog.populate(ImageUploader.imagePath, ImageUploader.imageSize);
  }
}

ImageUploader.imagePath = "image.png";
ImageUploader.imageSize = [350,350];

export default function (dialog) {
  return new ImageUploader(dialog);
}
