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

    const finals = useMemo(() => {
        const finals = {};
        for (const name in fields) {
            if (fields[name].final) {
                finals[name] = fields[name].final;
            }
        }
        return finals;
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
        setErrors({});
    }, [initialValues]);

    const setManually = useCallback(
        values => {
            setValues(prev => {
                const newValues = typeof values === "function" ? values(prev) : values;
                return { ...prev, ...newValues };
            });
            setErrors({});
        },
        [setValues]
    );

    const submitValidator = useCallback(() => {
        for (const name in values) {
            if (!validate(name, values[name])) {
                return false;
            }
        }
        return true;
    }, [values, validate]);

    return useMemo(() => {
        return {
            values,
            onChangeHandler,
            errors,
            submitValidator,
            reset,
            setValues: setManually,
            finals,
        };
    }, [values, onChangeHandler, errors, submitValidator, reset, setManually, finals]);
}

function Form({
    children,
    onSubmit,
    onError,
    handlers,
    method,
    action,
    enctype,
    final,
    retainOnSubmit,
    ...rest
}) {
    const [loading, setLoading] = useState(false);
    const { snackBar, showMessage } = useSnack();
    const submitMiddleware = async e => {
        e.preventDefault();
        if (!handlers.submitValidator()) {
            // Validating before submitting
            return console.log("Form not validated");
        }
        setLoading(true);

        // Tuning values with the functions passed in final field given in the fields
        const tunedValues = tuneValues(handlers);

        // Finalyzing values with the functions passed in final prop
        const finalValues = finalize(tunedValues, final);

        // Applying encoding on the data before submitting
        const values = encodeData(finalValues, enctype);

        // Getting axios method to use based on the method prop
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
            const message = await onSubmit(response, handlers.values);
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
    const handlers = useContext(Handler);
    if (!handlers) {
        throw new Error(
            "You are using Submit without a Form Component (you may be importing Form Component from wrong path"
        );
    }
    const { loading } = handlers;
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

function tuneValues(handlers) {
    const values = { ...handlers.values };
    for (const field in handlers.finals) {
        values[field] = handlers.finals[field](handlers.values[field]);
    }
    return values;
}

function finalize(tunedValues, finalizer) {
    if (typeof finalizer === "function") {
        return finalizer(tunedValues);
    }
    return tunedValues;
}

export { Form, Submit, Handler, useForm };
