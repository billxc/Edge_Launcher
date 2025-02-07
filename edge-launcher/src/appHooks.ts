import { useState } from 'react'
import { Channel, DEFAULT_PROFILES, EXE_PATHS, Profile, getExePath, getProfileParams } from "./launcher";
import { DropResult, DragStart } from "react-beautiful-dnd";
import { autolog } from './autolog';

export interface UIEvent {
  target: {
    value: string | null;
    name: string;
  }
}

export function useProfiles() {
  const stored_profiles_str = localStorage.getItem('profiles');
  const init_profiles: Profile[] = stored_profiles_str ? JSON.parse(stored_profiles_str) : DEFAULT_PROFILES;
  init_profiles.forEach((profile) => {
    if (!profile.id) {
      profile.id = Math.random().toString(36).substring(7);
    }
  });
  autolog("init_profiles", init_profiles);

  const stored_selected_index_str = localStorage.getItem('selected_index');
  autolog("selected index: " + stored_selected_index_str);

  const init_selected_index = stored_selected_index_str && parseInt(stored_selected_index_str) >= 0 ? parseInt(stored_selected_index_str) : 0;
  const [profiles, setProfiles] = useState(init_profiles);
  const [selected_index, setSelectedIndex] = useState(init_selected_index);
  const [dragging_index, setDraggingIndex] = useState(-1);
  const [selected_profile, setSelectedProfile] = useState(profiles[selected_index]);

  function setProfilesWithStore(profiles: Profile[]) {
    setProfiles(profiles);
    localStorage.setItem('profiles', JSON.stringify(profiles));
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    localStorage.setItem('profiles_' + date, JSON.stringify(profiles));
  }

  function setSelectedIndexWithStore(index: number) {
    setSelectedIndex(index);
    setSelectedProfile({ ...profiles[index] });
    localStorage.setItem('selected_index', index.toString());
  }
  
  function setSelectedIndexOnlyWithStore(index: number) {
    setSelectedIndex(index);
    localStorage.setItem('selected_index', index.toString());
  }

  function createNewProfile() {
    const newProfile: Profile = {
      name: "New Profile",
      exePath: EXE_PATHS[0],
      selectedChannel: Channel.CUSTOMIZED,
      labelText: "REL",
      appDir: "",
      disabledFeatures: "",
      enabledFeatures: "",
      extraParams: "",
      id: Math.random().toString(36).substring(7)
    }
    const newProfiles = [...profiles, newProfile]
    setProfilesWithStore(newProfiles);
    setSelectedIndexOnlyWithStore(newProfiles.length - 1);
    setSelectedProfile(newProfile);
  }

  function exportAll() {
    const json_profile = JSON.stringify(profiles);
    const blob = new Blob([json_profile], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const link = document.createElement('a');
    link.href = url;
    link.download = `edge-launcher-profiles-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportOneProfile(index: number) {
    const json_profile = JSON.stringify(profiles.slice(index, index + 1));
    const blob = new Blob([json_profile], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edge-laucher-${profiles[index].name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function importProfile() {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      const fileReader = new FileReader();
      fileReader.onload = function (e) {
        const content = e.target?.result;
        autolog(content);
        const imported_profiles = JSON.parse(content as string);
        autolog(imported_profiles);
        const new_profiles = [...profiles, ...imported_profiles];
        setProfilesWithStore(new_profiles);
        setSelectedIndexWithStore(0);
      };
      fileReader.readAsText(file);
    } catch (err) {
      console.error(err);
    }
  }

  function deleteProfile(index: number) {
    const newProfiles = [...profiles];
    autolog("profiles before:", newProfiles, "index:", index);
    newProfiles.splice(index, 1);
    setSelectedIndexWithStore(0)
    setProfilesWithStore(newProfiles);
    autolog("profiles after:", newProfiles);
    autolog(selected_index)
  }

  function duplicateProfile(index: number) {
    const newProfile = { ...profiles[index] };
    newProfile.id = Math.random().toString(36).substring(7);
    newProfile.name = newProfile.name + " Copy";
    const newProfiles = [...profiles];
    newProfiles.splice(index + 1, 0, newProfile);
    setProfilesWithStore(newProfiles);
  }

  function copyFullCommand(index: number) {
    const cmd = `& '${getExePath(profiles[index])}' ${getProfileParams(profiles[index])}`
    navigator.clipboard.writeText(cmd).then(() => {
      autolog('Async: Copying to clipboard was successful!');
    }, (err) => {
      autolog('Async: Could not copy text: ', err);
    });
  }

  function copyAsVscodeDebugArgs(index: number) {
    const args = "[" + getProfileParams(profiles[index]).split(' ').map((arg) => {
      return `"${arg}"`
    }).join(', ') + "]"

    navigator.clipboard.writeText(args).then(() => {
      autolog('Async: Copying to clipboard was successful!');
    }, (err) => {
      autolog('Async: Could not copy text: ', err);
    });
  }

  const profileUpdated = (event: UIEvent) => {
    autolog(`profileUpdated, name: ${event.target.name}, new value: ${event.target.value}`);
    Object.assign(selected_profile, { [event.target.name]: event.target.value });
    autolog(selected_profile);
    setSelectedProfile({ ...selected_profile });
    profiles[selected_index] = { ...selected_profile };
    setProfilesWithStore([...profiles]);
  };

  const selectionUpdated = (index: number) => {
    setSelectedIndexWithStore(index);
  }

  const reorder = (arr: Profile[], start: number, end: number) => {
    const result = [...arr];
    const [removed] = result.splice(start, 1);
    result.splice(end, 0, removed);
    return result;
  };

  function onDragEnd(result: DropResult) {
    autolog(result);
    if (!result.destination) {
      return;
    }

    const src = result.source.index
    const dest = result.destination.index
    let new_index: number = selected_index;
    if (src < selected_index && selected_index <= dest) {
      new_index = selected_index - 1;
    }
    else if (dest <= selected_index && selected_index < src) {
      new_index = selected_index + 1;
    }
    else if (src === selected_index) {
      new_index = dest;
    }

    setSelectedIndexWithStore(new_index);
    setProfilesWithStore(reorder(profiles, result.source.index, result.destination.index));
  }

  function onBeforeDragStart(event: DragStart) {
    setDraggingIndex(event.source.index);
  }

  return {
    profiles,
    selected_index,
    selected_profile,
    dragging_index,
    createNewProfile,
    exportAll,
    exportOneProfile,
    importProfile,
    deleteProfile,
    duplicateProfile,
    copyFullCommand,
    copyAsVscodeDebugArgs,
    profileUpdated,
    selectionUpdated,
    onDragEnd,
    onBeforeDragStart
  };
}
