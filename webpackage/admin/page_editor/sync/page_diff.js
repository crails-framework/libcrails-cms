i// Diff & merge engine used to synchronize a PageEditor page with the same
// page written in another language.
//
// This module only deals with serialized HTML and the DOM. It knows nothing
// about the editor, ContentTools or the admin UI, which keeps it testable.
//
// MODEL
// -----
// A page is a tree of components (`[data-component]`). Every component has:
//
//   - child components, matched between both pages by `data-id` (ids survive
//     the copy from one language to another). When two lists of components
//     have no id in common (pages that were built independently), they are
//     matched by type and position instead.
//   - editable regions (`[data-editable]`): this is the text. A translation
//     is *expected* to differ from the source, so a plain comparison would
//     be noise. Instead, each target region remembers a hash of the source
//     it was translated from (`data-sync-text`); we only report a region
//     when the source no longer matches that hash ("outdated translation").
//   - a "shell": everything else (attributes, images, <style>, <inject>...).
//     Same idea: the target root remembers the hash of the source shell it
//     was last synchronized with (`data-sync-shell`), and shell differences
//     are only reported when the source moved on since then (or when there
//     is no reference yet).
//
// This is a two-way diff plus recorded references, not a three-way merge:
// nothing is stored outside of the page HTML itself.
//
// CHANGES
// -------
//   add      component present in the source only          (default: on)
//   remove   component present in the target only          (default: off)
//   reorder  matched components are in another order        (default: off)
//   attr     attribute of an element in a component shell   (default: off)
//   shelltext static text inside a component shell          (default: off)
//   text     editable region whose source text changed      (default: keep)
//   replace  shell structures can't be aligned: replace the
//            whole component by the source version          (default: off)
//
// Nothing that would overwrite existing target content is selected by default.

export const SHELL_BASE_ATTR = "data-sync-shell";
export const TEXT_BASE_ATTR = "data-sync-text";

const IGNORED_ATTRS = new Set([
  "data-id", "data-cms-active", "contenteditable", SHELL_BASE_ATTR, TEXT_BASE_ATTR
]);
const CT_CLASS = /^ce-element/;

// --------------------------------------------------------------------------
// Small helpers
// --------------------------------------------------------------------------

