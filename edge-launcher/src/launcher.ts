
export enum Channel {
  STABLE = "stable",
  BETA = "beta",
  DEV = "dev",
  CANARY = "canary",
  INTERNAL = "internal",
  CUSTOMIZED = "customized"
}

export const EXE_PATHS = [
  "C:\\Edge\\src\\out\\debug_x64\\msedge.exe",
  "C:\\Edge\\src\\out\\release_x64\\msedge.exe",
]

export class Profile {
  name!: string;
  appDir!: string;
  exePath: string | undefined;
  selectedChannel!: Channel;
  extraParams!: string;
  disabledFeatures!: string;
  enabledFeatures!: string;
  labelText!: string;
  id: string = Math.random().toString(36).substring(7);
}

export const DEFAULT_PROFILES : Profile[] =
  [
    {
      name: "Stable",
      appDir: "",
      exePath: "",
      selectedChannel: Channel.STABLE,
      extraParams: "",
      disabledFeatures: "",
      enabledFeatures: "",
      labelText: "",
      id: Math.random().toString(36).substring(7)
    },
    {
      name: "Beta",
      appDir: "",
      exePath: "",
      selectedChannel: Channel.BETA,
      extraParams: "",
      disabledFeatures: "",
      enabledFeatures: "",
      labelText: "",
      id: Math.random().toString(36).substring(7)
    },
    {
      name: "Dev",
      appDir: "",
      exePath: "",
      selectedChannel: Channel.DEV,
      extraParams: "",
      disabledFeatures: "",
      enabledFeatures: "",
      labelText: "",
      id: Math.random().toString(36).substring(7)
    },
    {
      name: "Canary",
      appDir: "",
      exePath: "",
      selectedChannel: Channel.CANARY,
      extraParams: "",
      disabledFeatures: "",
      enabledFeatures: "",
      labelText: "",
      id: Math.random().toString(36).substring(7)
    },
    {
      name: "Customized",
      appDir: "",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      selectedChannel: Channel.CUSTOMIZED,
      extraParams: "--no-first-run",
      disabledFeatures: "msImp",
      enabledFeatures: "msEdgePhoto",
      labelText: "",
      id: Math.random().toString(36).substring(7)
    }
  ];


export function getProfileParams(profile: Profile) {
  let params = profile.extraParams;
  // remove all \n from the string
  params = params.replace(/\n/g, ' ');
  // remove all \r from the string
  params = params.replace(/\r/g, ' ');
  if (profile.appDir) {
    // TODO replace user data dir if it is already present in extraParams
    params += ` --user-data-dir='${profile.appDir}'`;
  }
  if (profile.disabledFeatures) {
    // TODO add disabled features if it is already present in extraParams
    params += ` --disable-features=${profile.disabledFeatures}`;
  }
  if (profile.enabledFeatures) {
    // TODO add enabled features if it is already present in extraParams
    params += ` --enable-features=${profile.enabledFeatures}`;
  }
  return params;
}

export function getExePath(profile: Profile) {
  switch (profile.selectedChannel) {
    case Channel.STABLE:
      return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    case Channel.BETA:
      return 'C:\\Program Files (x86)\\Microsoft\\Edge Beta\\Application\\msedge.exe';
    case Channel.DEV:
      return 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe';
    case Channel.CANARY:
      return '~\\AppData\\Local\\Microsoft\\Edge SxS\\Application\\msedge.exe';
    case Channel.INTERNAL:
      return '~\\AppData\\Local\\Microsoft\\Edge Internal\\Application\\msedge.exe';
    case Channel.CUSTOMIZED:
      return profile.exePath;
    default:
      return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

export function launchProfile(profile: Profile){
  const cmd = `pwsh -Command "& '${getExePath(profile)}' ${getProfileParams(profile)}"`
  console.log(cmd);
  if(chrome.webview){
    chrome.webview.postMessage("cmd:" + cmd);
  }
}

export function getIcon(channel: Channel) {
  switch (channel) {
    case Channel.STABLE:
      return "/edge.ico";
    case Channel.BETA:
      return "/edge_beta.ico";
    case Channel.DEV:
      return "/edge_dev.ico";
    case Channel.CANARY:
      return "/edge_canary.ico";
    case Channel.INTERNAL:
      return "/edge.ico";
    case Channel.CUSTOMIZED:
      return "/edge.ico";
  }
}