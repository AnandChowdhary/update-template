import { execSync } from "child_process";
import { join } from "path";
import fg from "fast-glob";
import { readJson, copyFile, remove, ensureFile } from "fs-extra";

export const update = async () => {
  console.log("Updating...");
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Provide a repository URL");
  const tempDir = `tempDir_${Math.random().toString(32).split(".")[1]}`;
  execSync(`git clone ${repoUrl} ${tempDir}`);
  const config: { files?: string[] } = await readJson(
    join(".", tempDir, ".templaterc.json")
  );
  const files = (
    await fg((config.files || []).map((glob) => `${tempDir}/${glob}`))
  ).map((file) => file.substring(tempDir.length));
  for await (const file of files) {
    await ensureFile(join(".", file));
    await copyFile(join(".", tempDir, file), join(".", file));
  }
  await remove(join(".", tempDir));
};

update();
