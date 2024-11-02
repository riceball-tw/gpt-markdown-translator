import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { translate } from './translator.js';
import config from './config.js';

const { sourceFolder, outputBasePath, debug, targetLanguages } = config;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function promptToContinue(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    rl.question(prompt + '([Y]es/[n]o/[e]xit) ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y' || answer === '') {
        resolve(true);
      } else if (answer.toLowerCase() === 'n') {
        resolve(false);
      } else {
        reject(new Error('Abort'));
      }
    });
  });
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getTargetPathForLanguage(targetDir, relativePath, langCode) {
  const fileName = path.basename(relativePath);
  const dirName = path.dirname(relativePath);
  return path.join(targetDir, langCode, dirName, fileName);
}

async function copyNonMarkdownFile(sourcePath, targetLanguages) {
  const relativePath = path.relative(sourceFolder, sourcePath);
  
  for (const lang of targetLanguages) {
    const targetPath = getTargetPathForLanguage(outputBasePath, relativePath, lang);
    const targetDir = path.dirname(targetPath);
    
    await fs.promises.mkdir(targetDir, { recursive: true });
    
    const exists = await checkFileExists(targetPath);
    if (!exists) {
      try {
        await fs.promises.copyFile(sourcePath, targetPath);
        console.log(`Copied ${relativePath} to ${lang} folder`);
      } catch (error) {
        console.error(`Failed to copy ${relativePath} to ${lang} folder:`, error);
      }
    } else {
      console.log(`File already exists in ${lang} folder: ${relativePath}`);
    }
  }
}

async function getAllMarkdownFiles(sourceDir, targetDir, targetLanguages) {
  const files = await fs.promises.readdir(sourceDir);
  let markdownFiles = [];

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const stats = await fs.promises.stat(sourcePath);

    if (stats.isDirectory()) {
      const subDirFiles = await getAllMarkdownFiles(sourcePath, targetDir, targetLanguages);
      markdownFiles = markdownFiles.concat(subDirFiles);
    } else if (stats.isFile()) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const relativePath = path.relative(sourceFolder, sourcePath);
        const targetPaths = targetLanguages.map((lang) => ({
          language: lang,
          targetPath: getTargetPathForLanguage(targetDir, relativePath, lang),
        }));

        const existingTranslations = await Promise.all(
          targetPaths.map(async ({ language, targetPath }) => {
            const exists = await checkFileExists(targetPath);
            return { language, targetPath, exists };
          }),
        );

        if (existingTranslations.some(({ exists }) => !exists)) {
          markdownFiles.push({
            fullPath: sourcePath,
            relativePath: relativePath,
            translations: existingTranslations,
          });
        } else {
          console.log('All translations exist for file:', relativePath);
        }
      } else {
        await copyNonMarkdownFile(sourcePath, targetLanguages);
      }
    }
  }
  return markdownFiles;
}

async function main() {
  const markdownFiles = await getAllMarkdownFiles(sourceFolder, outputBasePath, targetLanguages);

  console.log('Total markdown files to translate:', markdownFiles.length);
  let count = 0;

  for (const { fullPath, relativePath, translations } of markdownFiles) {
    console.log('Processing:', relativePath);

    if (debug && !(await promptToContinue('Do you want to translate this file?'))) {
      continue;
    }

    for (const { language, targetPath, exists } of translations) {
      if (exists) {
        console.log(`Translation to ${language} already exists, skipping...`);
        continue;
      }

      const targetDir = path.dirname(targetPath);
      await fs.promises.mkdir(targetDir, { recursive: true });

      console.log(`Translating to ${language}...`);
      const startTime = +new Date();

      await translate({
        filename: path.basename(relativePath),
        filePath: fullPath,
        outputPath: targetPath,
        targetLanguage: language,
      });

      const endTime = +new Date();
      console.log(`Time for ${language} translation: ${endTime - startTime}ms`);

      await sleep(5000);
    }

    console.log('Count:', ++count);
    await sleep(10000);
  }
}

main().catch((err) => {
  console.error('Fatal error', err);
  throw new Error(err);
});