export function hash(string) { // FNV-1a, 32 bits. Not cryptographic, not meant to be.
  let h = 0x811c9dc5;

  for (let i = 0 ; i < string.length ; ++i) {
    h ^= string.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function parseHtml(html) {
  const doc = document.implementation.createHTMLDocument("");

  doc.body.innerHTML = html || "";
  return doc.body;
}

const collapse = string => string.replace(/\s+/g, " ").trim();
const isComponent = el => el.nodeType === 1 && el.hasAttribute("data-component");
const isEditable = el => el.nodeType === 1 && el.hasAttribute("data-editable");
const componentId = el => el.getAttribute("data-id") || null;
const componentType = el => el.getAttribute("data-component");

function nearestComponent(el) {
  let parent = el.parentElement;

  while (parent && !isComponent(parent)) parent = parent.parentElement;
  return parent;
}

function classTokens(el) {
  return (el.getAttribute("class") || "").split(/\s+/).filter(c => c && !CT_CLASS.test(c));
}

// Splits on ';' like a CSS parser would: not inside parentheses or quotes,
// which matters for `url(data:image/png;base64,...)`.
function splitDeclarations(css) {
  const result = [];
  let depth = 0, quote = null, current = "";

  for (const char of css) {
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === ";" && depth === 0) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

function styleDeclarations(el) {
  return splitDeclarations(el.getAttribute("style") || "").map(d => d.trim()).filter(Boolean).map(d => {
    const colon = d.indexOf(":");
    return colon < 0 ? d : `${d.slice(0, colon).trim().toLowerCase()}: ${d.slice(colon + 1).trim()}`;
  }).filter(d => !/^(top|left): 0(px)?$/.test(d)); // leftovers of move animations
}

// Value as displayed and as written when a change is applied.
function attrValue(el, name) {
  if (!el.hasAttribute(name)) return null;
  if (name === "class") {
    const tokens = classTokens(el);
    return tokens.length ? tokens.join(" ") : null;
  }
  if (name === "style") {
    const declarations = styleDeclarations(el);
    return declarations.length ? declarations.join("; ") : null;
  }
  return el.getAttribute(name);
}

// Value as compared: order of classes and of style declarations is irrelevant.
function attrKey(el, name) {
  const value = attrValue(el, name);

  if (value === null) return null;
  if (name === "class") return value.split(" ").sort().join(" ");
  if (name === "style") return styleDeclarations(el).sort().join("; ");
  return value;
}

function relevantAttrNames(el) {
  return el.getAttributeNames().filter(name => !IGNORED_ATTRS.has(name));
}

function setAttr(el, name, value) {
  if (value === null)
    el.removeAttribute(name);
  else
    el.setAttribute(name, value);
}

// The background component writes its own id in a <style> element. When two
// matched components have different ids (pages matched by position), that id
// must not count as a difference, and must be translated when copied.
const idNormalize = (text, id) => id ? text.split(`data-id="${id}"`).join('data-id="{id}"') : text;
const idDenormalize = (text, id) => id ? text.split('data-id="{id}"').join(`data-id="${id}"`) : text;

// HTML of an editable region, minus what ContentTools adds while editing.
function normalizedHtml(el) {
  const clone = el.cloneNode(true);

  for (const child of clone.querySelectorAll("*")) {
    const tokens = classTokens(child);

    child.removeAttribute("contenteditable");
    if (tokens.length)
      child.setAttribute("class", tokens.join(" "));
    else
      child.removeAttribute("class");
  }
  return collapse(clone.innerHTML);
}

export function snippet(el, max = 160) {
  let text = collapse(el.textContent || "");

  if (!text) {
    const media = el.querySelector("img, video, iframe");
    text = media ? `[${media.tagName.toLowerCase()}]` : "";
  }
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

// --------------------------------------------------------------------------
// Component shells
// --------------------------------------------------------------------------

// Child nodes that take part in the comparison of a shell: elements that are
// not components (those are compared on their own), and non-blank text.
function shellNodes(el) {
  const list = [];

  for (const node of el.childNodes) {
    if (node.nodeType === 1 && !isComponent(node))
      list.push(node);
    else if (node.nodeType === 3 && node.nodeValue.trim() !== "")
      list.push(node);
  }
  return list;
}

function attributesSignature(el) {
  return relevantAttrNames(el).sort().map(name => `${name}=${attrKey(el, name)}`).join(";");
}

// Fingerprint of the shell of a component: its markup without nested
// components and without the content of editable regions.
function shellSignature(root) {
  const id = componentId(root);
  const out = [];
  const visit = el => {
    out.push("<", el.tagName, " ", attributesSignature(el), ">");
    if (isEditable(el))
      return out.push("[editable]</>");
    for (const node of shellNodes(el)) {
      if (node.nodeType === 3)
        out.push("#", collapse(idNormalize(node.nodeValue, id)));
      else
        visit(node);
    }
    out.push("</>");
  };

  visit(root);
  return out.join("");
}

function ownedEditables(el) {
  const list = isEditable(el) ? [el] : [];

  for (const editable of el.querySelectorAll("[data-editable]")) {
    if (nearestComponent(editable) === el) list.push(editable);
  }
  return list;
}

// Walks the shells of two components side by side. Succeeds only when both
// have the same shape (same elements, same number of text nodes...), in which
// case every difference is an attribute or a text node that can be patched.
function alignShell(sRoot, tRoot) {
  const result = { ok: true, attrs: [], texts: [], editables: [] };
  const sId = componentId(sRoot), tId = componentId(tRoot);

  const diffAttributes = (s, t) => {
    const names = new Set([...relevantAttrNames(s), ...relevantAttrNames(t)]);

    for (const name of names) {
      if (attrKey(s, name) !== attrKey(t, name))
        result.attrs.push({ s, t, name, from: attrValue(t, name), to: attrValue(s, name) });
    }
  };

  const walk = (s, t) => {
    diffAttributes(s, t);
    if (isEditable(s) || isEditable(t)) {
      if (isEditable(s) !== isEditable(t)) return false;
      result.editables.push({ s, t });
      return true;
    }
    const sNodes = shellNodes(s), tNodes = shellNodes(t);

    if (sNodes.length !== tNodes.length) return false;
    for (let i = 0 ; i < sNodes.length ; ++i) {
      const a = sNodes[i], b = tNodes[i];

      if (a.nodeType !== b.nodeType) return false;
      if (a.nodeType === 3) {
        if (collapse(idNormalize(a.nodeValue, sId)) !== collapse(idNormalize(b.nodeValue, tId)))
          result.texts.push({ s: a, t: b, parent: s });
      } else {
        if (a.tagName !== b.tagName || !walk(a, b)) return false;
      }
    }
    return true;
  };

  result.ok = walk(sRoot, tRoot);
  if (!result.ok) {
    // Can't patch attribute by attribute. Editable regions can still be paired
    // by order, as long as there are as many on both sides.
    const sList = ownedEditables(sRoot), tList = ownedEditables(tRoot);

    result.attrs = [];
    result.texts = [];
    result.editables = sList.length === tList.length ? sList.map((s, i) => ({ s, t: tList[i] })) : [];
  }
  return result;
}

// --------------------------------------------------------------------------
// Matching components
// --------------------------------------------------------------------------

// Components below `el`, not going through other components.
function directComponents(el) {
  const list = [];
  const visit = node => {
    for (const child of node.children) {
      if (isComponent(child))
        list.push(child);
      else
        visit(child);
    }
  };

  visit(el);
  return list;
}

// Components below `el` grouped by their parent element (the "container").
// A well-formed component has a single container.
function childGroups(el) {
  const groups = new Map();

  for (const child of directComponents(el)) {
    if (!groups.has(child.parentElement)) groups.set(child.parentElement, []);
    groups.get(child.parentElement).push(child);
  }
  return groups;
}

function pairComponents(sList, tList) {
  const pairs = new Map(); // source element -> target element
  const taken = new Set();
  const byId = new Map();
  let fuzzy = false;

  for (const t of tList) {
    if (componentId(t) && !byId.has(componentId(t))) byId.set(componentId(t), t);
  }
  for (const s of sList) {
    const t = componentId(s) && byId.get(componentId(s));

    if (t && !taken.has(t) && componentType(t) === componentType(s)) {
      pairs.set(s, t);
      taken.add(t);
    }
  }
  if (pairs.size === 0 && sList.length && tList.length) {
    // Nothing in common: the pages were built independently. Pair components
    // of the same type, in order. Looks wrong if the pages are unrelated, but
    // every difference is shown and nothing is applied unless picked.
    const queues = new Map();

    tList.forEach(t => {
      if (!queues.has(componentType(t))) queues.set(componentType(t), []);
      queues.get(componentType(t)).push(t);
    });
    for (const s of sList) {
      const queue = queues.get(componentType(s));
      if (queue && queue.length) {
        pairs.set(s, queue.shift());
        fuzzy = true;
      }
    }
  }
  return { pairs, fuzzy };
}

function pathTo(root, el) {
  const path = [];

  while (el && el !== root) {
    path.unshift(Array.prototype.indexOf.call(el.parentElement.children, el));
    el = el.parentElement;
  }
  return path;
}

function resolvePath(root, path) {
  for (const index of path) {
    root = root && root.children[index];
  }
  return root || null;
}

// --------------------------------------------------------------------------
// Diff
// --------------------------------------------------------------------------

function addChange(ctx, node, change) {
  change.id = `c${ctx.changes.length + 1}`;
  change.node = node;
  ctx.changes.push(change);
  node.changes.push(change);
  return change;
}

function buildNode(ctx, sEl, tEl, parent, fuzzy) {
  const node = {
    sEl, tEl, parent, fuzzy,
    isRoot: false,
    depth: parent.depth + 1,
    type: componentType(sEl),
    id: componentId(sEl),
    changes: [], children: [], editables: [],
    shellHash: hash(shellSignature(sEl))
  };
  const alignment = alignShell(sEl, tEl);
  const shellReviewed = tEl.getAttribute(SHELL_BASE_ATTR) === node.shellHash;

  node.editables = alignment.editables;
  if (!shellReviewed) {
    if (alignment.ok) {
      alignment.attrs.forEach(attr => addChange(ctx, node, { kind: "attr", ...attr, tag: attr.t.tagName.toLowerCase() }));
      alignment.texts.forEach(text => addChange(ctx, node, {
        kind: "shelltext", s: text.s, t: text.t, tag: text.parent.tagName.toLowerCase(),
        from: collapse(text.t.nodeValue), to: collapse(text.s.nodeValue)
      }));
    } else {
      addChange(ctx, node, { kind: "replace", reason: "structure", from: snippet(tEl), to: snippet(sEl) });
    }
  }
  for (const pair of node.editables) {
    const sHtml = normalizedHtml(pair.s), tHtml = normalizedHtml(pair.t);
    const base = pair.t.getAttribute(TEXT_BASE_ATTR);

    if (sHtml === tHtml) continue;
    if (!base) {
      ctx.stats.untracked++; // different, but no way to tell whether the source changed
    } else if (base !== hash(sHtml)) {
      pair.change = addChange(ctx, node, { kind: "text", s: pair.s, t: pair.t, from: snippet(pair.t), to: snippet(pair.s) });
    }
  }
  buildChildren(ctx, node);
  return node;
}

function buildChildren(ctx, node) {
  const sGroups = childGroups(node.sEl), tGroups = childGroups(node.tEl);
  const sList = [...sGroups.values()].flat(), tList = [...tGroups.values()].flat();
  const { pairs, fuzzy } = pairComponents(sList, tList);

  for (const s of sList) {
    if (pairs.has(s)) node.children.push(buildNode(ctx, s, pairs.get(s), node, fuzzy));
  }
  if (sGroups.size > 1 || tGroups.size > 1) {
    ctx.stats.skipped++; // components spread on several containers: only matched ones are compared
    return;
  }
  const sContainer = sGroups.size ? [...sGroups.keys()][0] : null;
  let tContainer = tGroups.size ? [...tGroups.keys()][0] : null;

  if (sList.length && !tContainer) {
    // Nothing to learn from the target: assume it's built like the source.
    tContainer = resolvePath(node.tEl, pathTo(node.sEl, sContainer));
    if (!tContainer) {
      if (!node.changes.some(change => change.kind === "replace"))
        addChange(ctx, node, { kind: "replace", reason: "container", from: snippet(node.tEl), to: snippet(node.sEl) });
      return;
    }
  }
  node.container = { tContainer, sList, tList, pairs };

  const matchedTargets = new Set(pairs.values());
  const targetOrder = tList.filter(t => matchedTargets.has(t));
  const expectedOrder = sList.filter(s => pairs.has(s)).map(s => pairs.get(s));

  sList.forEach((s, index) => {
    if (!pairs.has(s)) addChange(ctx, node, { kind: "add", s, position: index + 1, from: "", to: snippet(s) });
  });
  tList.forEach(t => {
    if (!matchedTargets.has(t)) addChange(ctx, node, { kind: "remove", t, from: snippet(t), to: "" });
  });
  if (expectedOrder.some((t, i) => t !== targetOrder[i]))
    addChange(ctx, node, { kind: "reorder", count: expectedOrder.length });
}

function defaultValue(change) {
  switch (change.kind) {
    case "add":  return true;
    case "text": return "keep";
    default:     return false;
  }
}

export function diffPages(sourceHtml, targetHtml) {
  const sRoot = parseHtml(sourceHtml), tRoot = parseHtml(targetHtml);
  const ctx = { changes: [], stats: { untracked: 0, skipped: 0 } };
  const root = {
    sEl: sRoot, tEl: tRoot, parent: null, isRoot: true, depth: -1,
    changes: [], children: [], editables: []
  };

  buildChildren(ctx, root);
  return {
    sourceHtml, targetHtml, root,
    changes: ctx.changes,
    stats: ctx.stats,
    defaultSelection() {
      const selection = {};
      this.changes.forEach(change => { selection[change.id] = defaultValue(change); });
      return selection;
    }
  };
}

// --------------------------------------------------------------------------
// Applying changes
// --------------------------------------------------------------------------

function stripEditingState(root) {
  for (const el of [root, ...root.querySelectorAll("*")]) {
    const tokens = classTokens(el);

    el.removeAttribute("contenteditable");
    el.removeAttribute("data-cms-active");
    if (el.hasAttribute("class")) {
      if (tokens.length) el.setAttribute("class", tokens.join(" "));
      else el.removeAttribute("class");
    }
  }
}

// Marks a freshly copied subtree as "in sync with the source".
function stampSubtree(root) {
  for (const component of [root, ...root.querySelectorAll("[data-component]")]) {
    if (isComponent(component))
      component.setAttribute(SHELL_BASE_ATTR, hash(shellSignature(component)));
  }
  for (const editable of [root, ...root.querySelectorAll("[data-editable]")]) {
    if (isEditable(editable))
      editable.setAttribute(TEXT_BASE_ATTR, hash(normalizedHtml(editable)));
  }
}

function copyForTarget(sEl, tDocument) {
  const copy = tDocument.importNode(sEl, true);

  stripEditingState(copy);
  stampSubtree(copy);
  return copy;
}

// Rebuilds the order of the components of a container. Components only found
// in the target stay attached to the sibling that precedes them; copies of
// added components are placed after the counterpart of their own predecessor.
function assemble(node, selection) {
  const { tContainer, sList, tList, pairs } = node.container;
  const accepted = kind => node.changes.filter(c => c.kind === kind && selection[c.id] === true);
  const adds = new Set(accepted("add").map(c => c.s));
  const removes = new Set(accepted("remove").map(c => c.t));
  const reorder = accepted("reorder").length > 0;

  if (!adds.size && !removes.size && !reorder) return;

  const current = new Map(node.children.map(child => [child.sEl, child.tEl])); // a child may have been replaced
  const tNow = tList.map(t => {
    for (const child of node.children) if (child.tEl === t || pairs.get(child.sEl) === t) return child.tEl;
    return t;
  });
  const sOf = new Map([...current].map(([s, t]) => [t, s]));
  const sIndex = new Map(sList.map((s, i) => [s, i]));
  const heads = [], followers = new Map();
  const attach = (anchor, el) => {
    if (anchor === null) heads.push(el);
    else if (followers.has(anchor)) followers.get(anchor).push(el);
    else followers.set(anchor, [el]);
  };

  let lastSource = null;
  for (const s of sList) {
    if (current.has(s)) {
      lastSource = current.get(s);
    } else if (adds.has(s)) {
      const copy = copyForTarget(s, tContainer.ownerDocument);
      attach(lastSource, copy);
      lastSource = copy;
    }
  }
  let matched = tNow.filter(t => sOf.has(t));
  if (reorder) matched.sort((a, b) => sIndex.get(sOf.get(a)) - sIndex.get(sOf.get(b)));

  let lastKept = null;
  tNow.forEach((t, i) => {
    if (removes.has(tList[i])) return;
    if (!sOf.has(t)) attach(lastKept, t);
    lastKept = t;
  });

  const ordered = [];
  const emit = el => { ordered.push(el); (followers.get(el) || []).forEach(emit); };
  heads.forEach(emit);
  matched.forEach(emit);

  const last = tNow[tNow.length - 1];
  const reference = last && last.parentNode === tContainer ? last.nextSibling : null;

  tNow.forEach(t => { if (t.parentNode === tContainer) tContainer.removeChild(t); });
  ordered.forEach(el => tContainer.insertBefore(el, reference));
}

function applyNode(node, selection, options) {
  const replace = node.changes.find(change => change.kind === "replace");

  if (replace && selection[replace.id] === true) {
    const copy = copyForTarget(node.sEl, node.tEl.ownerDocument);

    node.tEl.replaceWith(copy);
    node.tEl = copy;
    return;
  }
  node.children.forEach(child => applyNode(child, selection, options));
  for (const change of node.changes) {
    const choice = selection[change.id];

    switch (change.kind) {
    case "attr":
      if (choice === true) setAttr(change.t, change.name, change.to);
      break;
    case "shelltext":
      if (choice === true)
        change.t.nodeValue = idDenormalize(idNormalize(change.s.nodeValue, componentId(node.sEl)), componentId(node.tEl));
      break;
    case "text":
      if (choice === "replace") change.t.innerHTML = change.s.innerHTML;
      if (choice === "replace" || choice === "reviewed")
        change.t.setAttribute(TEXT_BASE_ATTR, hash(normalizedHtml(change.s)));
      break;
    }
  }
  if (node.container) assemble(node, selection);
  if (options.link && !node.isRoot) link(node);
}

// Records what the target was synchronized with, so that later comparisons
// only report what changed in the source since.
function link(node) {
  const { tEl, sEl } = node;
  const sId = componentId(sEl), tId = componentId(tEl);

  tEl.setAttribute(SHELL_BASE_ATTR, node.shellHash);
  for (const { s, t } of node.editables) {
    if (!t.hasAttribute(TEXT_BASE_ATTR)) t.setAttribute(TEXT_BASE_ATTR, hash(normalizedHtml(s)));
  }
  // Components matched by position adopt the id of their counterpart, so that
  // they are matched for real next time.
  if (node.fuzzy && sId && tId && sId !== tId && !tEl.ownerDocument.querySelector(`[data-id="${sId}"]`)) {
    tEl.setAttribute("data-id", sId);
    for (const style of tEl.querySelectorAll("style")) {
      style.textContent = style.textContent.split(`data-id="${tId}"`).join(`data-id="${sId}"`);
    }
  }
}

// Applies the picked changes (see `diff.defaultSelection()` for the format of
// `selection`) and returns the HTML of the resulting page.
//
//   options.link   (default true) record the source as the reference of the
//                  target, even for what was left alone.
export function applyDiff(diff, selection = diff.defaultSelection(), options = {}) {
  const fresh = diffPages(diff.sourceHtml, diff.targetHtml); // ids are deterministic

  applyNode(fresh.root, selection, { link: options.link !== false });
  return fresh.root.tEl.innerHTML;
}

// Replaces the whole page by the source page (ids are kept, so both pages
// stay matched).
export function importPage(sourceHtml) {
  const root = parseHtml(sourceHtml);

  stampSubtree(root);
  for (const component of root.querySelectorAll("[data-component]")) stripEditingState(component);
  return root.innerHTML;
}
