import { useEffect, useState, useCallback } from "react";
import { friendshipsAPI, conversationsAPI } from "../api";
import CometChat, { AUTH_KEY, ensureCometChatInitialized } from "../cometchat";
import {
  CometChatMessageList,
  CometChatMessageComposer,
} from "@cometchat/chat-uikit-react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import useStore from "../store";

const Conversations = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [error, setError] = useState("");
  const [cometChatReady, setCometChatReady] = useState(false);
  const [storeReady, setStoreReady] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const hydrated = useStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    setStoreReady(true);
  }, [hydrated]);

  useEffect(() => {
    if (!storeReady) return;
    fetchFriends();
    initializeCometChat();
  }, [storeReady]);

  useEffect(() => {
    if (!token) setCometChatReady(false);
  }, [token]);

  const initializeCometChat = useCallback(async () => {
    try {
      await ensureCometChatInitialized();

      const loggedInUser = await CometChat.getLoggedinUser();
      if (loggedInUser) {
        setLoggedUser(loggedInUser);
        setCometChatReady(true);
        return;
      }

      if (user?.cometchat_uid || user?.cometchatUid) {
        const uid = user.cometchat_uid || user.cometchatUid;
        const cUser = await CometChat.login(uid, AUTH_KEY);
        setLoggedUser(cUser);
        setCometChatReady(true);
      }
    } catch (err) {
      console.error(err);
      setError("Chat initialization failed");
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const res = await friendshipsAPI.getFriends();
      setFriends(res.data || []);
    } catch (err) {
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFriend = async (friend) => {
  if (!cometChatReady) {
    setError("Chat service not ready. Please wait or refresh the page.");
    return;
  }

  setConversationLoading(true);
  setError("");
  try {
    await conversationsAPI.getConversation(friend.id);

    // ✅ Fetch the actual CometChat User object
    const cometChatUser = await CometChat.getUser(friend.cometchat_uid);
    setSelectedFriend({ ...friend, cometChatUser });
  } catch (err) {
    console.error("Error loading conversation", err);
    setError("Cannot open conversation with this friend. Friendship may have been removed.");
    setSelectedFriend(null);
  } finally {
    setConversationLoading(false);
  }
};

  // 🧠 Custom message renderer (MAIN FIX)
  const renderMessage = (message) => {
    const isMe = message.sender?.uid === loggedUser?.uid;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: isMe ? "flex-end" : "flex-start",
          padding: "4px 10px",
        }}
      >
        <div
          style={{
            background: isMe ? "#3b82f6" : "#f1f5f9",
            color: isMe ? "#fff" : "#000",
            padding: "10px 14px",
            borderRadius: "12px",
            maxWidth: "70%",
            wordBreak: "break-word",
          }}
        >
          {!isMe && (
            <div style={{ fontSize: "12px", fontWeight: "bold" }}>
              {message.sender?.name}
            </div>
          )}
          <div>{message.text}</div>
        </div>
      </div>
    );
  };

  if (!storeReady || loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[70vh]">
      {/* Friends */}
      <div className="w-80 bg-white border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 bg-blue-600 text-white font-bold">
          Friends ({friends.length})
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelectFriend(f)}
              className="w-full p-4 text-left border-b hover:bg-gray-50"
            >
              <div className="font-semibold">{f.name}</div>
              <div className="text-sm text-gray-500">{f.email}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 bg-white border rounded-xl flex flex-col overflow-hidden">
        {selectedFriend ? (
          <>
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
              <button onClick={() => setSelectedFriend(null)}>
                <ArrowLeft />
              </button>
              <div>
                <div className="font-bold">{selectedFriend.name}</div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col flex-1 h-full">
              {conversationLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  Loading...
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <CometChatMessageList
                      user={selectedFriend.cometChatUser}
                      style={{ height: "100%" }}
                    />
                  </div>

                  <div className="border-t">
                    <CometChatMessageComposer
                      user={selectedFriend.cometChatUser}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a friend to chat
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;