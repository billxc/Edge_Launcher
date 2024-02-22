export const DEFAULT_PROFILES =
  [
    {
      "name": "Stable",
      "appDir": "",
      "selectedChannel": "stable",
      "extraParams": ""
    },
    {
      "name": "Beta",
      "appDir": "",
      "selectedChannel": "beta",
      "extraParams": ""
    },
    {
      "name": "Dev",
      "appDir": "",
      "selectedChannel": "dev",
      "extraParams": ""
    },
    {
      "name": "Canary",
      "appDir": "",
      "selectedChannel": "canary",
      "extraParams": ""
    },
    {
      "name": "Customized",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "",
      "disabledFeatures": "msImplicitSignin,msSeamlessWebToBrowserSignIn",
      "selectedChannel": "customized",
      "extraParams": "--no-first-run"
    }
  ];


export function getProfileParams(profile) {
  let params = profile.extraParams;
  console.log('profile', profile)
  if (!!profile.appDir) {
    console.log('profile.appDir', profile.appDir)
    // TODO replace user data dir if it is already present in extraParams
    params += ` --user-data-dir=${profile.appDir}`;
  }
  if (!!profile.disabledFeatures) {
    params += ` --disabled-features=${profile.disabledFeatures}`;
  }
  if (!!profile.enabledFeatures) {
    params += ` --enabled-features=${profile.enabledFeatures}`;
  }
  return params;
}

export function getExePath(profile) {
  let exePath = '';
  switch (profile.selectedChannel){
    case 'stable':
      return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    case 'beta':
      return 'C:\\Program Files (x86)\\Microsoft\\Edge Beta\\Application\\msedge.exe';
    case 'dev':
      return 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe';
    case 'canary':
      return'~\\AppData\\Local\\Microsoft\\Edge SxS\\Application\\msedge.exe';
    case 'customized':
      return profile.exePath;
    default:
      return undefined;
  }
}