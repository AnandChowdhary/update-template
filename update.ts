import { execSync } from "child_process";
import { join } from "path";
import fg from "fast-glob";
import { readJson, copyFile, remove, ensureFile, writeJson } from "fs-extra";

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
    localPackageJson.dependencies = templatePackageJson.dependencies;
    await writeJson(join(".", "package.json"), localPackageJson);

    const templatePackageLockJson = await readJson(
      join(".", tempDir, "package-lock.json")
    );
    const localPackageLockJson = await readJson(join(".", "package-lock.json"));
    localPackageLockJson.dependencies = templatePackageLockJson.dependencies;
    await writeJson(join(".", "package-lock.json"), localPackageLockJson);
  }
  if (config.npmScripts) {
    const templatePackageJson = await readJson(
      join(".", tempDir, "package.json")
    );
    const localPackageJson = await readJson(join(".", "package.json"));
    localPackageJson.scripts = templatePackageJson.scripts;
    await writeJson(join(".", "package.json"), localPackageJson);
  }
  await remove(join(".", tempDir));
};

update();
