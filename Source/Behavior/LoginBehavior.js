class LoginBehavior extends Behavior {
	static __autoRegister = Behavior._register(this);
}
class LoginAddAanimationEffect extends LoginBehavior {
	// 给背景添加粒子动画
	async addParticleEffects() {
		const canvas = this.animation_canvas;
		const ctx = canvas.getContext("2d");
		let width, height;

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
		}
		window.addEventListener("resize", resize);
		resize();

		class Particle {
			constructor() {
				this.reset();
			}
			reset() {
				this.x = Math.random() * width;
				this.y = Math.random() * height;
				this.size = 1 + Math.random() * 5;
				this.speedX = (Math.random() - 0.5) * 0.5;
				this.speedY = (Math.random() - 0.5) * 0.5;
				this.opacity = 0.1 + Math.random() * 0.4;
			}
			update() {
				this.x += this.speedX;
				this.y += this.speedY;
				if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
					this.reset();
				}
			}
			draw(ctx) {
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(13, 148, 136, " + this.opacity + ")"; // Tailwind teal-600
				ctx.fill();
			}
		}

		const particles = [];
		const PARTICLE_COUNT = 80;
		for (let i = 0; i < PARTICLE_COUNT; i++) {
		particles.push(new Particle());
		}

		function animate() {
			ctx.clearRect(0, 0, width, height);
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				p.update();
				p.draw(ctx);
			}
			requestAnimationFrame(animate);
		}
		animate();
	}
}
class LoginAddAuxiliaryLogic extends LoginBehavior {
	// 切换二维码区域的遮罩状态
	async toggleQrMask() {
		const infomation_div = this.infomation_div;
		const qr_div = this.qr_div;
		const form_visible = infomation_div.classList.contains('opacity-100');

		if (form_visible) {
			infomation_div.classList.replace('opacity-100', 'opacity-0');
			infomation_div.classList.add('pointer-events-none');
			
			qr_div.classList.replace('opacity-0', 'opacity-100');
			qr_div.classList.remove('pointer-events-none');
			await this.regAccountAddQrLogin();
		} else {
			infomation_div.classList.replace('opacity-0', 'opacity-100');
			infomation_div.classList.remove('pointer-events-none');

			qr_div.classList.replace('opacity-100', 'opacity-0');
			qr_div.classList.add('pointer-events-none');
		}
	}
	async regAccountAddQrLogin() {
		const qr_url_img = this.qr_url_img;

		let result;
		result = await ApiboxApi.getQrCode();
		if (result.code == 200) {
			qr_url_img.src = result.logqrcode;
			LoginGlobal.cache.cookie.query_id = result.cxid;
		}
		await Delay.sleepSeconds(5);
		let i = 0;
		let loginStatusFlag = true;
		while(loginStatusFlag && i <= 5) {
			result = await ApiboxApi.queryLogin();
			if (result.code == 200) {
				loginStatusFlag = false;
				// 验证登录
				const result1 = await ApiboxApi.verifyLogin();
				if (result1.code == 200) {
					LoginGlobal.cache.information.name = result1.name;
					LoginGlobal.cache.information.password = result1.pwd;
				} else if (result1.msg.includes("未查询到账号")) {
					// 注册账号
					LoginGlobal.cache.information.name = result.nickname;
					LoginGlobal.cache.cookie.avatar_url = result.faceimg;
					LoginGlobal.cache.information.password = "000000";
					await ApiboxApi.regAccount();
					// 绑定账号
					LoginGlobal.cache.cookie.nick_name = result.nickname;
					LoginGlobal.cache.cookie.uid = result.social_uid;
					await ApiboxApi.bindAccount();
					await ApiboxApi.loginAccount();
				} else {
					this.log.log("登录失败");
				}
				// 登录后的操作
				LoginGlobal.status.login = true;
				LoginGlobal.cache.information.name = result1.name;
				LoginGlobal.cache.information.password = result1.pwd;
				location.href = "./Index.html";
				this.log.log("登录成功");
			}
			await Delay.sleepSeconds(10);
			i++;
		}
		if (i == 6) {
			// 重新获取验证码
			const overlay = document.getElementById("qr_retry_overlay");
			overlay.classList.remove("opacity-0", "pointer-events-none");
			this.log.error("登录超时");
		}
	}
}
class LoginBehaviorBindEvents extends LoginBehavior {
// 显示密码
	async togglePasswordMask() {
		// 密码显示切换
		const password_toggle_btn = this.password_toggle_btn;
		const password_input = this.password_input;
		password_toggle_btn.addEventListener('click', () => {
			const type = password_input.getAttribute('type') === 'password' ? 'text' : 'password';
			password_input.setAttribute('type', type);
			password_toggle_btn.classList.toggle('fa-eye');
			password_toggle_btn.classList.toggle('fa-eye-slash');
		});
	}
	async loginUserName() {
		// 登录按钮
		const login_btn = this.login_btn;
		const username_input = this.username_input;
		const password_input = this.password_input;
		login_btn.addEventListener('click', async () => {
			LoginGlobal.cache.information.name = username_input.value;
			LoginGlobal.cache.information.password = password_input.value;
			let result = await ApiboxApi.loginAccount();
			if (result.code == 200) {
				this.log.log("登录成功");
				LoginGlobal.status.login = true;
				location.href = "./Index.html";
			}
		});
	}
	async regAccountForBtn() {
		const register_btn = this.register_btn;
		register_btn.addEventListener('click', async () => {
			LoginAddAuxiliaryLogic.toggleQrMask();
		});
	}
	async regAccountForQrBtn() {
		// 二维码切换逻辑
		const qr_toggle_btn = this.qr_toggle_btn;
		qr_toggle_btn.addEventListener('click', async () => {
			LoginAddAuxiliaryLogic.toggleQrMask();
		});
	}
}