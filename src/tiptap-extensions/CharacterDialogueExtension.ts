import { Mark, mergeAttributes } from '@tiptap/core';

export interface CharacterDialogueOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    characterDialogue: {
      setCharacterDialogue: (characterId: string) => ReturnType;
      toggleCharacterDialogue: (characterId: string) => ReturnType;
      unsetCharacterDialogue: () => ReturnType;
    };
  }
}

export const CharacterDialogue = Mark.create<CharacterDialogueOptions>({
  name: 'characterDialogue',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      characterId: {
        default: null,
        parseHTML: element => element.getAttribute('data-character-id'),
        renderHTML: attributes => {
          if (!attributes.characterId) {
            return {};
          }
          return {
            'data-character-id': attributes.characterId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-character-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCharacterDialogue:
        (characterId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { characterId });
        },
      toggleCharacterDialogue:
        (characterId: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { characterId });
        },
      unsetCharacterDialogue:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});