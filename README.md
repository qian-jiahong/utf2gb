# utf2gb

批量将 UTF-8 编码文件转换为 GB2312 / GB18030，保留目录结构的 CLI 工具（node.js）

## 📦 安装

前提：安装 node.js

  本地源码安装：

  把代码下到本地，并在代码目录下执行：
  ```
  npm install
  npm install -g .
  ```

---

使用 npm 全局安装：

```bash
npm install -g utf2gb
```


## 🚀 使用方式

utf2gb <输入目录> [输出目录] [扩展名列表] [目标编码]

示例：

utf2gb ./src .txt,.md gb18030 ./dist

说明：

    <输入目录>：待转换的 UTF-8 文件目录

    [输出目录]：转换后文件的输出目录（保持原目录结构）

    [扩展名列表]：可选，多个扩展名用逗号分隔，默认全部文件

    [目标编码]：可选，支持 gb2312（默认）或 gb18030

## 🧠 注意事项

    如果文件不是 UTF-8 编码，将会被自动跳过

    输出目录不能是输入目录或其子目录

    会保留原始目录结构，将文件写入到新的路径下

## 🔧 命令行帮助

utf2gb --help

## 📄 License

MIT

  Created by @qianjiahong (https://github.com/qian-jiahong/utf2gb)