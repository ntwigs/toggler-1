import * as path from "path";
import * as fs from "fs";
import { homedir } from "os";
import { promisify } from "util";

const settingsPath = path.resolve(homedir(), ".toggl_settings");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const getTokenFromProcess = () => {
  return { token: process.env.TOGGL_TOKEN || "" };
};

const getTokenFromFile = async () => {
  const buffer = await readFile(settingsPath);
  const settings = buffer.toString();
  return JSON.parse(settings) as Settings;
};

interface Settings {
  token: string;
  projectId?: string;
}

export const getSettings = async (): Promise<Settings> => {
  try {
    const hasTokenEnv = process.env.TOGGL_TOKEN;
    return hasTokenEnv ? getTokenFromProcess() : getTokenFromFile();
  } catch (e) {
    return { token: "" };
  }
};

export const setSettings = async (
  newSettings: Partial<Settings>
): Promise<Settings> => {
  try {
    const settings = await getSettings();
    const settingsToWrite = {
      ...settings,
      ...newSettings,
    };
    await writeFile(settingsPath, JSON.stringify(settingsToWrite));
    return settingsToWrite;
  } catch (e) {
    return { token: "" };
  }
};
