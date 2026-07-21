# 拾心

「拾心」是一款本地优先的随手记应用，用来收好随时闪过的小想法。界面借鉴苹果备忘录的轻量记录体验，同时保留更柔和、走心的视觉气质。

## 已实现

- 想法列表、搜索、新建、编辑和删除
- 本机离线存储（`uni.setStorageSync`）
- GitHub 私有仓库双向同步
- 按 `updatedAt / deletedAt` 合并，避免旧数据复活
- Android / iOS 共用的 uni-app 项目结构
- 完整 Android 与 iOS 应用图标资源

## 用 HBuilderX 运行

1. 在 HBuilderX 中选择「文件 → 打开目录」，打开本项目。
2. 连接 Android 真机或启动模拟器。
3. 选择「运行 → 运行到手机或模拟器 → 运行到 Android App 基座」。
4. 正式打包时先在 `manifest.json` 可视化界面重新获取自己的 DCloud AppID，然后选择「发行 → 原生 App-云打包」。

浏览器调试可选择「运行 → 运行到浏览器」。根目录的 `index.html` 是 Vue 3 / uni-app H5 调试入口。

## GitHub 同步设置

建议新建一个私有仓库（创建时勾选 README，确保 `main` 分支已经存在），并创建 fine-grained personal access token：

- Repository access：只选择这个数据仓库
- Repository permissions → Contents：Read and write

在应用设置页填写 Owner、Repo、Branch、Path 和 Token。点击「立即同步」后，数据会保存到：

```text
<Path>/thoughts.json
```

Token 只存储在应用本机。卸载 App 或清除应用数据前，请先完成同步。

如果在中国大陆网络环境下访问 `api.github.com` 不稳定，应用仍会继续把内容保存在本机；网络恢复后再手动同步即可。

## 数据说明

本地数据键：

```text
shixin:notes:v1
shixin:github:v1
```

删除记录会暂时保留墓碑信息并参与同步，以确保其他设备不会把旧记录重新带回来。
