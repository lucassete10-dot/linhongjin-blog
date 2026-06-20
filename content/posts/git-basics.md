---
title: "Git 入门：最常用的 10 个命令"
date: 2026-06-20
draft: false
tags: ["Git", "编程", "工具"]
categories: ["编程笔记"]
description: "记录我学习 Git 时整理的最常用命令，附带实际使用场景。"
showToc: true
---

## 为什么要学 Git

Git 是程序员必备技能，它让你可以追踪代码历史、多人协作、安全地实验新功能。

## 最常用的命令

### 初始化与克隆

```bash
git init          # 初始化仓库
git clone <url>   # 克隆远程仓库
```

### 查看状态

```bash
git status        # 查看当前状态
git log --oneline # 查看提交历史（简洁版）
```

### 提交流程

```bash
git add .         # 暂存所有改动
git commit -m "说明这次改了什么"  # 提交
git push          # 推送到远程
```

### 分支操作

```bash
git branch dev         # 创建分支
git checkout dev       # 切换分支
git merge dev          # 合并分支
```

## 小结

掌握这 10 个命令，日常开发已经够用了。后续会写更深入的 Git 操作。
