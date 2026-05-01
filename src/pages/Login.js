import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import useStore from '../store';
import CometChat, { AUTH_KEY, ensureCometChatInitialized } from '../cometchat';

const Login = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [cometchatUid, setCometchatUid] = useState("");
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [ready, setReady] = useState(false);
	const navigate = useNavigate();
	const login = useStore((state) => state.login);
	const hydrated = useStore((state) => state.hydrated);

	// Wait for store to hydrate before showing the form
	useEffect(() => {
		if (!hydrated) {
			return;
		}
		setReady(true);
	}, [hydrated]);

	// Redirect if already logged in
	const isAuthenticated = useStore((state) => state.isAuthenticated);
	const token = useStore((state) => state.token);
	const user = useStore((state) => state.user);

	useEffect(() => {
		if (ready && isAuthenticated && token && user) {
			navigate("/users");
		}
	}, [ready, isAuthenticated, token, user, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Trim whitespace
		const trimmedEmail = email.trim();
		const trimmedPassword = password.trim();
		const trimmedName = name.trim();
		const trimmedCometchatUid = cometchatUid.trim();

		// Client-side validation
		if (!trimmedEmail || !trimmedPassword) {
			setError("Email and password are required");
			return;
		}

		if (!isLogin && (!trimmedName || !trimmedCometchatUid)) {
			setError("Name and CometChat UID are required for signup");
			return;
		}

		if (!isLogin && trimmedPassword.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			let response;
			if (isLogin) {
				response = await authAPI.login(trimmedEmail, trimmedPassword);
			} else {
				response = await authAPI.signup(
					trimmedName,
					trimmedEmail,
					trimmedPassword,
					trimmedCometchatUid,
				);
			}
			const { token, user } = response.data;
			login(user, token);

			try {
				// Ensure CometChat is initialized before logging in
				await ensureCometChatInitialized();
				
				// Login to CometChat
				const c_user = await CometChat.login(user.cometchatUid, AUTH_KEY);
				console.log("CometChat login successful:", c_user);
			} catch (cometErr) {
				console.error("CometChat login failed:", cometErr);
				// Continue anyway - the app can still work
			}

			navigate("/users");
		} catch (err) {
			console.log(err);

			let errorMessage = "Error occurred";

			if (!err.response) {
				errorMessage =
					"Cannot connect to server. Make sure the backend is running on port 8000.";
			} else if (err.response?.data?.errors) {
				errorMessage = err.response.data.errors
					.map((e) => e.msg || e.message)
					.join(", ");
			} else if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err.response?.data?.error) {
				errorMessage = err.response.data.error;
			}

			console.error("Auth error:", {
				status: err.response?.status,
				data: err.response?.data,
				message: errorMessage,
			});

			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Show loading while store hydrates
	if (!ready) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
				<div className="text-white text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
			<div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full border">
				<h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
					{isLogin ? "Login" : "Sign Up"}
				</h2>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					{!isLogin && (
						<>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Name
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Enter your full name"
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									CometChat UID
								</label>
								<input
									type="text"
									value={cometchatUid}
									onChange={(e) =>
										setCometchatUid(e.target.value)
									}
									placeholder="e.g., user123 (unique identifier)"
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
									required
								/>
							</div>
						</>
					)}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="At least 6 characters"
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
							required
						/>
					</div>
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
							{error}
						</div>
					)}
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
					</button>
				</form>
				<p className="text-center mt-6 text-sm text-gray-600">
					{isLogin ? "No account?" : "Have account?"}{" "}
					<button
						type="button"
						onClick={() => setIsLogin(!isLogin)}
						className="font-medium text-blue-600 hover:text-blue-500 transition"
					>
						{isLogin ? "Sign Up" : "Login"}
					</button>
				</p>
			</div>
		</div>
	);
};

export default Login;
