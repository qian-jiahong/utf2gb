#!/usr/bin/env node

// utf2gb - 将 UTF-8 文件批量转换为 gb2312, gb18030

import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import chardet from 'chardet';
import chalk from 'chalk';

const validEncodings = ['gb2312', 'gb18030'];
const defaultEncoding = 'gb2312';
const defaultOutputDir = 'utf2gb-output';

const args = process.argv.slice(2);
const [pInputDir, pOutputDir, pExtStr, pEncoding] = args;
console.log(chalk.gray(`参数：
    输入目录：${pInputDir}
    输出目录：${pOutputDir}
    匹配扩展名：${pExtStr}
    转换编码：${pEncoding}
  `));

const inputDir = pInputDir
const extStr = pExtStr ? pExtStr.split(',').map(e => e.trim()).filter(e => e) : [];
let targetEncoding = pEncoding
const outputDir = path.join(pOutputDir || ".", defaultOutputDir)

function convertFilesInDir(dir) {
    const files = fs.readdirSync(dir);
    let printDired = false;

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            convertFilesInDir(fullPath);
            continue;
        }

        if (!printDired) {
            console.log(`\n目录: ${dir}`);
            printDired = true;
        }

        if (extStr.length > 0 && !extStr.some(ext => file.endsWith(ext))) continue;

        const buffer = fs.readFileSync(fullPath);
        const encoding = chardet.detect(buffer);

        if (encoding && encoding.toLowerCase().includes('utf-8')) {
            const utf8Str = buffer.toString('utf8');
            const encodedBuffer = iconv.encode(utf8Str, targetEncoding);

            const relativePath = path.relative(inputDir, fullPath);
            const outputFile = path.join(outputDir, relativePath);

            // 创建子目录（如果不存在）
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            fs.writeFileSync(outputFile, encodedBuffer);

            console.log(chalk.green(`✔ 转换成功: ${file} → ${outputFile}`));
        } else {
            console.log(chalk.gray(`✘ 跳过: ${file} (编码: ${encoding || '未知'})`));
        }
    }
}


function showHelp() {
    console.log(chalk.bold("\nutf2gb - 将 UTF-8 文件批量转换为 " + validEncodings + "\n"));
    console.log(chalk.cyan('用法:'));
    console.log('  utf2gb <输入目录> [输出目录] [扩展名列表] [目标编码]\n');

    console.log(chalk.cyan('参数说明:'));
    console.log(`  ${chalk.yellow('输入目录')}       要处理的文件夹，必须指定`);
    console.log(`  ${chalk.yellow('输出目录')}       转换后输出的目录，默认为 ${defaultOutputDir}`);
    console.log(`  ${chalk.yellow('扩展名列表')}     逗号分隔的扩展名（如 .txt,.md），为空（""）表示全部处理`);
    console.log(`  ${chalk.yellow('目标编码')}       ${defaultEncoding}（默认）或 gb18030`);

    console.log(chalk.cyan('示例:'));
    console.log(`  utf2gb .\\docs   ${chalk.gray('← 转换后输出到 .\\' + defaultOutputDir + ', 处理所有扩展名文件, 转换为 ' + defaultEncoding + ' 编码')}`);
    console.log(`  utf2gb .\\docs .\\out_docs   ${chalk.gray('← 转换后输出到 .\\out_docs\\' + defaultOutputDir)}\n`);
    console.log(`  utf2gb .\\docs D:\\ .txt ${defaultEncoding}   ${chalk.gray('← 转换后输出到 D:\\' + defaultOutputDir)}`);
    console.log(`  utf2gb . ..\\out .md,.txt ${defaultEncoding}   ${chalk.gray('← 转换后输出到 ..\\out\\' + defaultOutputDir + ', 处理 .md,.txt 文件, 转换为 ' + defaultEncoding + ' 编码')}`);

    console.log(chalk.cyan('可选参数:'));
    console.log(`  ${chalk.yellow('--help, -h')}       显示帮助\n`);
};

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

if (!inputDir) {
    showHelp();
    process.exit(1);
}

if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    console.error('❌ 错误：输入目录不存在或不是目录:', inputDir);
    process.exit(1);
}

const inputDirAbs = path.resolve(inputDir);
const outputDirAbs = path.resolve(outputDir);

// 检查输出目录不能是输入目录本身或其子目录
if (
    outputDirAbs === inputDirAbs ||
    outputDirAbs.startsWith(inputDirAbs + path.sep)
) {
    console.error(`❌ 错误：输出目录不能是输入目录或其子目录！`);
    console.error(`输入目录:  ${inputDirAbs}`);
    console.error(`输出目录:  ${outputDirAbs}`);
    process.exit(1);
}

if (!targetEncoding || targetEncoding.trim() === "''") {
    targetEncoding = defaultEncoding;
    console.log(chalk.cyan('未指定编码格式，默认使用 ' + defaultEncoding + ' 编码'));
}

// 编码参数校验
if (!validEncodings.includes(targetEncoding.toLowerCase())) {
    console.error(`❌ 不支持的编码格式：${targetEncoding}`);
    process.exit(1);
}

convertFilesInDir(inputDir);
