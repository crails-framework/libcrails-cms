import hljs from "highlight.js/lib/core";
import xmlHighlight from "highlight.js/lib/languages/xml";

let styleEnabled = false;
const highlightStyle = "foundation";

function initializeHighlight() {
  const link = document.createElement("link");

  hljs.registerLanguage('html', xmlHighlight);
  hljs.registerLanguage('xml', xmlHighlight);
  link.rel = "stylesheet";
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${highlightStyle}.min.css`;
  document.head.appendChild(link);
  styleEnabled = true;
}

export default class {
  constructor(textarea) {
    if (!styleEnabled) initializeHighlight();
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("cms-html-textarea");
    this.root = document.createElement("pre");
    this.codeElement = document.createElement("code");
    this.codeElement.classList.add("language-html");
    this.textarea = textarea;
    this.indentSize = 2;
    this.root.appendChild(this.codeElement);
    this.wrapper.appendChild(this.root);
    textarea.wrap = "soft";
    textarea.spellcheck = false;
    textarea.addEventListener("input", this.updateCode.bind(this));
    textarea.addEventListener("scroll", this.onScroll.bind(this));
    textarea.addEventListener("keydown", this.onKeyDown.bind(this));
    this.keyHandlers = [
      {
        match: (e) => { return e.key === "Enter"; },
        action: this.onEnterPressed.bind(this)
      },
      {
        match: (e) => { return e.key === "Tab" && !e.shiftKey && !this.hasSelection; },
        action: this.onTabPressed.bind(this)
      },
      {
        match: (e) => { return e.key == "Tab" && e.shiftKey && !this.hasSelection; },
        action: this.onTabAndShiftPressed.bind(this)
      },
      {
        match: (e) => { return e.key == "Tab" && this.hasSelection; },
        action: this.onTabPressedWithRangeSelection.bind(this)
      },
      {
        match: (e) => { return e.shiftKey && (e.key === "Delete" || e.key === "Backspace"); },
        action: this.deleteEntireLine.bind(this)
      },
      {
        match: (e) => { return e.key === "Home"; },
        action: this.moveCursorToLineStart.bind(this)
      }
    ];
  }

  get hasSelection() {
    return this.textarea.selectionStart != this.textarea.selectionEnd;
  }

  replaceTextArea() {
    this.textarea.parentElement.insertBefore(this.wrapper, this.textarea);
    this.wrapper.appendChild(this.textarea);
  }

  onScroll() {
    this.root.scrollTop = this.textarea.scrollTop;
    this.root.scrollLeft = this.textarea.scrollLeft;
  }

  insert(text) {
    let preContent = this.textarea.value.substring(0, this.textarea.selectionStart);
    let postContent = this.textarea.value.substring(this.textarea.selectionEnd);

    this.textarea.value = preContent + text + postContent;
    this.updateCode();
  }

  updateCode() {
    let content = this.textarea.value;

    // encode the special characters 
    content = content.replace(/&/g, '&amp;');
    content = content.replace(/</g, '&lt;');
    content = content.replace(/>/g, '&gt;');

    // fill the encoded text to the code
    this.codeElement.innerHTML = content;

    // call highlight.js to render the syntax highligtning
    this.highlightJS();
  }

  highlightJS() {
    delete this.codeElement.dataset.highlighted;
    hljs.highlightElement(this.codeElement);
  }

  onKeyDown(event) {
    for (let keyHandler in this.keyHandlers) {
      if (keyHandler.match(event))
        return keyHandler.action(event);
    }
  }

  onEnterPressed(e) {
    // Get the cursor position
    let cursorPos = this.textarea.selectionStart;
    // Get the previous line
    let prevLine = this.textarea.value.substring(0, cursorPos).split('\n').slice(-1)[0];
    // Get the indentation of the previous line
    let indent = prevLine.match(/^\s*/)[0];
    // Add a new line with the same indentation
    this.textarea.setRangeText('\n' + indent, cursorPos, cursorPos, 'end');
    // remove focus
    this.textarea.blur();
    // regain focus (this is force the textarea scroll to caret position in case the caret falls out the textarea visible area)
    this.textarea.focus();
    // copy the code from textarea to code block      
    this.updateCode();
    return true;
  }

  onTabPressed(e) {
    if (this.hasSelection())
      return this.onTabPressedWithRangeSelection(e);
    // Get the current cursor position
    let cursorPosition = this.textarea.selectionStart;
    // Insert 4 white spaces at the cursor position
    let newValue = this.textarea.value.substring(0, cursorPosition) + "    " +
        this.textarea.value.substring(cursorPosition);
    // Update the textarea value and cursor position
    this.textarea.value = newValue;
    this.textarea.selectionStart = cursorPosition + 4;
    this.textarea.selectionEnd = cursorPosition + 4;
    // copy the code from textarea to code block      
    this.updateCode();
  }

  onTabAndShiftPressed(e) {
    if (this.hasSelection())
      return this.onTabPressedWithRangeSelection(e);
    // Get the current cursor position
    let cursorPosition = this.textarea.selectionStart;
    // Check the previous characters for spaces
    let leadingSpaces = 0;
    for (let i = 0; i < 4; i++) {
      if (this.textarea.value[cursorPosition - i - 1] === " ") {
        leadingSpaces++;
      } else {
        break;
      }
    }
    if (leadingSpaces > 0) {
      // Remove the spaces
      let newValue = this.textarea.value.substring(0, cursorPosition - leadingSpaces) +
        this.textarea.value.substring(cursorPosition);
      // Update the textarea value and cursor position
      this.textarea.value = newValue;
      this.textarea.selectionStart = cursorPosition - leadingSpaces;
      this.textarea.selectionEnd = cursorPosition - leadingSpaces;
    }
    // copy the code from textarea to code block
    this.updateCode();
  }

  onTabPressedWithRangeSelection(e) {
    // split the textarea content into lines
    let lines = this.textarea.value.split('\n');
    // find the start/end lines
    let startPos = this.textarea.value.substring(0, this.textarea.selectionStart).split('\n').length - 1;
    let endPos = this.textarea.value.substring(0, this.textarea.selectionEnd).split('\n').length - 1;
    // calculating total removed white spaces
    // these values will be used for adjusting new cursor position
    let spacesRemovedFirstLine = 0;
    let spacesRemoved = 0;

    // [Shift] key was pressed (this means we're un-indenting)
    if (e.shiftKey) {
      // iterate over all lines
      for (let i = startPos; i <= endPos; i++) {
        // /^ = from the start of the line,
        // {1,4} = remove in between 1 to 4 white spaces that may existed
        lines[i] = lines[i].replace(/^ {1,4}/, function (match) {
          // "match" is a string (white space) extracted
          // obtaining total white spaces removed
          // total white space removed at first line
          if (i == startPos)
              spacesRemovedFirstLine = match.length;
          // total white space removed overall
          spacesRemoved += match.length;
          return '';
        });
      }
    }
    // no shift key, so we're indenting
    else {
      // iterate over all lines
      for (let i = startPos; i <= endPos; i++) {
        // add a tab to the start of the line
        lines[i] = ' '.repeat(this.indentSize) + lines[i]; // two spaces
      }
    }
    // remember the cursor position
    let start = this.textarea.selectionStart;
    let end = this.textarea.selectionEnd;
    // put the modified lines back into the textarea
    this.textarea.value = lines.join('\n');
    // adjust the position of cursor start selection
    this.textarea.selectionStart = e.shiftKey ?
        start - spacesRemovedFirstLine : start + 4;
    // adjust the position of cursor end selection
    this.textarea.selectionEnd = e.shiftKey ?
        end - spacesRemoved : end + 4 * (endPos - startPos + 1);
    // copy the code from textarea to code block      
    this.updateCode();
  }

  deleteEntireLine(e) {
    // find the start/end lines
    let startPos = this.textarea.value.substring(0, this.textarea.selectionStart).split('\n').length - 1;
    let endPos = this.textarea.value.substring(0, this.textarea.selectionEnd).split('\n').length - 1;
    // get the line and the position in that line where the cursor is
    // pop() = take out the last line (which is the cursor selection start located)
    let cursorLine = this.textarea.value.substring(0, this.textarea.selectionStart).split('\n').pop();
    // get the position of cursor within the last line
    let cursorPosInLine = cursorLine.length;
    // calculating total lines to be removed
    let totalLinesRemove = endPos - startPos + 1;
    // split the textarea content into lines
    let lines = this.textarea.value.split('\n');
    // calculate new cursor position
    let newStart = lines.slice(0, startPos).join('\n').length + (startPos > 0 ? 1 : 0);
    // add 1 if startPos > 0 to account for '\n' character

    // remove the selected lines
    lines.splice(startPos, totalLinesRemove);

    // get the new line where the cursor will be after deleting lines
    // if lines[startPos] is not existed, then the new line will be an empty string
    let newLine = lines[startPos] || '';

    // if the new line is shorter than the cursor position, put the cursor at the end of the line
    if (newLine.length < cursorPosInLine) {
        cursorPosInLine = newLine.length;
    }
    // adjuct the cursor's position in the line to the new cursor position
    newStart += cursorPosInLine;
    // put the modified lines back into the textarea
    this.textarea.value = lines.join('\n');
    // set the new cursor position
    // both cursor selection start and end will be at the same position
    this.textarea.selectionStart = this.textarea.selectionEnd = newStart;
    // copy the code from textarea to code block      
    this.updateCode();
  }

  moveCursorToLineStart(e) {
    // get the line and the position in that line where the cursor is
    // pop() = take out the last line (which is the cursor selection start located)
    let line = this.textarea.value.substring(0, this.textarea.selectionStart).split('\n').pop();
    // get the position of cursor within the last line
    let cursorPosInLine = line.length;
    // Find the start of the current line
    let lineStartPos = this.textarea.value.substring(0, this.textarea.selectionStart).lastIndexOf('\n') + 1;
    // Find the first non-whitespace character on the line
    let firstNonWhitespacePos = line.search(/\S/);

    // the cursor's position is already in front of first non-whitespace character,
    // or it's position is before first none-whitespace character,
    // move the cursor to the start of line
    if (firstNonWhitespacePos >= cursorPosInLine) {
        // do nothing, perform default behaviour, which is moving the cursor to beginning of the line
        return true;
    }
    // If there's no non-whitespace character, this is an empty or whitespace-only line
    else if (firstNonWhitespacePos === -1) {
        // do nothing, perform default behaviour, which is moving the cursor to beginning of the line
        return true;
    }
    // Move the cursor to the position of the first non-whitespace character
    this.textarea.selectionStart = this.textarea.selectionEnd = lineStartPos + firstNonWhitespacePos;
  }
}
