import { Box } from "@mui/system";
import React, { useMemo } from "react";
import { Form, Submit, useForm } from "../lib";
import validators from "../lib/validators";
import { Input } from "../lib/inputs";
import { Card, Divider, Typography, Button } from "@mui/material";

const UseFormImplementation = () => {
    const handlers = useForm(
        useMemo(
            () => ({
                name: {
                    value: "",
                    validators: [
                        "name is required",
                        value => (value.length > 13 ? "Cannot exceed 13 characters" : ""),
                    ],
                    final: value => value + " is my name",
                },
                email: { value: "", validator: validators.email },
                phone: { value: "", validators: validators.phone },
                dob: { value: new Date() },
            }),
            []
        )
    );

    // const handlers2 = useForm(
    //     useMemo(
    //         () => ({
    //             name: { value: "", validator: "name is required" },
    //             email: { value: "", validator: validators.email },
    //             phone: { value: "", validator: validators.phone },
    //         }),
    //         []
    //     )
    // );

    const submit = async (response, values) => {
        console.log(values);
        if (response.data.success) {
            return "Success response";
        } else {
            throw new Error("Some Error Occured");
        }
    };

    const errorHandler = function (err) {
        console.log(err);
    };

    const fillData = function () {
        handlers.setValues(values => ({
            name: "Brendan Eich " + values.name,
            email: "eich@gmail",
        }));
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
                        method="POST"
                        handlers={handlers}
                        onError={errorHandler}
                        final={values => ({ data: values })}
                        retainOnSubmit>
                        <Input variant="outlined" fullWidth name="name" placeholder="Name" />
                        <Input variant="outlined" fullWidth name="email" placeholder="Email" />
                        <Input variant="outlined" fullWidth name="phone" placeholder="Phone" />
                        <Input variant="outlined" type="date" fullWidth name="dob" />
                        <Submit loaderProps={{ sx: { color: "white" } }}>
                            {loader => (
                                <Button
                                    variant="contained"
                                    type="submit"
                                    fullWidth
                                    sx={{ mt: 3 }}
                                    disabled={Boolean(loader)}>
                                    Submit {loader}
                                </Button>
                            )}
                        </Submit>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3 }}
                            color="secondary"
                            onClick={handlers.reset}>
                            Reset
                        </Button>
                        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={fillData}>
                            Fill Data
                        </Button>
                    </Form>
                </Card>
            </Box>
            <Box p="40px" sx={{ background: "#e3e3e3" }}>
                <Card sx={{ p: "24px", width: "500px", mx: "auto" }}>
                    <Typography variant="h5">Use Form 2</Typography>
                    <Divider />
                    {/* <Form onSubmit={submit} handlers={handlers2} retainOnSubmit>
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
                    </Form> */}
                </Card>
            </Box>
        </>
    );
};

export default UseFormImplementation;
