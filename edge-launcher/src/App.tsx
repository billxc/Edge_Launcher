import { useState } from 'react'
import './App.css'
import { Channel, DEFAULT_PROFILES, EXE_PATHS, Profile, getExePath, getIcon, getProfileParams, launchProfile } from "./launcher";
import { Avatar, Button, FormControl, IconButton, InputLabel, List, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult, DragStart } from "react-beautiful-dnd";
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TerminalIcon from '@mui/icons-material/Terminal';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import BugReportIcon from '@mui/icons-material/BugReport';

import { autolog } from './autolog';
function App() {
  // get from local storage
  const stored_profiles_str = localStorage.getItem('profiles');
  const init_profiles: Profile[] = stored_profiles_str ? JSON.parse(stored_profiles_str) : DEFAULT_PROFILES;
  // append the id to the profiles if not exist
  init_profiles.forEach((profile) => {
    if (!profile.id) {
      profile.id = Math.random().toString(36).substring(7);
    }
  });
  autolog("init_profiles", init_profiles);

  const stored_selected_index_str = localStorage.getItem('selected_index');
  autolog("selected index: " + stored_selected_index_str)

  const init_selected_index = stored_selected_index_str && parseInt(stored_selected_index_str) >= 0 ? parseInt(stored_selected_index_str) : 0;
  const [profiles, setProfiles] = useState(init_profiles);
  const [selected_index, setSelectedIndex] = useState(init_selected_index);
  const [dragging_index, setDraggingIndex] = useState(-1);
  const [selected_profile, setSelectedProfile] = useState(profiles[selected_index]);

  function setProfilesWithStore(profiles: Profile[]) {
    setProfiles(profiles);
    localStorage.setItem('profiles', JSON.stringify(profiles));
    // also save a snapshot of the day
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
    // Create a link and trigger the download
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
    // Create a link and trigger the download
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
      // handle the selected file
      // read the file as json
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
    // insert the new profile after the selected index
    newProfiles.splice(index + 1, 0, newProfile);
    setProfilesWithStore(newProfiles);
  }

  function copyFullCommand(index: number) {
    const cmd = `& '${getExePath(profiles[index])}' ${getProfileParams(profiles[index])}`
    // set clipboard
    navigator.clipboard.writeText(cmd).then(() => {
      autolog('Async: Copying to clipboard was successful!');
    }, (err) => {
      autolog('Async: Could not copy text: ', err);
    });
  }

  function copyAsVscodeDebugArgs(index: number) {
    // TODO handle the space more properly
    const args = "[" + getProfileParams(profiles[index]).split(' ').map((arg) => {
      return `"${arg}"`
    }).join(', ') + "]"

    // set clipboard
    navigator.clipboard.writeText(args).then(() => {
      autolog('Async: Copying to clipboard was successful!');
    }, (err) => {
      autolog('Async: Could not copy text: ', err);
    });
  }

  interface UIEvent {
    target: {
      value: string | null;
      name: string;
    }
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
    // dropped outside the list
    autolog(result);
    if (!result.destination) {
      return;
    }

    // update the selected index
    // simulate the drag and drop
    const src = result.source.index
    const dest = result.destination.index
    // src
    // select
    // dest
    // 1. selected_index < src < dest, nochange
    // 2. dest < src < selected_index, nochange
    // 3. src < selected_index < dest, selected_index - 1
    // 3. dest < selected_index < src, selected_index + 1
    // 4. selected_index === src, selected_index = dest
    // 5. selected_index === dest, selected_index = src
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
    // autolog("selected_index", selected_index);
    // autolog("src", src);
    // autolog("dest", dest);
    // autolog("new_index", new_index);

    setSelectedIndexWithStore(new_index);

    setProfilesWithStore(reorder(profiles, result.source.index, result.destination.index));
  }

  function onBeforeDragStart(event: DragStart) {
    setDraggingIndex(event.source.index);
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="w-1/2 overflow-auto p-5">
          <DragDropContext onBeforeDragStart={onBeforeDragStart} onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {provided =>
                <>
                  <List ref={provided.innerRef}
                    disablePadding={true}
                    {...provided.droppableProps}>
                    {profiles.map((profile, index) =>
                      <Draggable
                        key={profile.id} draggableId={profile.id} index={index}>
                        {provided_ =>
                          <div ref={provided_.innerRef}
                            {...provided_.draggableProps}
                            {...provided_.dragHandleProps}>
                            <ListItemButton
                              className='listitem !rounded-xl !mb-1.5 min-h-20'
                              selected={index == selected_index}
                              onClick={() => selectionUpdated(index)} >
                              <ListItemAvatar>
                                <Avatar className='!rounded-none !bg-transparent relative'>
                                  <img src={getIcon(profile.selectedChannel)} alt={getProfileParams(profile)} />
                                  {
                                    profile.selectedChannel === Channel.CUSTOMIZED &&
                                    <div className="rounded-label absolute w-7 h-3 bottom-0 right-0 text-yellow-500 bg-purple-500 flex justify-center	">
                                      <span className='text-label font-bold object-center text-yellow-500'>{profile.labelText}</span>
                                    </div>
                                  }
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={<h1 className="!font-bold	!font-sans	">{profile.name}</h1>}
                                secondary={<span className='break-all'>{getProfileParams(profile)}</span>}
                              />
                              {/* controls */}
                              {/* display only when ListItemButton is hoverd */}
                              <div className='controls absolute right-1 bg-white bg-opacity-70 rounded-full p-1'>
                                {/* <IconButton aria-label="drag">
                                  <DragIndicatorIcon />
                                </IconButton> */}
                                <Tooltip title="export profile" arrow>
                                  <IconButton aria-label="export profile" onClick={() => exportOneProfile(index)}>
                                    <FileDownloadIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="copy as vscode debug args" arrow>
                                  <IconButton aria-label="copy as vscode debug args" onClick={() => copyAsVscodeDebugArgs(index)}>
                                    <BugReportIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="copy command" arrow>
                                  <IconButton aria-label="copy command" onClick={() => copyFullCommand(index)}>
                                    <TerminalIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="duplicate profile" arrow>
                                  <IconButton aria-label="duplicate profile" onClick={() => duplicateProfile(index)}>
                                    <ContentCopyIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="delete profile" arrow>
                                  <IconButton disabled={profiles.length == 1}
                                    onClick={() => deleteProfile(index)}
                                    aria-label="delete profile">
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </ListItemButton>
                          </div>
                        }
                      </Draggable>
                    )}
                  </List>
                  {dragging_index !== -1 && provided.placeholder}
                </>
              }
            </Droppable>
          </DragDropContext>
          <div className='flex justify-end mt-14'>
            <Button className='!m-2' onClick={() => importProfile()} variant="contained"><FileUploadIcon />Import</Button>
            <Button className='!m-2' onClick={() => exportAll()} variant="contained"><FileDownloadIcon />Export</Button>
            <Button className='!m-2' onClick={() => createNewProfile()} variant="contained"><AddIcon />Create New</Button>
          </div>
        </div >
        {selected_profile &&
          <div className="w-1/2 overflow-auto p-5 flex flex-col">
            {/* Profile name */}
            <TextField
              name="name"
              label="Profile Name"
              className='[&_input]:!font-bold'
              value={selected_profile.name}
              onChange={profileUpdated}
            />
            <FormControl
              variant="standard"
              fullWidth
              margin="normal">
              {/* Channel */}
              <InputLabel id="channel-label">Channel</InputLabel>
              <Select
                name="selectedChannel"
                labelId="channel-label"
                id="channel"
                value={selected_profile.selectedChannel}
                label="Channel"
                onChange={profileUpdated}
              >
                {Object.values(Channel).map((channel, index) => <MenuItem value={channel} key={index}>
                  <div className="flex flex-row">
                    <img className="w-5 h-5" src={getIcon(channel)} alt={channel} />
                    <span>{channel}</span>
                  </div>
                </MenuItem>)}
              </Select>
            </FormControl>
            {selected_profile.selectedChannel === Channel.CUSTOMIZED &&
              <>
                <FormControl fullWidth className='!flex !flex-row !mt-5'>
                  {/* Label Text */}
                  <TextField
                    variant="standard"
                    className='w-1/5 !min-w-12'
                    label="Label Text"
                    onChange={profileUpdated}
                    name="labelText"
                    value={selected_profile.labelText}
                  />
                  {/* EXE Path */}
                  <TextField
                    className='w-4/5 !min-w-12'
                    value={selected_profile.exePath}
                    onChange={profileUpdated}
                    variant="standard"
                    name='exePath'
                    label="exePath" />
                </FormControl>

              </>
            }
            <TextField
              variant="standard"
              label="App Directory"
              margin="normal"
              name="appDir"
              onChange={profileUpdated}
              value={selected_profile.appDir}
            />
            <TextField
              multiline
              variant="standard"
              label="Disabled Features"
              margin="normal"
              onChange={profileUpdated}
              name="disabledFeatures"
              value={selected_profile.disabledFeatures}
            />
            <TextField
              variant="standard"
              multiline
              label="Enabled Features"
              margin="normal"
              name="enabledFeatures"
              onChange={profileUpdated}
              value={selected_profile.enabledFeatures}
            />
            <TextField
              multiline
              minRows={3}
              label="Extra Parameters"
              margin="normal"
              name="extraParams"
              onChange={profileUpdated}
              value={selected_profile.extraParams}
            />
            <Button variant="contained" className='h-18' size='large' onClick={() => launchProfile(selected_profile)}>
              Launch
              <RocketLaunchIcon />
            </Button>
          </div>
        }
      </div >
    </>
  )
}

export default App
