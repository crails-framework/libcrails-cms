import {Command, Plugin} from '@ckeditor/ckeditor5-core';
import {toWidget} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export const CKEditorExports = {
  Plugin:     Plugin,
  Command:    Command,
  toWidget:   toWidget,
  Widget:     Widget,
  ButtonView: ButtonView
};
