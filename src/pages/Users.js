import { useEffect, useState, useCallback } from "react";
import { usersAPI, friendRequestsAPI, friendshipsAPI } from "../api";
import useStore from "../store";
import { UserPlus, Clock, Check } from "lucide-react";

const Users = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [friends, setFriendsLocal] = useState([]);
	const [pendingRequests, setPendingRequests] = useState([]);
	const [actionLoading, setActionLoading] = useState({});
	const user = useStore((state) => state.user);
	const setFriendsStore = useStore((state) => state.setFriends);

	const fetchUsers = useCallback(async () => {
		try {
			const response = await usersAPI.getUsers(search);
			setUsers(response.data || []);
		} catch (err) {
			console.error("Error fetching users", err);
		} finally {
			setLoading(false);
		}
	}, [search]);

	const fetchAllData = useCallback(async () => {
		try {
			// Fetch friends
			const friendsResponse = await friendshipsAPI.getFriends();
			setFriendsLocal(friendsResponse.data || []);
			setFriendsStore(friendsResponse.data || []);

			// Fetch pending requests
			const requestsResponse = await friendRequestsAPI.getRequests();
			const pending =
				requestsResponse.data?.filter((r) => r.status === "pending") ||
				[];
			setPendingRequests(pending);

			// Fetch users
			await fetchUsers();
		} catch (err) {
			console.error("Error fetching data", err);
		}
	}, [setFriendsStore, fetchUsers]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	useEffect(() => {
		fetchUsers();
	}, [search, fetchUsers]);

	const handleAddFriend = async (userId) => {
		setActionLoading({ ...actionLoading, [userId]: true });
		try {
			await friendRequestsAPI.sendRequest(userId);
			alert("Friend request sent!");
			await fetchAllData();
		} catch (err) {
			console.error("Error sending request", err);
			alert(
				err.response?.data?.message || "Failed to send friend request",
			);
		} finally {
			setActionLoading({ ...actionLoading, [userId]: false });
		}
	};

	const getButtonStatus = (userId) => {
		// Check if it's the current user
		if (userId === user?.id) return "self";

		// Check if already friends
		if (friends.some((f) => f.id === userId)) return "friends";

		// Check if pending request
		if (pendingRequests.some((r) => r.receiver_id === userId))
			return "pending";

		return "add";
	};

	const getButtonContent = (userId) => {
		const status = getButtonStatus(userId);

		switch (status) {
			case "self":
				return null;
			case "friends":
				return (
					<button
						disabled
						className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
					>
						<Check size={18} />
						<span>Friends</span>
					</button>
				);
			case "pending":
				return (
					<button
						disabled
						className="w-full bg-yellow-100 text-yellow-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
					>
						<Clock size={18} />
						<span>Pending</span>
					</button>
				);
			case "add":
				return (
					<button
						onClick={() => handleAddFriend(userId)}
						disabled={actionLoading[userId]}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
					>
						<UserPlus size={18} />
						<span>
							{actionLoading[userId]
								? "Sending..."
								: "Add Friend"}
						</span>
					</button>
				);
			default:
				return null;
		}
	};

	const filteredUsers = users.filter(
		(u) =>
			u.id !== user?.id &&
			u.name.toLowerCase().includes(search.toLowerCase()),
	);

	if (loading)
		return (
			<div className="text-center py-12 text-gray-500">
				Loading users...
			</div>
		);

	return (
		<>
			<div className="flex flex-col md:flex-row gap-6">
				<div className="md:w-80 bg-white rounded-xl shadow-sm border p-6 h-fit">
					<h2 className="text-xl font-semibold mb-4">Search Users</h2>
					<input
						type="text"
						placeholder="Search by name..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
					/>
					<div className="mt-6 space-y-2 text-sm">
						<p className="text-gray-600">
							<span className="font-medium">Friends:</span>{" "}
							{friends.length}
						</p>
						<p className="text-gray-600">
							<span className="font-medium">Pending:</span>{" "}
							{pendingRequests.length}
						</p>
						<p className="text-gray-600">
							<span className="font-medium">Users:</span>{" "}
							{filteredUsers.length}
						</p>
					</div>
				</div>
				<div className="flex-1">
					<h2 className="text-2xl font-bold mb-6">Discover Users</h2>
					{filteredUsers.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							No users found
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredUsers.map((u) => (
								<div
									key={u.id}
									className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
								>
									<h3 className="font-semibold text-lg mb-2">
										{u.name}
									</h3>
									<p className="text-gray-600 text-sm mb-4">
										{u.email}
									</p>
									{getButtonContent(u.id)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Users;
