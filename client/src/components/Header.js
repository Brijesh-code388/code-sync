import LoadingButton from '@mui/lab/LoadingButton'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'

const languages = [
    "cpp",
    "java",
    "javascript",
    "kotlin",
    "python",
    "python3",
    "scala",
    "swift",
    "csharp",
    "go",
    "haskell",
    "erlang",
    "perl",
    "ruby",
    "php",
    "bash",
    "r",
    "coffeescript",
    "mysql",
    "typescript",
];
const themes = [
    "github",
    "tomorrow",
    "kuroir",
    "twilight",
    "xcode",
    "textmate",
    "solarized_dark",
    "solarized_light",
    "terminal",
];
const fontSizes = [
    "10",
    "12",
    "14",
    "16",
    "18",
    "20",
    "22",
    "24",
    "26",
    "28",
    "30",
    "32",
    "40",
    "45",
];

// function Header({ lan, handleChangeLanguages, theme, handleChangeTheme, font, handleChangeFont, onRun, isRunning, onSave, isSaving }) {
function Header({ lan, handleChangeLanguages, theme, handleChangeTheme, font, handleChangeFont, onRun, isRunning }) {
    return (
        <div className='headerWrap'>
            {/* lan */}
            <div className='leftH'>
                <FormControl sx={{ m: 1, width: '100px' }} size="small">
                    <InputLabel id="demo-select-small" size='small'>Language</InputLabel>
                    <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={lan}
                        label="language"
                        onChange={handleChangeLanguages}
                    >
                        <MenuItem style={{ fontSize: '12px' }} value="c">
                            <em>c</em>
                        </MenuItem>
                        {languages.map((val) => (
                            <MenuItem style={{ fontSize: '12px' }} key={val} value={val}><em>{val}</em></MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* theme */}
                <FormControl sx={{ m: 1, width: 'auto' }} size="small">
                    <InputLabel id="demo-select-small">Theme</InputLabel>
                    <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={theme}
                        label="Theme"
                        onChange={handleChangeTheme}
                    >
                        <MenuItem style={{ fontSize: '12px' }} value="monokai">
                            <em>monokai</em>
                        </MenuItem>
                        {themes.map((val) => (
                            <MenuItem style={{ fontSize: '12px' }} key={val} value={val}><em>{val}</em></MenuItem>
                        ))}

                    </Select>
                </FormControl>
                {/* font */}
                <FormControl sx={{ m: 1, width: '90px' }} size="small">
                    <InputLabel id="demo-select-small">Font</InputLabel>
                    <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={font}
                        label="Font"
                        onChange={handleChangeFont}
                    >
                        <MenuItem style={{ fontSize: '12px' }} value="8">
                            <em>8</em>
                        </MenuItem>
                        {fontSizes.map((val) => (
                            <MenuItem style={{ fontSize: '12px' }} key={val} value={val}><em>{val}</em></MenuItem>
                        ))}

                    </Select>
                </FormControl>
            </div>


            <div className='rightH'>
                <LoadingButton
                    onClick={onRun}
                    loading={isRunning}
                    loadingPosition="center"
                    variant="contained"
                    size='small'
                    style={{ marginRight: '10px' }}
                >
                    Run
                </LoadingButton>
                {/* <LoadingButton
                    onClick={onSave}
                    loading={isSaving}
                    loadingPosition="center"
                    variant="contained"
                    size='small'
                >
                    Save
                </LoadingButton> */}
            </div>
        </div>
    )
}

export default Header