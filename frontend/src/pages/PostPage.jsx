import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text } from "@chakra-ui/react"
import Actions from "../components/Actions"
import useGetUserProfile from "../hooks/userGetUserProfile";
import { useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns"
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import Comment from "../components/Comment";
import postsAtom from "../atoms/postAtoms";

const PostPage = () => {

  const { loading, user } = useGetUserProfile();
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const { pid } = useParams();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();
  const currentPost = posts[0];

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json()

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        
        setPosts([data]);

      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };

    getPost();
  }, [showToast, pid, setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      if (data.message) {
        showToast("Success", data.message, "success");
        navigate(`/${currentUser.username}`)
      }

    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    )
  }
  if (!user && !loading) {
    return (
      <Flex h={"50vh"} justify={"center"} align={"center"}>
        <h1>User not found</h1>
      </Flex>
    )
  }

  if (!currentPost) return null;

  return (
    <>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user?.profilePic} name={user?.name} size={"md"} />

          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>{user?.username}</Text>

            <Image src="/verified.png" h={4} w={4} ml={4} />

          </Flex>

        </Flex>

        <Flex gap={4} alignItems={"center"}>
          <Text fontSize={"xs"} w={36} textAlign={"right"} color={"gray.light"}>
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>

          {
            currentUser?._id === user?._id && (
              <DeleteIcon cursor={"pointer"} size={20} onClick={handleDeletePost} />
            )
          }

        </Flex>


      </Flex>

      <Text my={3}>{currentPost?.text}</Text>

      {
        currentPost.img && (
          <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
            <Image src={currentPost?.img} w={"full"} />
          </Box>
        )
      }

      <Flex gap={3} my={3}>
        <Actions post={currentPost} author={user} />
      </Flex>

      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post</Text>

        </Flex>

        <Button>Get</Button>

      </Flex>

      <Divider my={4} />

      {
        currentPost.replies.map(reply => (
          <Comment
            key={reply._id}
            reply={reply}
            lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
          />
        ))
      }


    </>
  )
}

export default PostPage