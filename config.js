import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  basePath: __dirname,
  targetLanguages: ['en', 'zh-cn'],
  // Folder that contains the source Markdown files (markdown files inside folder is ok!)
  sourceFolder: path.resolve(__dirname, '../src/content/shortpost/zh-tw'),
  // Folder that is the base contains the translated Markdown files
  outputBasePath: path.resolve(__dirname, '../src/content/shortpost'),
  debug: false,
  apiKey: process.env.OPENAI_API_KEY,
  promptFile: path.resolve(__dirname, 'prompt.md'),
  model: 'gpt-4o-mini',
  temperature: 0.1,
  fragmentSize: 2048,
  apiCallInterval: 5,
};

export default config;
