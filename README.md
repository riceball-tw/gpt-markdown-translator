# GPT Markdown Translator

This tool translates a Markdown file into another (natural) language by using OpenAI's ChatGPT API. Its main purpose is to help people translate docs sites for open-source libraries.

> [!NOTE]  
> - Original code from:  [markdownchatgpt-md-translator](https://github.com/smikitky/markdown-gpt-translator)
> - Modified from: [huli-blog translator](https://github.com/aszx87410/huli-blog/tree/master/apps/translator)

Things that have been changed for my needs include:

- ⚠️ My own config and prompt
- ⚠️ Change TypeScript to JavaScript (For less dependencies)
- ⚠️ Rewrite to native fetch API from node-fetch package (For less dependencies)
- ✅ Added multiple language output support
- ✅ Added MDX support
- ✅ Added dotenv support (To store secret in .env file)
- ✅ Added automatic file copy (Copy every file to translate output folders, like images, videos...)
- ✅ Added Check to avoid translating already translated files

## Known issues

1. If the target text contains multiple languages, it might not be translated correctly.
2. Bad at handling culture-specific / domain-specific text.
3. Will automaticly copy all file to translate output folders at start, even if they are not translate yet.

You might need to check the result manually.

## How-to

1. Edit `config.js` and `prompt.md`
2. Setup `process.env.OPENAI_API_KEY` environment variable
3. `node index.js` (At least Node.js 18 is required)

