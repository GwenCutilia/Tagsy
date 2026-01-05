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

    ; =======================================================
    ; 【新增步骤】: 强行结束正在运行的 Go 助手进程
    ; =======================================================
    DetailPrint "Stopping Tagsy Helper Process..."
    
    ; 使用 nsExec::Exec 执行 taskkill 命令
    ; /F = 强制终止
    ; /IM = 指定镜像名称(Image Name)
    ; 1>NUL 2>NUL = 屏蔽输出结果，防止弹窗
    nsExec::Exec 'taskkill /F /IM "Tagsy_WeChat_Clicker.exe" /T'
    
    ; 【关键】等待 1 秒，确保操作系统释放了文件锁，否则下面的 RMDir 可能会失败
    Sleep 1000

    ; =======================================================
    ; 1) 清空旧安装
    ; =======================================================
    DetailPrint "Cleaning old files in $INSTDIR ..."
    RMDir /r /REBOOTOK "$INSTDIR"
    CreateDirectory "$INSTDIR"

    ; =======================================================
    ; 2) 安装 Core 相关文件
    ; =======================================================
    SetOutPath "$INSTDIR\Core"
    
    ; 直接递归拷贝 Core 文件夹下的所有内容
    File /r "..\..\Core\*.*"

    ; =======================================================
    ; 3) 安装 Go 自动点击服务
    ; =======================================================
    SetOutPath "$INSTDIR\Module\Tagsy_WeChat_Clicker"
    
    ; 从 Setup\Build 目录抓取刚才 F5 编译生成的 exe
    File "..\Build\Tagsy_WeChat_Clicker.exe"

	; =======================================================
    ; 4) 注册自定义 URL 协议 (让网页能启动程序)
    ; =======================================================
    DetailPrint "Registering tagsy:// protocol..."
    
    ; 1. 创建协议根键
    WriteRegStr HKCR "tagsy" "" "URL:Tagsy Protocol"
    WriteRegStr HKCR "tagsy" "URL Protocol" ""
    
    ; 2. 设置图标 (可选，直接用 exe 的图标)
    WriteRegStr HKCR "tagsy\DefaultIcon" "" "$INSTDIR\Module\Tagsy_WeChat_Clicker\Tagsy_WeChat_Clicker.exe,0"
    
    ; 3. 设置启动命令
    ; 关键点："%1" 代表传入的参数，虽然我们暂时不用，但最好保留格式
    WriteRegStr HKCR "tagsy\shell\open\command" "" '"$INSTDIR\Module\Tagsy_WeChat_Clicker\Tagsy_WeChat_Clicker.exe" "%1"'

SectionEnd

;--------------------------------
; 安装完成后操作
;--------------------------------
Section "PostInstall"

    MessageBox MB_OK "Tagsy 安装完成！"

    ; 4) 静默启动 Go 服务
    Exec '"$INSTDIR\Module\Tagsy_WeChat_Clicker\Tagsy_WeChat_Clicker.exe"'

    ; 5) 打开网页 (根据你提供的代码保留了这三行)
    ExecShell "open" "https://weavefate.asia/Core/UserJs/Tagsy_ApiBridge.user.js"
    ExecShell "open" "https://weavefate.asia/Core/UserJs/Tagsy_Core.user.js"
    ExecShell "open" "https://weavefate.asia/Resource/Web/W2.html"

SectionEnd