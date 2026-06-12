Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ""C:\Users\shrey\Downloads\app\android_automation\node_modules\.bin\appium.cmd"" --port 4723 >> ""C:\Users\shrey\Downloads\app\android_automation\appium-server.log"" 2>&1", 0, False
