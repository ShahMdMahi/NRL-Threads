import { atom } from 'recoil';

export const conversationAtom = atom({
    key: 'conversationAtom',
    default: [],
});

export const selectedConversationAtom = atom({
    key: 'selectedConversationAtom',
    default: {
        _id: "",
        userId: "",
        username: "",
        userProfilePic: "",
    },
});

// export const messagesAtom = atom({
//     key: 'messagesAtom',
//     default: [],
// });