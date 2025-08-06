import { mergeAttributes, Node } from '@tiptap/react';
export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      allowfullscreen: {
        default: null
      },
      allow: {
        default: 'autoplay; fullscreen; picture-in-picture'
      },
      src: {
        default: null
      }
    };
  },
  parseHTML() {
    return [{
      tag: 'iframe'
    }];
  },
  renderHTML({
    HTMLAttributes
  }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  addCommands() {
    return {
      setEmbed: options => ({
        commands
      }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        });
      }
    };
  }
});