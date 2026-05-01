import { useEffect, useState } from 'react';
import { friendRequestsAPI, friendshipsAPI } from "../api";
import useStore from "../store";
import { Check, X } from "lucide-react";

const Requests = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const setFriends = useStore((state) => state.setFriends);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			const response = await friendRequestsAPI.getRequests();
			setRequests(response.data.received || []);
		} catch (err) {
			console.error("Error fetching requests", err);
		} finally {
			setLoading(false);
		}
	};

	const handleAccept = async (id) => {
		try {
			await friendRequestsAPI.accept(id);
			fetchRequests();
			// Refresh friends
			const friendsResponse = await friendshipsAPI.getFriends();
			setFriends(friendsResponse.data);
			alert("Friend added successfully!");
		} catch (err) {
			console.error("Error accepting", err);
			alert("Failed to accept request");
		}
	};

	const handleReject = async (id) => {
		try {
			await friendRequestsAPI.reject(id);
			fetchRequests();
			alert("Request rejected");
		} catch (err) {
			console.error("Error rejecting", err);
			alert("Failed to reject request");
		}
	};

	if (loading)
		return <div className="text-center py-12">Loading requests...</div>;

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">
				Friend Requests ({requests.length})
			</h2>
			<div className="space-y-4">
				{requests.map((request) => (
					<div
						key={request.id}
						className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center"
					>
						<div>
							<h3 className="font-semibold text-lg">
								{request.sender.name}
							</h3>
							<p className="text-gray-600">
								{request.sender.email}
							</p>
						</div>
						<div className="space-x-3 flex">
							<button
								onClick={() => handleAccept(request.id)}
								className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center space-x-2"
							>
								<Check size={18} />
								<span>Accept</span>
							</button>
							<button
								onClick={() => handleReject(request.id)}
								className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition flex items-center space-x-2"
							>
								<X size={18} />
								<span>Reject</span>
							</button>
						</div>
					</div>
				))}
				{requests.length === 0 && (
					<div className="text-center py-12 text-gray-500">
						No pending requests
					</div>
				)}
			</div>
		</div>
	);
};

export default Requests;
