import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CometChatFrameProvider } from "@cometchat/chat-uikit-react";
import App from './App';
import "./index.css";

const root = createRoot(document.getElementById("root"));

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<CometChatFrameProvider>
				<App />
			</CometChatFrameProvider>
		</BrowserRouter>
	</React.StrictMode>,
);