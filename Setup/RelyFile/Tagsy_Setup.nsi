;--------------------------------
; Tagsy 安装脚本
;--------------------------------

# 输出安装程序（带图标）
Outfile "..\Build\Tagsy_Setup.exe"
Icon "Tagsy.ico"

# 安装路径固定，用户不可修改
InstallDir "C:\ProgramData\Tagsy"

# 不显示安装日志，静默模式
SilentInstall silent

#--------------------------------
# 安装文件
#--------------------------------
Section "Install Files"

  # 设置安装目录
  SetOutPath "$INSTDIR"

  # 递归复制整个 Tagsy 文件夹下的内容
  ; 脚本在 Setup\RelyFile，回退到 Tagsy 根目录
  File /r "..\..\*.*"

SectionEnd

#--------------------------------
# 安装完成后操作
#--------------------------------
Section "PostInstall"

  # 用默认浏览器打开两个网页
  ExecShell "open" "https://weavefate.asia/Module/Tagsy_ApiBridge.user.js"
  ExecShell "open" "https://weavefate.asia/Module/Tagsy_Core.user.js"

SectionEnd
