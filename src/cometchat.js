import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit, UIKitSettingsBuilder } from '@cometchat/chat-uikit-react';

const APP_ID = '1678318ecadb95dfd';
const REGION = 'in';
export const AUTH_KEY = '0fdf9883b9d9552a18826f8ef5b50e29aeaec0e9';

const uiKitSettings = new UIKitSettingsBuilder()
  .setAppId(APP_ID)
  .setRegion(REGION)
  .setAuthKey(AUTH_KEY)
  .subscribePresenceForAllUsers()
  .build();

let initPromise = CometChatUIKit.init(uiKitSettings).then(() => {
  console.log('CometChat UI Kit initialized');
}).catch(err => {
  console.error('CometChat UI Kit init failed:', err);
});

export const ensureCometChatInitialized = () => initPromise;

export { CometChat };
export default CometChat;