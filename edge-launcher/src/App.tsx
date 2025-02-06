import './App.css'
import { Channel, getIcon, getProfileParams, launchProfile } from "./launcher";
import { Avatar, Button, FormControl, IconButton, InputLabel, List, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TerminalIcon from '@mui/icons-material/Terminal';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useProfiles } from './appHooks';

function App() {
  const {
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
  } = useProfiles();

  return (
    <>
      <div className="app-container">
        <div className="profile-list-section">
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
                              className="listitem"
                              selected={index == selected_index}
                              onClick={() => selectionUpdated(index)} >
                              <ListItemAvatar>
                                <Avatar className="profile-avatar">
                                  <img src={getIcon(profile.selectedChannel)} alt={getProfileParams(profile)} />
                                  {
                                    profile.selectedChannel === Channel.CUSTOMIZED &&
                                    <div className="rounded-label">
                                      <span className="text-label">{profile.labelText}</span>
                                    </div>
                                  }
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={<h1 className="profile-name">{profile.name}</h1>}
                                secondary={<span className="profile-param">{getProfileParams(profile)}</span>}
                              />
                              <div className="controls">
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
          <div className="button-group">
            <Button className="action-button" onClick={() => importProfile()} variant="contained">
              <FileUploadIcon />Import
            </Button>
            <Button className="action-button" onClick={() => exportAll()} variant="contained">
              <FileDownloadIcon />Export
            </Button>
            <Button className="action-button" onClick={() => createNewProfile()} variant="contained">
              <AddIcon />Create New
            </Button>
          </div>
        </div>
        {selected_profile &&
          <div className="profile-detail-section">
            <TextField
              name="name"
              label="Profile Name"
              className="font-bold-input"
              value={selected_profile.name}
              onChange={profileUpdated}
            />
            <FormControl variant="standard" fullWidth margin="normal">
              <InputLabel id="channel-label">Channel</InputLabel>
              <Select
                name="selectedChannel"
                labelId="channel-label"
                id="channel"
                value={selected_profile.selectedChannel}
                label="Channel"
                onChange={profileUpdated}
              >
                {Object.values(Channel).map((channel, index) => 
                  <MenuItem value={channel} key={index}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                      <img style={{width: '1.25rem', height: '1.25rem'}} src={getIcon(channel)} alt={channel} />
                      <span>{channel}</span>
                    </div>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            {selected_profile.selectedChannel === Channel.CUSTOMIZED &&
              <>
                <FormControl fullWidth style={{display: 'flex', flexDirection: 'row', marginTop: '1.25rem'}}>
                  <TextField
                    variant="standard"
                    style={{width: '20%', minWidth: '3rem'}}
                    label="Label Text"
                    onChange={profileUpdated}
                    name="labelText"
                    value={selected_profile.labelText}
                  />
                  <TextField
                    style={{width: '80%', minWidth: '3rem'}}
                    value={selected_profile.exePath}
                    onChange={profileUpdated}
                    variant="standard"
                    name="exePath"
                    label="exePath"
                  />
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
            <Button variant="contained" className="launch-button" size="large" onClick={() => launchProfile(selected_profile)}>
              Launch
              <RocketLaunchIcon />
            </Button>
          </div>
        }
      </div>
    </>
  )
}

export default App
