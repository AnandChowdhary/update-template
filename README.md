# 📠 Update Template

If you've created a repository using a template (see [Creating a repository from a template](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template) on GitHub), it can be hard to "update" the template when new features are added, since it's not a fork. This package fixes that.

[![Node CI](https://github.com/koj-co/update-template/workflows/Node%20CI/badge.svg)](https://github.com/koj-co/update-template/actions?query=workflow%3A%22Node+CI%22)

## ⭐ Get started

### For repositories

If your repo is based on a template, you can update it using the URL of the original template repo:

```bash
npx update-template https://github.com/user/repo
```

### For templates

If you're building a template repository, add `update-template` as a dependency:

```bash
npm install update-template
```

Then, create a `.templaterc.json` file with a list of files you'd like to overwrite:

```json
{
  "files": ["src/**/*.js"]
}
```

Lastly, add an update script to your `package.json` with the URL of your repository:

```json
{
  "scripts": {
    "update-template": "update-template https://github.com/user/repo"
  }
}
```

When users want to update your template, they can run `npm run update-template`

If you want to sync your `package.json` and `package-lock.json` dependencies (without changing keys like the package name), you can add:

```json
{
  "npmDependencies": true
}
```

Similarly, npm scripts can be added:

```json
{
  "npmScripts": true
}
```

## 👩‍💻 Development

Build TypeScript:

```bash
npm run build
```

## 📄 License

[MIT](./LICENSE) © [Koj](https://koj.co)

<p align="center">
  <a href="https://koj.co">
    <img width="44" alt="Koj" src="https://kojcdn.com/v1598284251/website-v2/koj-github-footer_m089ze.svg">
  </a>
</p>
<p align="center">
  <sub>An open source project by <a href="https://koj.co">Koj</a>. <br> <a href="https://koj.co">Furnish your home in style, for as low as CHF175/month →</a></sub>
</p>
