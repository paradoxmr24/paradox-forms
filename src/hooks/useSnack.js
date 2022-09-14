import { Alert, Snackbar } from "@mui/material";
import React, { useReducer } from "react";

const snackReducer = function (state, action) {
    if (!action) return { success: "Closed", show: false };
    const severity = Object.keys(action)[0];
    const message = Object.values(action)[0];
    return { show: true, severity, message };
};

export default function useSnack() {
    const [snack, showMessage] = useReducer(snackReducer, snackReducer(null));
    return {
        snackBar: (
            <Snackbar open={snack.show} autoHideDuration={3000} onClose={() => showMessage(null)}>
                <Alert color={snack.severity} severity={snack.severity}>
                    {snack.message}
                </Alert>
            </Snackbar>
        ),
        showMessage,
    };
}

// Usage
// const {snackBar, showMessage} = useSnack();
// <></>{snackBar} // applying snackBar in DOM
// Call showMessage to show the snack
// showMessage({error : "message"}) // calling showMessage with error message
// showMessage({success : "success"}) // calling showMessage with success message
