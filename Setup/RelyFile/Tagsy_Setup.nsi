;--------------------------------
; Tagsy 安装脚本
;--------------------------------

Outfile "..\Build\Tagsy_Setup.exe"
Icon "Tagsy.ico"
InstallDir "C:\ProgramData\Tagsy"

;--------------------------------
; 安装文件
;--------------------------------
Section "Install Files"

  SetOutPath "$INSTDIR"

  ; 遍历 Tagsy 根目录下所有文件和文件夹
  ; 排除 Setup\Build 文件夹
  ; 文件
  File /r "..\..\*.*"

SectionEnd

;--------------------------------
; 安装完成后操作
;--------------------------------
Section "PostInstall"

  MessageBox MB_OK "Tagsy 安装完成！"

  ExecShell "open" "https://weavefate.asia/Module/Tagsy_ApiBridge.user.js"
  ExecShell "open" "https://weavefate.asia/Module/Tagsy_Core.user.js"
  ExecShell "open" "https://weavefate.asia/Resource/Template/Login.html"

SectionEnd