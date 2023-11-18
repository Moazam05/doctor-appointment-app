import React from "react";
import Navbar from "../../components/Navbar";
import { Heading } from "../../components/Heading";
import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import { MdMarkChatUnread } from "react-icons/md";
import { MdMarkChatRead } from "react-icons/md";
import useTypedSelector from "../../hooks/useTypedSelector";
import { selectedUserNotifications, setUser } from "../../redux/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useSeenNotificationsMutation } from "../../redux/api/notificationApiSlice";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
import { useDispatch } from "react-redux";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ padding: "24px 0" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userNotifications = useTypedSelector(selectedUserNotifications);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [toast, setToast] = React.useState({
    message: "",
    appearence: false,
    type: "",
  });

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const [seenNotification, { isLoading }] = useSeenNotificationsMutation();

  const readNotificationHandler = async () => {
    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData!);

      const response: any = await seenNotification({});
      if (response.status) {
        setToast({
          ...toast,
          message: "Marked all as read",
          appearence: true,
          type: "success",
        });
        const updatedUser = {
          ...user.data,
          seenNotifications: [],
          unseenNotifications: [],
        };
        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      if (response?.error) {
        setToast({
          ...toast,
          message: user?.error?.data?.message,
          appearence: true,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Notifications Seen Error:", error);
      setToast({
        ...toast,
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  return (
    <>
      <Navbar>
        <Heading>Notifications</Heading>
        <Box
          sx={{
            margin: "20px 0",
            background: "#fff",
            borderRadius: "6px",
            padding: "10px 20px",
            boxShadow: "rgba(0, 0, 0, 0.16) 3px 16px 87px 0px",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab
                  label="Unread"
                  sx={{ textTransform: "capitalize", fontSize: "16px" }}
                  {...a11yProps(0)}
                  icon={<MdMarkChatUnread />}
                  iconPosition="start"
                />
                <Tab
                  label="Read"
                  sx={{ textTransform: "capitalize", fontSize: "16px" }}
                  {...a11yProps(1)}
                  icon={<MdMarkChatRead />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button onClick={readNotificationHandler} disabled={isLoading}>
                  Mark all as read
                </Button>
              </Box>

              {userNotifications?.map((notification: any) => {
                return (
                  <>
                    <Box
                      sx={{
                        border: "1px solid #E5EAF2",
                        padding: "14px 24px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        cursor: "pointer",
                      }}
                      key={notification.data.doctorId}
                      onClick={() => {
                        navigate(notification.onClickPath);
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 2, marginBottom: "5px" }}
                      >
                        <Box sx={{ minWidth: "100px" }}>Name:</Box>
                        <Box>{notification.data.name}</Box>
                      </Box>
                      <Box
                        sx={{ display: "flex", gap: 2, marginBottom: "5px" }}
                      >
                        <Box sx={{ minWidth: "100px" }}>Title:</Box>
                        <Box>
                          {notification.type === "new-doctor-request"
                            ? "New Doctor Request"
                            : ""}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ minWidth: "100px" }}>Message:</Box>
                        <Box>{notification.message}</Box>
                      </Box>
                    </Box>
                  </>
                );
              })}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button color="error">Delete All</Button>
              </Box>
            </CustomTabPanel>
          </Box>
        </Box>
      </Navbar>
      <ToastAlert
        appearence={toast.appearence}
        type={toast.type}
        message={toast.message}
        handleClose={handleCloseToast}
      />
    </>
  );
};

export default Notifications;