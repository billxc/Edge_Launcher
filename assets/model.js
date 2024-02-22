export const DEFAULT_PROFILES =
  [
    {
      "name": "Default",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "c:\\tmp",
      "selectedChannel": "stable",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    },
    {
      "name": "Edge Launcher 2",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "",
      "selectedChannel": "stable",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    },
    {
      "name": "Edge Launcher 3",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "",
      "selectedChannel": "stable",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    },
    {
      "name": "Edge Launcher 4",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "",
      "selectedChannel": "stable",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    },
    {
      "name": "Edge Launcher 5",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "",
      "selectedChannel": "stable",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    }
  ];



export function getProfileParams(profile) {
  if (profile.appDir == "") {
    return profile.extraParams
  } else {
    return "--user-data-dir=" + profile.appDir + " " + profile.extraParams
  }
}