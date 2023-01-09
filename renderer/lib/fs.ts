import fs from "fs-extra";

export const readFile = (path: string): string => {
  return fs.readFileSync(path, "utf8");
};

export const writeFile = (path: string, data: string): void => {
  fs.writeFileSync(path, data);
};

export const fileExists = (path: string): boolean => {
    return fs.existsSync(path);
}



