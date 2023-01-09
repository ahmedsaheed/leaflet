import React, { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// export type severity = "success" | "info" | "warning" | "error";

export default function Snackbars(
  show: boolean,
  message: string,
  messageType: string
) {
  const [open, setOpen] = useState(show);
  const handleClick = () => {
    setOpen(true);
  };

  let severity;
  if (messageType === "success") {
    severity = "success";
  } else if (messageType === "info") {
    severity = "info";
  } else if (messageType === "warning") {
    severity = "warning";
  } else if (messageType === "error") {
    severity = "error";
  }

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Snackbar open={show} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
