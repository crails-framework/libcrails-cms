import i18n from "../i18n.js";
import Uppy, { debugLogger } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import RemoteSources from '@uppy/google-drive';
import ImageEditor from '@uppy/image-editor';
import Form from '@uppy/form';
import Webcam from '@uppy/webcam';
import Audio from '@uppy/audio';
import ScreenCapture from '@uppy/screen-capture';
//import Tus from '@uppy/tus';
import XHRUpload from '@uppy/xhr-upload';
import DropTarget from '@uppy/drop-target';
import Compressor from '@uppy/compressor';
import {updateCsrfTokenFromResponse} from "./csrf_token.js";

function getMetaFields() {
  return [
    {
      id: 'name',
      name: i18n.t("uppy.name"),
      placeholder: i18n.t("uppy.name-placeholder")
    },
    {
      id: 'description',
      name: i18n.t("uppy.description"),
      placeholder: i18n.t("uppy.description-placeholder")
    }
  ];
}

function updateEndpoint(uppy) {
  const token = document.querySelector("[name='csrf-token']").value;
  const plugin = uppy.getPlugin("XHRUpload");
  const path = `${uppy.cms_endpoint}?csrf-token=${encodeURIComponent(token)}`;
  const options = { endpoint: `${window.location.origin}${path}` };

  if (!plugin)
    uppy.use(XHRUpload, options);
  else
    plugin.setOptions(options);
}

function receivedUploadResponse(body) {
  const table = document.querySelector("#uploaded-files");
  const files = body.files;

  for (let id in files) {
    console.log("uploaded file", id, files[id]);
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const type = document.createElement("td");
    const url = document.createElement("td");
    const preview = document.createElement("td");

    name.textContent = files[id].name;
    type.textContent = files[id].mimetype;
    url.textContent = files[id].url;
    if (files[id].miniature_url)
      preview.innerHTML = `<img src="${files[id].miniature_url}"/>`;
    [name, type, url, preview].forEach(el => { row.appendChild(el); });
    table.insertBefore(row, table.children[0]);
  }
}

export function configureUppy(uppy, callback) {
  const COMPANION_URL = "http://companion.uppy.io";
  const COMPANION_ALLOWED_HOSTS = ['https://my-site.com'];

  return i18n.ready.then(function() {
    uppy
    // The main UI that shows files, progress and holds all plugins
    .use(Dashboard, {
      target: '#upload-block',
      inline: true,
      height: 470,
      metaFields: getMetaFields(),
      note: 'Images and video only, 2–3 files, up to 1 MB',
    })
    // All remote services like Instagram and Google Drive in one package
    .use(RemoteSources, {
      // You can manually specify `sources` here, by default all available are included. 
      // See docs: https://uppy.io/docs/remote-sources/#sources.
      companionUrl: COMPANION_URL,
      companionAllowedHosts: COMPANION_ALLOWED_HOSTS,
    })
    .use(Webcam, { target: Dashboard })
    .use(Audio, { target: Dashboard, showRecordingLength: true })
    .use(ScreenCapture, { target: Dashboard })
    .use(Form, { target: '#upload-form' })
    .use(ImageEditor, { target: Dashboard })
    // Allow dropping files on any element or the whole document
    .use(DropTarget, { target: document.body })
    // Optimize images
    .use(Compressor);
    updateEndpoint(uppy);

    uppy.on("complete", result => {
      result.successful.forEach(file => {
        updateCsrfTokenFromResponse(file.response.body);
      });
      updateEndpoint(uppy);
      callback(result);
    });

    return uppy;
  });
}

export function attachmentsPath() {
  const meta = document.querySelector("meta[name='attachments-admin-path']");

  return meta ? meta.content : "/admin/attachments";
}

export function createUppyUpdater(uploadId) {
  const uppy = window.uppy = new Uppy({
    logger: debugLogger,
    restrictions: {
      maxNumberOfFiles: 1
    }
  });
  uppy.cms_endpoint = `${attachmentsPath()}/${uploadId}/reupload`;
  return configureUppy(uppy, result => {});
}

export function createUppy() {
  const uppy = window.uppy = new Uppy({ logger: debugLogger })

  uppy.cms_endpoint = `${attachmentsPath()}/upload`;
  return configureUppy(uppy, result => {
    result.successful.forEach(file => {
      receivedUploadResponse(file.response.body);
    });

    console.log('failed files:', result.failed)
  });
}
