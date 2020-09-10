import { execSync } from "child_process";
import { join } from "path";
import fg from "fast-glob";
import { readJson, copyFile, remove, ensureFile, writeFile } from "fs-extra";

export const update = async () => {
  console.log("Updating...");
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Provide a repository URL");
  const tempDir = `tempDir_${Math.random().toString(32).split(".")[1]}`;
  execSync(`git clone ${repoUrl} ${tempDir}`);
  const config: {
    files?: string[];
    npmDependencies?: boolean;
    npmScripts?: boolean;
  } = await readJson(join(".", tempDir, ".templaterc.json"));
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
  await remove(join(".", tempDir));
};
