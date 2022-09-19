import { Box } from "@mui/system";
import React, { useMemo } from "react";
import { Form, Submit, useForm } from "../lib";
import validators from "../lib/validators";
import { Input } from "../lib/inputs";
import { Card, Divider, Typography, Button } from "@mui/material";
import axios from "axios";

const UseFormImplementation = () => {
    const handlers = useForm(
        useMemo(
            () => ({
                name: { value: "" },
                email: { value: "" },
                phone: { value: "" },
            }),
            []
        )
    );

    const handlers2 = useForm(
        useMemo(
            () => ({
                name: { value: "", validator: "name is required" },
                email: { value: "", validator: validators.email },
                phone: { value: "", validator: validators.phone },
            }),
            []
        )
    );

    const submit = async response => {
        if (response.data.success) {
            return "Success response";
        } else {
            throw new Error("Some Error Occured");
        }
    };

    const errorHandler = function (err) {
        console.log(err);
    };

    return (
        <>
            <Box p="40px" sx={{ background: "#e3e3e3" }}>
                <Card sx={{ p: "24px", width: "500px", mx: "auto" }}>
                    <Typography variant="h5">Use Form</Typography>
                    <Divider />
                    <Form
                        onSubmit={submit}
                        action="http://localhost:8000/verify"
                        method="GET"
                        handlers={handlers}
                        onError={errorHandler}
                        retainOnSubmit>
                        <Input variant="outlined" fullWidth name="name" placeholder="Name" />
                        <Input variant="outlined" fullWidth name="email" placeholder="Email" />
                        <Input variant="outlined" fullWidth name="phone" placeholder="Phone" />
                        <Submit loaderProps={{ sx: { color: "white" } }}>
                            {loader => (
                                <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
                                    Submit {loader}
                                </Button>
                            )}
                        </Submit>
                    </Form>
                </Card>
            </Box>
            <Box p="40px" sx={{ background: "#e3e3e3" }}>
                <Card sx={{ p: "24px", width: "500px", mx: "auto" }}>
                    <Typography variant="h5">Use Form 2</Typography>
                    <Divider />
                    <Form onSubmit={submit} handlers={handlers2} retainOnSubmit>
                        <Input variant="outlined" fullWidth name="name" placeholder="Name" />
                        <Input variant="outlined" fullWidth name="email" placeholder="Email" />
                        <Input variant="outlined" fullWidth name="phone" placeholder="Phone" />
                        <Submit loaderProps={{ sx: { color: "inherit" } }}>
                            {loader => (
                                <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
                                    Submit {loader}
                                </Button>
                            )}
                        </Submit>
                    </Form>
                </Card>
            </Box>
        </>
    );
};

export default UseFormImplementation;
