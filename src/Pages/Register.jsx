import { Box } from "@mui/system";
import React, { useMemo } from "react";
import { Form, useForm, Input, Submit, validators } from "../hooks/useForm";
import { Button, Card, Divider, Typography } from "@mui/material";
import axios from "axios";

const Register = () => {
    const initialValues = useMemo(
        () => ({
            name: "",
            email: "",
            phone: "",
        }),
        []
    );

    const formHandlers = useForm(
        initialValues,
        useMemo(
            () => ({
                name: "name is required",
                email: validators.email,
                phone: validators.phone,
            }),
            []
        )
    );

    const reset = () => {
        formHandlers.reset();
    };

    const submit = async values => {
        const response = await axios.get(
            "https://images.unsplash.com/photo-1541411438265-4cb4687110f2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aGQlMjBwaG90b3N8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
        );
        if (response.success) {
            return "Response succes";
        } else {
            throw new Error("Cannot get at the moment");
        }
    };

    return (
        <Box p="40px" sx={{ background: "#e3e3e3", height: "100vh" }}>
            <Card sx={{ p: "24px", width: "500px", mx: "auto" }}>
                <Typography variant="h5">Use Form</Typography>
                <Divider />
                <Form onSubmit={submit} handlers={formHandlers} enctype="multipart/form-data">
                    <Input variant="outlined" fullWidth name="name" placeholder="Name" />
                    <Input variant="outlined" fullWidth name="email" placeholder="Email" />
                    <Input variant="outlined" fullWidth name="phone" placeholder="PHone" />
                    <Submit loaderProps={{ sx: { color: "white" } }}>
                        {loader => (
                            <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
                                Submit {loader}
                            </Button>
                        )}
                    </Submit>
                    <Button variant="contained" onClick={reset} fullWidth sx={{ mt: 3 }}>
                        Reset
                    </Button>
                </Form>
            </Card>
        </Box>
    );
};

export default Register;
