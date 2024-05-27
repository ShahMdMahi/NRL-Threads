import { AddIcon } from "@chakra-ui/icons"
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useColorModeValue,
    useDisclosure,
    FormControl,
    Textarea,
    Text,
    Input,
    Flex,
    Image,
    CloseButton
} from '@chakra-ui/react'
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postAtoms";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
    const showToast = useShowToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [postText, setPostText] = useState("");
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
    const [updating, setUpdating] = useState(false);
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
    const imageRef = useRef(null);
    const user = useRecoilValue(userAtom);
    const [posts, setPosts] = useRecoilState(postsAtom);
    const { username } = useParams();

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText)
            setRemainingChar(0);
        } else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }
    };

    const handleCreatePost = async () => {
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch('/api/posts/create', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postedBy: user._id,
                    text: postText,
                    img: imgUrl,
                }),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            if (data.message) {
                showToast("Success", data.message, "success");
                onClose();
                setPostText("");
                setRemainingChar(MAX_CHAR);
                setImgUrl("");
                if (username === user.username) {
                    setPosts([data.newPost, ...posts]);
                }
            }

        } catch (error) {
            showToast("Error", error.message, "error")
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <Button
                position={"fixed"}
                bottom={10}
                right={5}
                bg={useColorModeValue("gray.300", "gray.dark")}
                onClick={onOpen}
                size={{
                    base: "sm",
                    sm: "md",
                }}
            >
                <AddIcon />
            </Button>

            <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={useColorModeValue("white", "gray.dark")}>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>

                        <FormControl>
                            <Textarea
                                placeholder="Post content goes here..."
                                onChange={handleTextChange}
                                value={postText}
                            />
                            <Text
                                fontSize={"sm"}
                                fontWeight={"bold"}
                                textAlign={"right"}
                                m={"1"}
                            >
                                {remainingChar}/{MAX_CHAR}
                            </Text>

                            <Input
                                type="file"
                                hidden
                                ref={imageRef}
                                onChange={handleImageChange}
                            />

                            {
                                !imgUrl && <Flex gap={4} align={"center"}>
                                    <BsFillImageFill
                                        style={{ marginLeft: "5px", cursor: "pointer" }}
                                        size={36}
                                        onClick={() => imageRef.current.click()}
                                    />
                                    <Text cursor={"pointer"} onClick={() => imageRef.current.click()}>Click here to add photo</Text>
                                </Flex>
                            }

                        </FormControl>

                        {
                            imgUrl && (
                                <Flex mt={5} w={"full"} position={"relative"}>
                                    <Image src={imgUrl} alt="Selected image" />
                                    <CloseButton
                                        onClick={() => {
                                            setImgUrl("")
                                        }}
                                        bg={"gray.800"}
                                        position={"absolute"}
                                        top={2}
                                        right={2}
                                    />
                                </Flex>
                            )
                        }

                    </ModalBody>

                    <ModalFooter>
                        <Button
                            bg={useColorModeValue("gray.300", "gray.700")}
                            _hover={{
                                bg: useColorModeValue("gray.400", "gray.800")
                            }}
                            mr={3}
                            onClick={handleCreatePost}
                            isLoading={updating}
                        >
                            Post
                        </Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>

        </>
    )
}

export default CreatePost