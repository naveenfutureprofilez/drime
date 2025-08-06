export function insertLinkIntoTextEditor(editor, {
  text,
  target,
  href
}) {
  // no selection, insert new link with specified text
  if (editor.state.selection.empty && text) {
    editor.commands.insertContent(`<a href="${href}" target="${target}">${text}</a>`);
  } else if (!editor.state.selection.empty) {
    // no href provided, remove link from selection
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // add link to selection
      editor.chain().focus().extendMarkRange('link').setLink({
        href: href,
        target
      }).run();
    }
  }
}