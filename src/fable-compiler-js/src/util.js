import * as fs from "fs";
import * as Path from "path";

export function getVersion() {
  return require("../package.json").version;
}

export function getFableLibDir() {
  return Path.join(Path.dirname(require.resolve("fable-standalone")), "fable-library");
}

export function getDirFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).map((subdir) => {
    const res = Path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getDirFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
}

export function ensureDirExists(dir, cont) {
  if (fs.existsSync(dir)) {
    if (typeof cont === "function") { cont(); }
  } else {
    ensureDirExists(Path.dirname(dir), () => {
      if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
      if (typeof cont === "function") { cont(); }
    });
  }
}

export function serializeToJson(data) {
  return JSON.stringify(data, (key, value) => {
    if (value === Infinity) {
      return "Infinity";
    } else if (value === -Infinity) {
      return "-Infinity";
    } else if (value !== value) {
      return "NaN";
    }
    return value;
  });
}

export function copyFolder(from, dest) {
  if (!fs.existsSync(dest)) {
    ensureDirExists(dest);
  }
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(Path.join(from, element)).isDirectory()) {
      copyFolder(Path.join(from, element), Path.join(dest, element));
    } else {
      fs.copyFileSync(Path.join(from, element), Path.join(dest, element));
    }
  });
}

export function runCmdAndExitIfFails(cmd) {
  var child_process = require("child_process");
  console.log(">", cmd);
  try {
    child_process.execSync(cmd, {
      stdio: "inherit"
    });
  } catch (error) {
    process.exit(-1);
  }
}