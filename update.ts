import { execSync } from "child_process";
import recursiveReaddir from "recursive-readdir";
import { join } from "path";
import fg from "fast-glob";

export const update = async () => {
  console.log("Updating...");
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Provide a repository URL");
  const tempDir = `tempDir_${Math.random().toString(32)}`;
  execSync(`git clone ${repoUrl} ${tempDir}`);
  const files = await recursiveReaddir(join(".", tempDir));
  for await (const file of files) {
    //
  }
};

update();
