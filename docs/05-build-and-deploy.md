# 5. 构建与部署

本章将指导您如何为不同平台构建和部署您的游戏。

## 构建命令概览

所有构建相关的命令都定义在 `package.json` 的 `scripts` 部分。

-   **`yarn dev`**: 启动开发服务器，用于日常开发。
-   **`yarn build`**: 创建一个标准的生产版本，输出到 `dist/` 目录。
-   **`yarn build:itch`**: 为 **itch.io** 平台构建、打包，并自动管理版本号。
-   **`yarn build:pages`**: 为 **GitHub Pages** 构建一个生产版本。
-   **`yarn deploy`**: 构建并部署到 **GitHub Pages**。

---

## 为 itch.io 构建

我们提供了一个功能强大的脚本来简化为 itch.io 的发布流程。

执行以下命令：

```bash
yarn build:itch
```

该命令会自动执行以下操作：

1.  **自动更新版本号**：读取 `public/version.json`，将版本号递增，然后写回文件。
2.  **清理旧文件**：删除上一次的 `dist/` 构建目录。
3.  **执行 Vite 构建**：以适配 itch.io 的相对路径模式 (`--base=./`) 进行构建。
4.  **创建 ZIP 包**：将 `dist/` 目录中的所有内容打包成一个 `.zip` 文件，文件名将包含项目名和版本号（例如 `my-game-v1.0.1.zip`）。

构建完成后，您只需将生成的 `.zip` 文件上传到 itch.io 即可。

---

## 为 GitHub Pages 部署

### 重要：配置仓库名称

在部署到 GitHub Pages 之前，您必须确保 `package.json` 中的 `name` 字段与您的 GitHub 仓库名称完全一致。

`vite.config.ts` 会使用这个字段来配置正确的资源基础路径（例如 `/your-repo-name/`）。如果此名称不匹配，部署后的游戏将无法正确加载资源。

```json
// package.json
{
  "name": "your-repo-name",
  "private": true,
  // ...
}
```

### 部署步骤

配置好 `name` 字段后，只需运行：

```bash
yarn deploy
```

该命令会：
1.  使用 `build:pages` 脚本构建项目。
2.  使用 `gh-pages` 工具将 `dist` 目录的内容推送到您仓库的 `gh-pages` 分支。

---

## 本地测试生产版本

如果您想在本地测试生产构建的效果，可以运行：

```bash
yarn preview
```

此命令会在本地启动一个静态文件服务器，预览 `dist` 目录的内容。

### 本地测试生产构建

当您直接在浏览器中通过 `file://` 协议打开构建后的 `index.html` 文件时，会遇到浏览器的同源策略（CORS）限制，导致无法加载 JSON 等外部资源。

为了在上传前模拟真实的服务器环境，您可以使用 `start_game.ps1` 脚本。

```powershell
.\start_game.ps1
```

此脚本会：
1.  在项目根目录的 `8000` 端口启动一个轻量级的 HTTP 服务器。
2.  自动在您的默认浏览器中打开 `http://localhost:8000`。
3.  通过 `http://` 协议访问，可以避免跨域问题，让您能够完整地测试生产构建包的功能。

脚本还提供了简单的交互功能：
*   在控制台输入 `q` 并回车，可以停止服务器。
*   输入 `r` 并回车，可以重启服务器（在重启前会尝试运行 `dev-tool/encrypt_files.ps1` 脚本）。

### 自动化部署 (CI/CD)

本项目包含一个预置的 GitHub Actions 工作流 (`.github/workflows/deploy-pages.yml`)，用于自动将您的游戏部署到 GitHub Pages。

**工作原理:**
*   当您向 `main` 或 `master` 分支推送代码时，此工作流会自动触发。
*   它会执行 `build:pages` 脚本来构建项目。
*   构建成功后，它会将 `dist` 目录下的内容自动部署到您的 GitHub Pages。

**配置 GitHub Secrets:**

在部署之前，您需要在 GitHub 仓库中配置以下 Secrets：

1.  **进入仓库设置**: 在您的 GitHub 仓库页面，点击 `Settings` 标签。
2.  **找到 Secrets**: 在左侧菜单中，点击 `Secrets and variables` -> `Actions`。
3.  **添加 Secrets**: 点击 `New repository secret` 按钮，添加以下两个 Secrets：

    **`VITE_BACKEND_URL`**
    - **值**: 您的后端 API 生产环境地址
    - **示例**: `https://api.your-domain.com`
    - **说明**: 前端应用将使用此地址连接后端服务

    **`VITE_PUBLIC_URL`**
    - **值**: 您的 GitHub Pages 应用完整 URL
    - **示例**: `https://your-username.github.io/your-repo-name`
    - **说明**: 用于生成应用内的绝对路径链接

**如何使用:**
1.  确保您的仓库已经开启了 GitHub Pages 功能（在 `Settings` -> `Pages` 中，将 `Source` 设置为 `GitHub Actions`）。
2.  配置上述 GitHub Secrets。
3.  将您的代码推送到 `main` 分支。
4.  稍等片刻，GitHub Actions 完成后，您的游戏就会在 GitHub Pages 网址上生效。

这个自动化流程取代了原有的 `yarn deploy` 手动部署方式，让部署过程更可靠、更高效。

**环境变量说明:**

- **开发环境**: 前端默认连接到 `http://localhost:3000`
- **生产环境**: 前端连接到您在 `VITE_BACKEND_URL` Secret 中配置的地址
- **本地开发**: 如需自定义后端地址，可在项目根目录创建 `.env` 文件并设置 `VITE_BACKEND_URL`

**失败回退机制:**

如果环境变量未配置或配置错误，系统会按以下优先级回退：

1. **`VITE_BACKEND_URL` 未设置时**:
   - 开发环境: 回退到 `http://localhost:3000`
   - 生产环境: 回退到当前页面域名 (`window.location.origin`)

2. **`VITE_PUBLIC_URL` 未设置时**:
   - 回退到当前页面域名 (`window.location.origin`)

3. **GitHub Secrets 未配置时**:
   - 构建会失败，需要正确配置 Secrets 才能部署
