import { qs } from "../dom";
import { login, redirectAfterLogin, register } from "../auth";
import { t } from "../i18n";
import { UiView } from "@wxn0brp/flanker-ui";
import "../../styles/login.scss";

export class LoginView extends UiView {
	constructor(private defaultNext = "/upload") {
		super();
	}

	private get registerMode() {
		return location.hash.includes("register");
	}

	private get next() {
		return (
			new URLSearchParams(location.hash.split("?")[1] ?? "").get("next") ??
			this.defaultNext
		);
	}

	mounted() {
		this.paint();
	}

	onUpdate() {
		this.paint();
	}

	private paint() {
		this.element.innerHTML = this.markup();
		this.bind();
	}

	private markup() {
		const title = this.registerMode ? "Register" : "Login";
		return (
			<div id="login-view">
				<h1>{t(title)}</h1>
				<form>
					<div>
						<label for="name">
							<span>{t("Name")}</span>:
						</label>
						<input
							type="text"
							id="name"
							name="name"
							autocomplete="username"
							required
						/>
					</div>
					<div>
						<label for="pass">
							<span>{t("Password")}</span>:
						</label>
						<input
							type="password"
							id="pass"
							name="pass"
							autocomplete={
								this.registerMode ? "new-password" : "current-password"
							}
							required
						/>
					</div>
					<button type="submit">{t(title)}</button>
				</form>
				<p
					id="error-message"
					class="error-message"
					role="alert"
					aria-live="assertive"></p>
				<p class="switch-mode">
					<a href={this.registerMode ? "#/login" : "#/login?register"}>
						{t(this.registerMode ? "Login" : "Register")}
					</a>
				</p>
			</div>
		);
	}

	private bind() {
		const form = qs<HTMLFormElement>("form", this.element);
		const errorMessage = qs("#error-message", this.element);
		if (!form || !errorMessage) return;

		form.addEventListener("submit", async event => {
			event.preventDefault();
			const formData = new FormData(form);
			const name = String(formData.get("name") || "");
			const pass = String(formData.get("pass") || "");

			if (this.registerMode) {
				const result = await register(name, pass);
				if (result && "err" in result && result.err) {
					errorMessage.textContent = t(result.msg);
					return;
				}
				location.hash = "#/login";
				return;
			}

			const result = await login(name, pass);
			if (result && "err" in result && result.err) {
				errorMessage.textContent = t(result.msg);
				return;
			}
			redirectAfterLogin(this.next);
		});
	}
}
