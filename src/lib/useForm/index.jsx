import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useSnack } from "paradox-hooks";
import { encodeData } from "../utilities";
import axios from "axios";

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

function Form({
    children,
    onSubmit,
    onError,
    handlers,
    method,
    action,
    enctype,
    retainOnSubmit,
    ...rest
}) {
    const [loading, setLoading] = useState(false);
    const { snackBar, showMessage } = useSnack();
    const submitMiddleware = async e => {
        setLoading(true);
        e.preventDefault();
        if (!handlers.submitValidator()) {
            console.log("Form not validated");
        }
        const values = encodeData(handlers.values, enctype);
        const requestMethod = createAxiosMethod(method);
        try {
            const response = await axios({
                url: action,
                method: requestMethod,
                data: values,
            });
            if (!retainOnSubmit) {
                handlers.reset();
            }
            const message = await onSubmit(response);
            showMessage({ success: message });
        } catch (e) {
            setLoading(false);
            if (e.name === "AxiosError") {
                if (typeof onError === "function") {
                    return onError(e);
                } else {
                    throw e;
                }
            }
            showMessage({ error: e.message });
        }

        setLoading(false);
    };

    return (
        <Handler.Provider value={{ ...handlers, loading, showMessage }}>
            <form onSubmit={submitMiddleware} autoComplete="off" noValidate {...rest}>
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

// ------------- Utilities ------------------- //
function createAxiosMethod(method = "GET") {
    method = method.toLowerCase();
    if (typeof axios[method] === "function") {
        return method;
    } else {
        throw new Error(`Invalid method ${method} not supported`);
    }
}

export { Form, Submit, Handler, useForm };
