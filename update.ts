import { execSync } from "child_process";
import { join } from "path";
import fg from "fast-glob";
import { readJson, copyFile, remove, ensureFile, writeFile } from "fs-extra";

export const update = async () => {
  console.log("Updating...");
  let repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Provide a repository URL");
  if (!repoUrl.includes("@") && !repoUrl.includes("//"))
    repoUrl = `https://github.com/${repoUrl}`;

  // If this is running in a Github Actions workflow, we know the repo name
  let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  if (owner && repo)
    if (repoUrl === `https://github.com/${owner}/${repo}`)
      return console.log("Skipping updating same repo");

  const tempDir = `tempDir_${Math.random().toString(32).split(".")[1]}`;
  execSync(`git clone ${repoUrl} ${tempDir}`);
  let config: {
    files?: string[];
    removeFiles?: string[];
    npmDependencies?: boolean;
    npmScripts?: boolean;
  } = {};
  try {
    config = await readJson(join(".", tempDir, ".templaterc.json"));
  } catch (error) {
    console.log(".templaterc.json config file not found");
  }

  const files = (
    await fg((config.files || []).map((glob) => `${tempDir}/${glob}`))
  ).map((file) => file.substring(tempDir.length));
  for await (const file of files) {
    await ensureFile(join(".", file));
    await copyFile(join(".", tempDir, file), join(".", file));
  }

  if (config.npmDependencies) {
    const templatePackageJson = await readJson(
      join(".", tempDir, "package.json")
    );
    const localPackageJson = await readJson(join(".", "package.json"));
    const dependencies = {
      ...localPackageJson.dependencies,
      ...templatePackageJson.dependencies,
    };
    const ordered: { [index: string]: string } = {};
    Object.keys(dependencies)
      .sort()
      .forEach((key) => (ordered[key] = dependencies[key]));
    localPackageJson.dependencies = ordered;
    await writeFile(
      join(".", "package.json"),
      JSON.stringify(localPackageJson, null, 2) + "\n"
    );
  }

  if (config.npmScripts) {
    const templatePackageJson = await readJson(
      join(".", tempDir, "package.json")
    );
    const localPackageJson = await readJson(join(".", "package.json"));
    const scripts = {
      ...localPackageJson.scripts,
      ...templatePackageJson.scripts,
    };
    const ordered: { [index: string]: string } = {};
    Object.keys(scripts)
      .sort()
      .forEach((key) => (ordered[key] = scripts[key]));
    localPackageJson.scripts = ordered;
    await writeFile(
      join(".", "package.json"),
      JSON.stringify(localPackageJson, null, 2) + "\n"
    );
  }

  config.removeFiles = config.removeFiles || [];
  config.removeFiles = [...config.removeFiles, ".templaterc.json"];
  console.log(config.removeFiles);
  const filesToDelete = await fg(config.removeFiles);
  for await (const file of filesToDelete) {
    await remove(join(".", file));
  }
  await remove(join(".", tempDir));
};
