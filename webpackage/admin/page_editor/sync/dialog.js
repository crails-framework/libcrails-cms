import CmsDialog from "../../dialog.js";
import Style from "../../../style.js";
import i18n from "../../../i18n.js";
import {PageSnapshotAction} from "../actions.js";
import {diffPages, applyDiff, importPage} from "./page_diff.js";

const t = key => i18n.t(`admin.page-editor.sync.${key}`);
const CHANGE_ORDER = ["replace", "attr", "shelltext", "text", "add", "remove", "reorder"];
const IMAGE_ATTRIBUTES = ["src", "poster"];

function element(tag, className, text) {
  const el = document.createElement(tag);

  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function componentName(type) {
  return i18n.t(`admin.page-editor.components.${type}`);
}

function valueBox(label, value, change) {
  const box = element("div", "cms-sync-value");
  const caption = element("small", null, label);

  box.appendChild(caption);
  box.appendChild(element("span", null, value === null || value === undefined || value === "" ? "—" : value));
  if (change && change.kind === "attr" && IMAGE_ATTRIBUTES.includes(change.name)
      && /^(\/|https?:|data:image\/)/.test(value || "")) {
    const image = element("img");

    image.src = value;
    box.appendChild(image);
  }
  return box;
}

function describe(change) {
  switch (change.kind) {
  case "add":       return `#${change.position}`;
  case "reorder":   return `${change.count}`;
  case "attr":      return `<${change.tag}> ${change.name}`;
  case "shelltext": return `<${change.tag}>`;
  case "replace":   return t(change.reason == "container" ? "replace-container" : "replace-structure");
  default:          return "";
  }
}

class SyncDialog extends CmsDialog {
  constructor(layout) {
    super();
    this.layout = layout;
    this.controller = layout.localeController;
    this.popup.classList.add("cms-sync-dialog");
    this.rows = [];
    this.render();
  }

  get currentLocale() {
    return this.controller.currentInput.locale;
  }

  get otherLocales() {
    return (window.tr_locales || []).filter(locale => locale != this.currentLocale);
  }

  get sourceLocale() {
    return this.localeSelect.value;
  }

  get sourceHtml() {
    return this.controller.data[this.sourceLocale] || "";
  }

  render() {
    const title = element("div", null, t("title"));
    const picker = element("div");
    const label = element("label", null, t("source-language"));
    const select = document.createElement("select");
    const controls = element("div");
    const apply = element("button", null, t("apply"));
    const importAll = element("button", null, t("import-all"));
    const cancel = element("button", null, i18n.t("admin.cancel"));
    const selectGroup = document.createElement("div");
    const selectAll = element("button", null, i18n.t("admin.select-all"));
    const selectNone = element("button", null, i18n.tt("admin.select-none"));
    const option = element("label", "cms-sync-option");
    const link = document.createElement("input");

    this.otherLocales.forEach(locale => {
      const entry = element("option", null, i18n.t(`locale-names.${locale}`));

      entry.value = locale;
      select.appendChild(entry);
    });
    select.addEventListener("change", () => this.compare());
    this.localeSelect = select;
    this.summary = element("div", "cms-sync-summary");
    this.list = element("div", "cms-sync-list");

    link.type = "checkbox";
    link.checked = true;
    this.linkInput = link;
    option.appendChild(link);
    option.appendChild(document.createTextNode(" " + t("link")));

    apply.type = importAll.type = cancel.type = selectAll.type = selectNone.type = "button";
    apply.addEventListener("click", () => this.apply());
    importAll.addEventListener("click", () => this.importAll());
    cancel.addEventListener("click", () => this.close());
    selectAll.addEventListener("click", () => this.selectBooleans(true));
    selectNone.addEventListener("click", () => this.selectBooleans(false));
    this.applyButton = apply;

    Style.apply("modalTitle", title);
    Style.apply("formGroup", picker);
    Style.apply("buttonGroup", selectGroup);
    Style.apply("modalControls", controls);
    Style.apply("confirmButton", apply);
    Style.apply("button", importAll, selectAll, selectNone);
    Style.apply("dangerButton", cancel);
    picker.appendChild(label);
    picker.appendChild(select);
    selectGroup.appendChild(selectAll);
    selectGroup.appendChild(selectNone);
    controls.append(apply, importAll, cancel);
    this.popup.append(title, picker, this.summary, selectGroup, this.list, option, controls);
    this.compare();
    if (typeof crailscms_on_content_loaded == "function")
      crailscms_on_content_loaded(this.popup);
  }

  compare() {
    this.targetHtml = this.layout.serialize();
    this.diff = diffPages(this.sourceHtml, this.targetHtml);
    this.selection = this.diff.defaultSelection();
    this.renderChanges();
  }

  renderChanges() {
    const { diff } = this;
    const counts = {};

    this.rows = [];
    this.list.innerHTML = "";
    diff.changes.forEach(change => { counts[change.kind] = (counts[change.kind] || 0) + 1; });
    this.summary.textContent = diff.changes.length == 0
      ? t("in-sync")
      : Object.keys(counts).map(kind => `${counts[kind]} ${t(`kind.${kind}`).toLowerCase()}`).join(", ");
    if (diff.stats.untracked > 0)
      this.summary.textContent += ` — ${diff.stats.untracked} ${t("untracked")}`;
    if (diff.changes.length == 0)
      this.list.appendChild(element("div", "cms-sync-empty", this.sourceHtml.trim() ? t("in-sync") : t("source-empty")));
    else
      this.list.appendChild(this.renderNode(diff.root));
    this.applyButton.disabled = false;
    this.refreshInactive();
  }

  hasChanges(node) {
    return node.changes.length > 0 || node.children.some(child => this.hasChanges(child));
  }

  renderNode(node) {
    const wrapper = element("div", "cms-sync-node");

    if (!node.isRoot)
      wrapper.appendChild(element("div", "cms-sync-node-title", componentName(node.type)));
    [...node.changes]
      .sort((a, b) => CHANGE_ORDER.indexOf(a.kind) - CHANGE_ORDER.indexOf(b.kind))
      .forEach(change => wrapper.appendChild(this.renderChange(change)));
    node.children.filter(child => this.hasChanges(child)).forEach(child => {
      wrapper.appendChild(this.renderNode(child));
    });
    return wrapper;
  }

  renderChange(change) {
    const row = element("div", "cms-sync-row");
    const control = element("div", "cms-sync-control");
    const body = element("div", "cms-sync-body");
    const values = element("div", "cms-sync-values");
    const head = element("div");
    let input;

    head.appendChild(element("span", "cms-sync-kind", t(`kind.${change.kind}`)));
    head.appendChild(document.createTextNode(" " + describe(change)));
    body.appendChild(head);
    if (change.kind == "text") {
      input = document.createElement("select");
      ["keep", "reviewed", "replace"].forEach(choice => {
        const option = element("option", null, t(`text-choice.${choice}`));

        option.value = choice;
        input.appendChild(option);
      });
      input.value = this.selection[change.id];
      input.addEventListener("change", () => { this.selection[change.id] = input.value; });
      values.appendChild(valueBox(t("source"), change.to));
      values.appendChild(valueBox(t("translation"), change.from));
    } else {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = this.selection[change.id] === true;
      input.addEventListener("change", () => {
        this.selection[change.id] = input.checked;
        this.refreshInactive();
      });
      if (change.kind == "add" || change.kind == "replace")
        values.appendChild(valueBox(t("source"), change.to, change));
      if (change.kind == "remove")
        values.appendChild(valueBox(t("translation"), change.from, change));
      if (change.kind == "attr" || change.kind == "shelltext") {
        values.appendChild(valueBox(t("translation"), change.from, change));
        values.appendChild(valueBox(t("source"), change.to, change));
      }
      if (change.kind == "replace")
        values.appendChild(valueBox(t("translation"), change.from, change));
    }
    control.appendChild(input);
    if (values.children.length) body.appendChild(values);
    row.append(control, body);
    this.rows.push({ change, row, input });
    return row;
  }

  // Changes below a component that is replaced as a whole don't matter anymore.
  refreshInactive() {
    const replaced = node => {
      for (let current = node.parent ; current ; current = current.parent) {
        if (current.changes.some(c => c.kind == "replace" && this.selection[c.id] === true)) return true;
      }
      return false;
    };

    this.rows.forEach(({ change, row, input }) => {
      const inactive = replaced(change.node);

      row.classList.toggle("is-inactive", inactive);
      input.disabled = inactive;
    });
  }

  selectBooleans(value) {
    this.rows.forEach(({ change, input }) => {
      if (change.kind != "text") {
        input.checked = value;
        this.selection[change.id] = value;
      }
    });
    this.refreshInactive();
  }

  commit(html) {
    if (html != this.targetHtml)
      new PageSnapshotAction(this.layout, this.targetHtml, html).run();
    this.close();
  }

  apply() {
    this.commit(applyDiff(this.diff, this.selection, { link: this.linkInput.checked }));
  }

  importAll() {
    if (this.sourceHtml.trim() && confirm(t("confirm-import")))
      this.commit(importPage(this.sourceHtml));
  }
}

export default function openSyncDialog(layout) {
  new SyncDialog(layout).open();
}
