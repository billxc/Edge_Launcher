'use client'

import Image from "next/image";
import { getExePath, getProfileParams, DEFAULT_PROFILES, CHANNELS, getIcon } from "./launcher";
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';



export default function Home() {
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [selected_index, setSelectedIndex] = useState(0);

  return (
    <main>
      <div class="flex h-screen overflow-hidden">
        {/* <!-- Left Panel --> */}
        <div class="w-1/2 overflow-auto p-5">
          {profiles.map((profile, index) => <div key={index}>
            <div class="profile-icon-container" title={profile.exePath}>
              <Image width={50} height={50} src="/edge.ico" alt="Edge" />
              {profile.selectedChannel === "customized" && <span class="profile-icon-label">{profile.labelText}</span>}
            </div>
            <div>
              <div class="profile-overview-name" title={getExePath(profile)}>
              </div>
              <div class="profile-overview-params">
                <div class="profile-overview-params-inner">
                  {getProfileParams(profile)}
                </div>
              </div>
              <div class="action-buttons">
                <button class="delete-btn" onclick="deleteProfile(index,event)">&#10006;</button>
                <button class="move-btn" onclick="moveup(index,event)">&#708;
                </button>
                <button class="move-btn" onclick="movedown(index,event)">&#709;</button>
                <button class="launch-btn" onclick="launch(index)">Launch</button>
              </div>
            </div>
          </div>)}
          {/* <!-- Content for Left Panel --> */}
        </div>

        {/* <!-- Right Panel --> */}
        <div class="w-1/2 overflow-auto p-5">
          <FormControl className="w-1/2">
            <InputLabel id="channel-label">Channel</InputLabel>
            <Select
              labelId="channel-label"
              id="channel-select"
              value={profiles[selected_index].selectedChannel}
              label="Age"
            // onChange={}
            >
              {CHANNELS.map((channel, index) => <MenuItem value={channel} key={index}><Image width={10} height={10} src={getIcon(channel)} /> {channel}</MenuItem>)}
            </Select>
          </FormControl>
        </div>
      </div>
    </main >
  );
}
