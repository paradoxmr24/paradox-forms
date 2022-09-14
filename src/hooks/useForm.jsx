import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import useSnack from "./useSnack";

const Handler = createContext(null);

function useForm(initialValues, validators = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const validate = useCallback(
        (name, value) => {
            const validator = validators[name];
            if (typeof validator === "function") {
                const helperText = validators[name](value);
                setErrors(prev => ({
                    ...prev,
                    [name]: helperText,
                }));
                return !helperText;
            } else if (typeof validator === "string") {
                const helperText = validator;
                setErrors(prev => ({
                    ...prev,
                    [name]: value ? "" : helperText,
                }));
                return value;
            }
            return true;
        },
        [validators]
    );

    const onChangeHandler = useCallback(
        e => {
            const { name, value } = e.target;
            validate(name, value);
            setValues(prev => ({
                ...prev,
                [name]: value,
            }));
        },
        [validate]
    );

    const reset = useCallback(() => {
        setValues(initialValues);
    }, [initialValues]);

    const submitValidator = useCallback(() => {
        for (const name in values) {
            if (!validate(name, values[name])) {
                return false;
            }
        }
        return true;
    }, [values, validate]);

    const handlers = useMemo(() => {
        return { values, onChangeHandler, errors, submitValidator, reset };
    }, [values, onChangeHandler, errors, submitValidator, reset]);

    return handlers;
}

function convertToFormData(values) {
    const formData = new FormData();
    for (const name in values) {
        const value = values[name];
        if (Array.isArray(value)) {
            value.forEach(value => formData.append(name, value));
        } else {
            console.log("setting", name, value);
            formData.set(name, value);
        }
    }
    return formData;
}

function encodeData(values, enctype) {
    switch (enctype) {
        case "multipart/form-data":
            return convertToFormData(values);
        default:
            return values;
    }
}

function Form({ children, onSubmit, handlers, enctype, ...rest }) {
    const [loading, setLoading] = useState(false);
    const { snackBar, showMessage } = useSnack();
    const submitHandler = async e => {
        setLoading(true);
        e.preventDefault();
        if (handlers.submitValidator()) {
            try {
                const values = encodeData(handlers.values, enctype);
                const message = await onSubmit(values);
                showMessage({ success: message });
            } catch (e) {
                showMessage({ error: e.message });
            }
        } else {
            console.log("Form is not validated");
        }
        setLoading(false);
    };

    return (
        <Handler.Provider value={{ ...handlers, loading, showMessage }}>
            <form onSubmit={submitHandler} autoComplete="off" noValidate {...rest}>
                {children}
            </form>
            {snackBar}
        </Handler.Provider>
    );
}

function Submit(props) {
    const { loading } = useContext(Handler);
    const { loader, loaderProps } = props;
    const defaultLoader = (
        <CircularProgress
            size="20px"
            style={{
                marginLeft: "8px",
            }}
            {...loaderProps}
        />
    );
    return props.children(loading ? loader || defaultLoader : null);
}

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

const validators = {
    email: email =>
        /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/.test(email) ? "" : "Email is not valid",
    phone: phone => (/\d{10}/.test(phone) ? "" : "Phone number must be 10 digits long"),
};

export { Form, useForm, Input, Submit, validators };
