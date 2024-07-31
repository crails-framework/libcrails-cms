function ctUndo(pageEditor) {
  pageEditor.history.undo();
  return this.dispatchEditorEvent('tool-applied', {
    tool: this
  });
}

function ctRedo(pageEditor) {
  pageEditor.history.redo();
  return this.dispatchEditorEvent('tool-applied', {
    tool: this
  });
}

export default function (pageEditor) {
  const ContentTools = pageEditor.window.Cms.ContentTools;
  const Undo = ContentTools.Tools.Undo;
  const Redo = ContentTools.Tools.Redo;
  Undo.apply = ctUndo.bind(Undo, pageEditor);
  Redo.apply = ctRedo.bind(Redo, pageEditor);
}
