ToolHub v57.10.1 hotfix

问题：v57.10-full.zip 的旧打包方式使用了 ./*，Windows / 7-Zip 都不会将 .github 这类隐藏目录包含进压缩包。因此 selfcheck 找不到 .github\workflows\sync-free-llm.yml 并中止。

使用方法：
1. 将本压缩包解压到 ToolHub-v57.10-full 根目录（不是 public 目录）。
2. 选择“全部替换/覆盖”。
3. 双击 toolhub.bat。

本包恢复：
- .github\workflows\sync-free-llm.yml
- .github\workflows\sync-skills.yml（此前同样会被遗漏；不恢复会导致 Skills 自动同步无法运行）
- build\selfcheck.mjs：缺文件时给出清晰 FAIL，不再抛未经处理的 ENOENT。

预期结果：Selfcheck 完整通过后才会进入第 6 步部署。
