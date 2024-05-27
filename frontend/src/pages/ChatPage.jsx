import { SearchIcon } from "@chakra-ui/icons"
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react"
import Conversation from "../components/Conversation"
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast"
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationAtom, selectedConversationAtom } from "../atoms/messageAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {

    const showToast = useShowToast();
    const [loadingConversations, setLoadingConverstions] = useState(true);
    const [conversations, setConversations] = useRecoilState(conversationAtom);
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const [searchText, setSearchText] = useState("");
    const [searchingUser, setSearchingUser] = useState(false);
    const currentUser = useRecoilValue(userAtom);
    const { socket, onlineUsers } = useSocket();

    useEffect(() => {
        socket?.on("messagesSeen", ({ conversationId }) => {
            setConversations((prev) => {
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true,
                            }
                        }
                    }
                    return conversation;
                })
                return updatedConversations;
            })
        })
    }, [socket, setConversations]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await fetch("/api/messages/conversations");

                const data = await res.json();

                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }

                setConversations(data);

            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingConverstions(false);
            }
        };

        getConversations();
    }, [setConversations, showToast]);

    const handleConversationSearch = async (e) => {
        e.preventDefault();
        setSearchingUser(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);
            const searchUser = await res.json();

            if (searchUser.error) {
                showToast("Error", searchUser.error, "error");
                return;
            }

            const messagingYourself = searchUser._id === currentUser._id;
            if (messagingYourself) {
                showToast("Error", "You cannot message yourself", "error");
                return;
            }

            const conversationAlreadyExists = conversations.find(conversation => conversation.participants[0]._id === searchUser._id);
            if (conversationAlreadyExists) {
                setSelectedConversation({
                    _id: conversationAlreadyExists._id,
                    userId: searchUser._id,
                    username: searchUser.username,
                    userProfilePic: searchUser.profilePic,
                })
                return;
            }

            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "",
                    sender: "",
                },
                _id: Date.now(),
                participants: [
                    {
                        _id: searchUser._id,
                        username: searchUser.username,
                        profilePic: searchUser.profilePic,
                    }
                ]
            };

            setConversations((preveConvs) => [...preveConvs, mockConversation])

        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setSearchingUser(false)
            setSearchText("");
        }
    };

    return (
        <Box
            position={"absolute"}
            left={"50%"}
            w={{
                base: "100%",
                md: "80%",
                lg: "750px"
            }}
            transform={"translateX(-50%)"}
            p={4}
        >
            <Flex
                gap={4}
                flexDirection={{
                    base: "column",
                    md: "row"
                }}
                maxW={{
                    sm: "400px",
                    md: "full"
                }}
                mx={"auto"}
            >
                {/* Conversation Container */}
                <Flex
                    flex={30}
                    gap={2}
                    flexDirection={"column"}
                    maxW={{
                        sm: "250px",
                        md: "full"
                    }}
                    mx={"auto"}
                >
                    <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
                        Your Conversations
                    </Text>

                    <form onSubmit={handleConversationSearch}>
                        <Flex alignItems={"center"} gap={2} justifyContent={"space-between"}>
                            <Input
                                placeholder="Search for a user"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>

                    {
                        loadingConversations && (
                            [0, 1, 2, 3, 4,].map((_, i) => (
                                <Flex key={i} gap={4} alignItems={"center"} p={1} borderRadius={"md"}>
                                    <Box>
                                        <SkeletonCircle size={10} />
                                    </Box>
                                    <Flex w={"full"} flexDirection={"column"} gap={3}>
                                        <Skeleton h={"10px"} w={"80px"} />
                                        <Skeleton h={"8px"} w={"90%"} />
                                    </Flex>
                                </Flex>
                            ))
                        )
                    }

                    {
                        !loadingConversations && conversations.length !== 0 && (
                            conversations.map(conversation => (
                                <Conversation
                                    key={conversation._id}
                                    conversation={conversation}
                                    isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                                />
                            ))
                        )
                    }

                </Flex>

                {/* Message Conainer */}

                {
                    !selectedConversation._id && (<Flex
                        flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDirection={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        h={"400px"}
                    >
                        <GiConversation size={100} />
                        <Text size={20}>Select a conversation to start messaging</Text>
                    </Flex>)
                }

                {
                    selectedConversation._id && (
                        <MessageContainer />
                    )
                }

            </Flex>

        </Box >
    )
}

export default ChatPage