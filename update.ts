import { execSync } from "child_process";

export const update = async () => {
  console.log("Updating...");
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Provide a repository URL");
  const tempDir = "tempDir";
  execSync(`git clone ${repoUrl} ${tempDir}`);
};

update();
