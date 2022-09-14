import { TextField } from "@mui/material";

export default function Input(props) {
    const { error = null, sx, ...rest } = props;
    return (
        <TextField
            {...rest}
            sx={{
                marginTop: "8px",
                ...sx,
                "& .MuiOutlinedInput-input": {
                    padding: "8px",
                },
            }}
            {...(error ? { error: true, helperText: error } : {})}
        />
    );
}
