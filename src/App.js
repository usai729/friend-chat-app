import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Requests from "./pages/Requests";
import Friends from "./pages/Friends";
import Conversations from "./pages/Conversations";

const App = () => {
	return (
		<>
			<Routes>
				<Route
					path="/login"
					element={<Login />}
				/>
				<Route element={<ProtectedRoute />}>
					<Route
						path="/"
						element={
							<Layout>
								<Users />
							</Layout>
						}
					/>
					<Route
						path="/users"
						element={
							<Layout>
								<Users />
							</Layout>
						}
					/>
					<Route
						path="/requests"
						element={
							<Layout>
								<Requests />
							</Layout>
						}
					/>
					<Route
						path="/friends"
						element={
							<Layout>
								<Friends />
							</Layout>
						}
					/>
					<Route
						path="/conversations"
						element={
							<Layout>
								<Conversations />
							</Layout>
						}
					/>
				</Route>
				<Route
					path="*"
					element={<Login />}
				/>
			</Routes>
		</>
	);
};

export default App;
