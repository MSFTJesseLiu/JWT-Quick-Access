 param (
    [string]$dirpath = "C:\chrome-jwt-profile",
    [string]$shortcutname = "Chrome JWT.lnk"
 )

$shortcutpath = "$($dirpath)\$($shortcutname)"

if (!(Test-Path $dirpath -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $dirpath
}


$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutpath)
$Shortcut.TargetPath = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
$Shortcut.Arguments = "--user-data-dir=$($dirpath)"
$Shortcut.Save()
Invoke-Item -Path $shortcutpath 

#  .\setup.ps1 -dirpath C:\chrome-dev-profile
#  check chrome://version/  Profile Path