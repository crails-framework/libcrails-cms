import FilePicker from "../../file_picker.js";

window.attemptDirectAction = false;

class ImageUploader {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.addEventListener("imageuploader.mount", this.onMounted.bind(this));
    this.dialog.addEventListener("imageuploader.save", this.onSave.bind(this));
  }

  onMounted() {
    this.dialog.unmount();
    this.onRequireFile();
  }

  onRequireFile(event) {
    const picker = new FilePicker({
      title:      i18n.t("admin.image-library"),
      mimetype:   "image/*",
      filePicked: this.onFilePicked.bind(this),
    });

    if (event)
      event.preventDefault();
    picker.open();
  }

  onFilePicked(file) {
    ImageUploader.imagePath = `/attachments/by-id/${file.id}`;
    ImageUploader.imageSize = [file.width, file.height];
    this.onSave();
  }

  onSave() {
    this.dialog.save(ImageUploader.imagePath, ImageUploader.imageSize);
  }
}

ImageUploader.imagePath = "image.png";
ImageUploader.imageSize = [350,350];

export default function (dialog) {
  return new ImageUploader(dialog);
}
