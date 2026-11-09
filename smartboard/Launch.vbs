' Nepal Digital Education - Smart Board (desktop). Double-click to open the board in its own window.
'
' The first run also sets things up for this Windows user (no administrator needed):
'   - registers the "nepalsmartboard://" link, so the dashboard's "Desktop" button can open this app
'   - puts a "Nepal Smart Board" shortcut on the Desktop
' Run with /dry (cscript Launch.vbs /dry) to only show what would be set up.
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptPath = WScript.ScriptFullName
dir = Left(scriptPath, InStrRev(scriptPath, "\"))
sh.CurrentDirectory = dir

dry = False
If WScript.Arguments.Count > 0 Then
  If LCase(WScript.Arguments(0)) = "/dry" Then dry = True
End If

protoCmd = "wscript.exe """ & scriptPath & """ ""%1"""
lnkPath = sh.SpecialFolders("Desktop") & "\Nepal Smart Board.lnk"

If dry Then
  WScript.Echo "Folder:   " & dir
  WScript.Echo "Link:     HKCU\Software\Classes\nepalsmartboard  ->  " & protoCmd
  WScript.Echo "Shortcut: " & lnkPath & IIf2(fso.FileExists(lnkPath), "  (already there)", "  (would be created)")
  WScript.Echo "Node.js:  " & IIf2(sh.Run("cmd /c where node >nul 2>nul", 0, True) = 0, "found", "NOT FOUND")
  WScript.Quit 0
End If

' Node.js is needed to start the board's local server
If sh.Run("cmd /c where node >nul 2>nul", 0, True) <> 0 Then
  MsgBox "Node.js is needed to start the Smart Board on this computer." & vbCrLf & "Install it from https://nodejs.org and try again.", 48, "Nepal Digital Education - Smart Board"
  WScript.Quit 1
End If

On Error Resume Next
' 1. the nepalsmartboard:// link (rewritten each run, so it keeps working if this folder is moved)
base = "HKCU\Software\Classes\nepalsmartboard\"
sh.RegWrite base, "URL:Nepal Smart Board", "REG_SZ"
sh.RegWrite base & "URL Protocol", "", "REG_SZ"
sh.RegWrite base & "shell\open\command\", protoCmd, "REG_SZ"
' 2. Desktop shortcut (created once)
If Not fso.FileExists(lnkPath) Then
  Set lnk = sh.CreateShortcut(lnkPath)
  lnk.TargetPath = "wscript.exe"
  lnk.Arguments = """" & scriptPath & """"
  lnk.WorkingDirectory = dir
  lnk.Description = "Nepal Digital Education - Smart Board"
  edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  If fso.FileExists(edge) Then lnk.IconLocation = edge & ",0"
  lnk.Save
End If
On Error GoTo 0

sh.Run "cmd /c node launcher.js", 0, False

Function IIf2(c, a, b)
  If c Then
    IIf2 = a
  Else
    IIf2 = b
  End If
End Function
