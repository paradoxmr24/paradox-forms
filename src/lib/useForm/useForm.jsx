import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useSnack } from "paradox-hooks";
import { encodeData } from "../utilities";

const Handler = createContext(null);

function useForm(fields) {
    const initialValues = useMemo(() => {
        const inputs = {};
        for (const name in fields) {
            inputs[name] = fields[name].value || "";
        }
        return inputs;
    }, [fields]);

    const validators = useMemo(() => {
        const validators = {};
        for (const name in fields) {
            if (fields[name].validator) {
                validators[name] = fields[name].validator;
            }
        }
        return validators;
    }, [fields]);

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

    return useMemo(() => {
        return { values, onChangeHandler, errors, submitValidator, reset };
    }, [values, onChangeHandler, errors, submitValidator, reset]);
}

function Form({ children, onSubmit, fields, enctype, ...rest }) {
    const [loading, setLoading] = useState(false);
    const { snackBar, showMessage } = useSnack();
    const handlers = useForm(fields);
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

export { Form, Submit, Handler };
