DEFAULT_PROFILES =
  [
    {
      "name": "Default",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "c:\\tmp",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    },
    {
      "name": "Edge Launcher 2",
      "exePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "appDir": "",
      "extraParams": "--no-first-run  --disable-features=msImplicitSignin,msSeamlessWebToBrowserSignIn"
    }
  ];

function getProfileParams(profile) {
  if (profile.appDir == "") {
    return profile.extraParams
  } else {
    return "--user-data-dir=" + profile.appDir + " " + profile.extraParams
  }
}