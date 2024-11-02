import crypto from 'crypto';

/**
 * Replace code blocks with placeholders.
 * @param mdContent - Markdown content.
 * @returns Markdown content with code blocks replaced with placeholders.
 */
export const replaceCodeBlocks = (mdContent) => {
  const codeBlockRegex = /(```.*\n[\s\S]*?\n```)/g;
  const codeBlocks = {};
  const output = mdContent.replace(codeBlockRegex, (match) => {
    const lines = match.split('\n');
    if (lines.length >= 5) {
      const id = crypto.randomBytes(3).toString('hex');
      codeBlocks[id] = match;
      return `${lines[0]}\n(omittedCodeBlock-${id})\n\`\`\``;
    } else return match;
  });
  return { output, codeBlocks };
};

/**
 * Restore code blocks from placeholders.
 * @param mdContent - Markdown content with code blocks replaced.
 * @param codeBlocks - Code blocks to restore.
 * @returns - Markdown content with code blocks restored.
 */
export const restoreCodeBlocks = (mdContent, codeBlocks) => {
  const placeholderRegex = /```(.*?)\n\(omittedCodeBlock-([a-z0-9]+)\)\n```/g;
  return mdContent.replace(placeholderRegex, (_, lang, id) => codeBlocks[id] ?? '(code block not found)');
};

/**
 * Split a string into multiple strings at blank lines.
 * @param input The string to split.
 * @param fragmentLength The soft maximum length of each fragment.
 * If the string is longer than this, it will be split at the nearest blank line.
 * If this is 0, the input will be split in half.
 */
export const splitStringAtBlankLines = (input, fragmentLength = 2048) => {
  const lines = input.split('\n');
  let inCodeBlock = false;
  let currentFragment = [];
  let fragments = [];
  let nearstToHalfDiff = Infinity;
  let nearstToHalfIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) inCodeBlock = !inCodeBlock;

    if (!inCodeBlock && lines[i].trim() === '') {
      const currentLength = currentFragment.join('\n').length;

      if (fragmentLength > 0) {
        if (currentLength + lines[i].length > fragmentLength) {
          fragments.push(currentFragment.join('\n'));
          currentFragment = [];
        }
      } else {
        const halfLength = Math.floor(lines.length / 2);
        if (Math.abs(halfLength - i) < nearstToHalfDiff) {
          nearstToHalfDiff = Math.abs(halfLength - i);
          nearstToHalfIndex = i;
        }
      }
    }
    currentFragment.push(lines[i]);
  }

  if (fragmentLength === 0) {
    if (nearstToHalfIndex === -1) return null; // no split point found
    fragments.push(lines.slice(0, nearstToHalfIndex).join('\n'));
    fragments.push(lines.slice(nearstToHalfIndex).join('\n'));
    return fragments;
  } else {
    fragments.push(currentFragment.join('\n'));
    return fragments;
  }
};
