import React from "react";
import { TextField } from "@mui/material";
import { useContext } from "react";
import { Handler } from "../useForm/useForm";

function Input(props) {
    const { sx, name, ...rest } = props;
    const { values, errors, onChangeHandler, loading } = useContext(Handler);
    return (
        <TextField
            value={values[name]}
            name={name}
            onChange={onChangeHandler}
            disabled={loading}
            {...rest}
            sx={{
                marginTop: "8px",
                ...sx,
                "& .MuiOutlinedInput-input": {
                    padding: "8px",
                },
            }}
            {...(errors[name] ? { error: true, helperText: errors[name] } : {})}
        />
    );
}

export default Input;
