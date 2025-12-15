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

	; 递归打包，但排除 .git 文件夹
	File /r /x ".git" "..\..\*.*"

SectionEnd

;--------------------------------
; 安装完成后操作
;--------------------------------
Section "PostInstall"

	MessageBox MB_OK "Tagsy 安装完成！"

	ExecShell "open" "https://weavefate.asia/Module/Tagsy_ApiBridge.user.js"
	ExecShell "open" "https://weavefate.asia/Module/Tagsy_Core.user.js"
	ExecShell "open" "https://weavefate.asia/Resource/Web/Login.html"

SectionEnd