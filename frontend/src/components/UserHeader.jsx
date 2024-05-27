import { Avatar, Box, Button, Flex, Link, Menu, MenuButton, MenuItem, MenuList, Portal, Text, VStack, useColorMode } from "@chakra-ui/react"
import { BsInstagram } from "react-icons/bs"
import { CgMoreO } from "react-icons/cg"
import { useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import { Link as RouterLink } from "react-router-dom"
import useShowToast from "../hooks/useShowToast"
import useFollowUnfollow from "../hooks/useFollowUnfollow"

const UserHeader = ({ user }) => {

    const showToast = useShowToast();
    const colorMode = useColorMode();
    const currentUser = useRecoilValue(userAtom);
    const {handleFollowUnfollow, updating, following} = useFollowUnfollow(user);

    const copyURL = () => {
        const currentURL = window.location.href
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast("Success", "Profile link copied", "success");
        });
    };

    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>{user.name}</Text>

                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user.username}</Text>

                        <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
                            threads.net
                        </Text>

                    </Flex>

                </Box>

                <Box>
                    <Avatar
                        name={user.name}
                        src={user.profilePic}
                        size={{
                            base: "md",
                            md: "xl",
                        }}
                    />
                </Box>

            </Flex>

            <Text>{user.bio}</Text>

            {
                currentUser?._id === user._id && (
                    <Link as={RouterLink} to="/update">
                        <Button size={"sm"}>Update Profile</Button>
                    </Link>
                )
            }
            {
                currentUser?._id !== user._id && (
                    <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
                        {
                            following ? "Unfollow" : "Follow"
                        }
                    </Button>
                )
            }

            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"}>{user.followers.length} followers</Text>

                    <Box h={1} w={1} bg={"gray.light"} borderRadius={"full"}></Box>

                    <Link color={"gray.light"}>instagram.com</Link>

                </Flex>

                <Flex>
                    <Box className={colorMode === "dark" ? "icon-container-dark" : "icon-container-light"}>
                        <BsInstagram size={24} cursor={"pointer"} />
                    </Box>

                    <Box className={colorMode === "dark" ? "icon-container-dark" : "icon-container-light"}>
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg={colorMode === "dark" ? "gray.dark" : "gray.light"}>
                                    <MenuItem bg={colorMode === "dark" ? "gray.dark" : "gray.light"} onClick={copyURL}>Copy link</MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>

                    </Box>

                </Flex>

            </Flex>

            <Flex w={"full"}>
                <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Threads</Text>
                </Flex>

                <Flex flex={1} borderBottom={"1px solid gray"} justifyContent={"center"} color={"gray.light"} pb={3} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Replies</Text>
                </Flex>

            </Flex>

        </VStack>
    )
}

export default UserHeader