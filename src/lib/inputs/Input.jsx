import React from "react";
import { TextField } from "@mui/material";
import { useContext } from "react";
import { Handler } from "../useForm/";

function Input(props) {
    const { sx, name, ...rest } = props;
    const { values, errors, setValues, onChangeHandler, loading } = useContext(Handler);

    let value = values[name];
    let changeHandler = onChangeHandler;
    if (values[name] instanceof Date) {
        const date = values[name];
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");

        value = `${year}-${month}-${day}`;

        changeHandler = e => {
            setValues({
                [name]: new Date(e.target.value),
            });
        };
    }

    return (
        <TextField
            value={value}
            name={name}
            onChange={changeHandler}
            disabled={loading}
            sx={{
                marginTop: "8px",
                "& .MuiOutlinedInput-input": {
                    padding: "8px",
                },
                ...sx,
            }}
            {...(errors[name] ? { error: true, helperText: errors[name] } : {})}
            {...rest}
        />
    );
}

export default Input;
