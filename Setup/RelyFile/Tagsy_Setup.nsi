;;--------------------------------
;; Tagsy 安装脚本
;;--------------------------------

;Outfile "..\Build\Tagsy_Setup.exe"
;Icon "Tagsy.ico"
;InstallDir "C:\ProgramData\Tagsy"

;;--------------------------------
;; 安装文件
;;--------------------------------
;Section "Install Files"

;	SetOutPath "$INSTDIR"

;	; 递归打包，但排除 .git 文件夹
;	File /r /x ".git" "..\..\*.*"

;SectionEnd

;;--------------------------------
;; 安装完成后操作
;;--------------------------------
;Section "PostInstall"

;	MessageBox MB_OK "Tagsy 安装完成！"

;	ExecShell "open" "https://weavefate.asia/Module/Tagsy_ApiBridge.user.js"
;	ExecShell "open" "https://weavefate.asia/Module/Tagsy_Core.user.js"
;	ExecShell "open" "https://weavefate.asia/Resource/Web/Login.html"

;SectionEnd

;--------------------------------
; Tagsy 安装脚本
; 位置：Setup\RelyFile\Tagsy_Setup.nsi
;--------------------------------

Outfile "..\Build\Tagsy_Setup.exe"
Icon "Tagsy.ico"
InstallDir "C:\ProgramData\Tagsy"

; 安装到 ProgramData 通常需要管理员权限
RequestExecutionLevel admin

;--------------------------------
; 安装文件
;--------------------------------
Section "Install Files"

; 1) 先清空旧安装（删除 C:\ProgramData\Tagsy 下所有内容）
; 直接删整个目录再重建，等价于“删除目录下全部文件/文件夹”
DetailPrint "Cleaning old files in $INSTDIR ..."
RMDir /r /REBOOTOK "$INSTDIR"
CreateDirectory "$INSTDIR"

; 2) 仅安装指定的两个文件 + 一个文件夹
; 安装结构：$INSTDIR\Module\...
SetOutPath "$INSTDIR\Core"

; 两个文件
File "..\..\Core\UserJs\Tagsy_ApiBridge.user.js"
File "..\..\Core\UserJs\Tagsy_Core.user.js"

; 一个文件夹（递归拷贝）
SetOutPath "$INSTDIR\Core"
File /r "..\..\Core\*.*"

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
