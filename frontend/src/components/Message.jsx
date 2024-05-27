import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react"
import { selectedConversationAtom } from "../atoms/messageAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs"
import { useState } from "react";

const Message = ({ ownMessage, message }) => {

    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const currentUser = useRecoilValue(userAtom);
    const [imgLoaded, setImgLoaded] = useState(false)

    return (
        <>
            {
                ownMessage ? (
                    <Flex gap={2} alignSelf={"flex-end"}>
                        {
                            message.text && (
                                <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
                                    <Text textColor={"white"}>{message.text}</Text>
                                    <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                                        <BsCheck2All size={16} />
                                    </Box>
                                </Flex>
                            )
                        }

                        {
                            message.img && !imgLoaded && (
                                <Flex mt={5} w={"200px"}>
                                    <Image hidden onLoad={() => setImgLoaded(true)} src={message.img} alt="Image Message" borderRadius={4} />
                                    <Skeleton w={"200px"} h={"200px"} />
                                </Flex>
                            )
                        }

                        {
                            message.img && imgLoaded && (
                                <Flex mt={5} w={"200px"}>
                                    <Image src={message.img} alt="Image Message" borderRadius={4} />
                                    <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                                        <BsCheck2All size={16} />
                                    </Box>
                                </Flex>
                            )
                        }

                        <Avatar src={currentUser.profilePic} name={currentUser.username} w={7} h={7} />
                    </Flex>

                ) : (
                    <Flex
                        gap={2}
                        alignSelf={"flex-start"}
                    >
                        <Avatar src={selectedConversation.userProfilePic} name={selectedConversation.username} w={7} h={7} />

                        {
                            message.text && (
                                <Text maxW={"350px"} bg={"gray.400"} color={"black"} p={1} borderRadius={"md"}>
                                    {message.text}
                                </Text>
                            )
                        }

                        {
                            message.img && !imgLoaded && (
                                <Flex mt={5} w={"200px"}>
                                    <Image hidden onLoad={() => setImgLoaded(true)} src={message.img} alt="Image Message" borderRadius={4} />
                                    <Skeleton w={"200px"} h={"200px"} />
                                </Flex>
                            )
                        }

                        {
                            message.img && imgLoaded && (
                                <Flex mt={5} w={"200px"}>
                                    <Image src={message.img} alt="Image Message" borderRadius={4} />
                                </Flex>
                            )
                        }
                    </Flex>
                )
            }
        </>
    )
}

export default Message