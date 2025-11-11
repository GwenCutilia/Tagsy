;--------------------------------
; Tagsy 安装脚本（排除 Build 文件夹）
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

  ; 删除不需要的文件（如果被 File /r 打包了 Build 内的文件，可以用 Delete 或 Ignore）
  ; 或者使用 Exclude 逻辑（NSIS 没有原生排除选项，需要手动处理 Build 文件夹）

SectionEnd

;--------------------------------
; 安装完成后操作
;--------------------------------
Section "PostInstall"

  MessageBox MB_OK "Tagsy 安装完成！"

  ExecShell "open" "https://weavefate.asia/Module/Tagsy_ApiBridge.user.js"
  ExecShell "open" "https://weavefate.asia/Module/Tagsy_Core.user.js"

SectionEnd