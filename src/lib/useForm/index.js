import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
    useState,
} from "react";
import { CircularProgress } from "@mui/material";
import { useSnack } from "paradox-hooks";
import { encodeData } from "../utilities";
import axios from "axios";

const Handler = createContext(null);

const validatorsDispatch = function (validators, newValidator) {
    const updatedValidators = [...(validators[newValidator.name] || []), ...newValidator.validator];
    return { ...validators, [newValidator.name]: updatedValidators };
};

const initializeValidators = fields => {
    console.log("initializeValidators");
    const validators = {};
    for (const name in fields) {
        const field = fields[name];
        validators[name] = [];
        const rules = field.validator;
        if (rules) {
            if (Array.isArray(rules)) {
                validators[name].push(...rules);
            } else {
                validators[name].push(rules);
            }
        }

        const maxLength = field.maxLength;
        if (maxLength) {
            validators[name].unshift(value =>
                value.length <= maxLength ? "" : `Maximum ${maxLength} characters are allowed`
            );
        }

        const minLength = field.minLength;
        if (minLength) {
            validators[name].unshift(value =>
                value.length >= minLength ? "" : `Must contain at least ${minLength} characters`
            );
        }

        const required = field.required;
        if (required) {
            validators[name].unshift(value => (value ? "" : "This field is required"));
        }
    }
    return validators;
};

function useForm(fields) {
    const initialValues = useMemo(() => {
        const inputs = {};
        for (const name in fields) {
            inputs[name] = fields[name].value || "";
        }
        return inputs;
    }, [fields]);

    const [validators, addValidator] = useReducer(validatorsDispatch, fields, initializeValidators);

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

    // validate a single field
    const validate = useCallback(
        (name, value) => {
            const rules = validators[name];
            // if the validator doesn't contain any rules
            if (rules.length === 0) return true;

            return rules.every(rule => {
                if (typeof rule === "function") {
                    const helperText = rule(value);
                    setErrors(validators => ({
                        ...validators,
                        [name]: helperText,
                    }));
                    return !helperText;
                } else {
                    throw new Error("Invalid rule: Must be a function");
                }
            });
        },
        [validators]
    );

    // onchange handler to fields
    const onChangeHandler = useCallback(
        e => {
            const { name, value } = e.target;
            // validate the field to show error message
            validate(name, value);
            setValues(validators => ({
                ...validators,
                [name]: value,
            }));
        },
        [validate]
    );

    // set all values and errors to empty
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    // to set values manually
    const setManually = useCallback(
        values => {
            setValues(validators => {
                const newValues = typeof values === "function" ? values(validators) : values;
                return { ...validators, ...newValues };
            });
            setErrors({});
        },
        [setValues]
    );

    // Checks if all the fields are validated before submitting
    const submitValidator = useCallback(() => {
        for (const name in values) {
            if (!validate(name, values[name])) {
                return false;
            }
        }
        return true;
    }, [values, validate]);

    return useMemo(
        () => ({
            values,
            onChangeHandler,
            errors,
            submitValidator,
            reset,
            setValues: setManually,
            finals,
            addValidator,
        }),
        [values, onChangeHandler, errors, submitValidator, reset, setManually, finals, addValidator]
    );
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
