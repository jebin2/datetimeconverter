import timzonesJSON from './timezone.json'
import React, { useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
    Dialog,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
    IconButton,
} from '@mui/material';
import { Search } from '@mui/icons-material';

const color = "white";

const RetroDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        backgroundColor: '#1A535C',
        border: `4px solid ${color}`,
        borderRadius: '10px',
        color: `${color}`,
        height: '100%',
    },
});

const RetroDialogContent = styled(DialogContent)({
    padding: '20px',
});

const RetroList = styled(List)({
    maxHeight: '80%',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
        width: '10px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#1A535C',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#4ECDC4',
        borderRadius: '5px',
    },
});

const RetroListItem = styled(ListItem)({
    '&:hover': {
        backgroundColor: '#4ECDC4',
    },
});

const RetroListItemText = styled(ListItemText)({
    '& .MuiListItemText-primary': {
        fontSize: '1rem',
        fontWeight: 'bold',
    },
});

const RetroButton = styled(Button)({
    backgroundColor: `${color}`,
    color: 'black',
    fontWeight: 'bold',
});

const RetroIconButton = styled(IconButton)({
    color: '#4ECDC4',
});

const CountrySelector = ({ 
    type, 
    fromCountryValue, 
    setFromCountryValue, 
    toCountryValue, 
    setToCountryValue, 
    fromDateTime, 
    setToDateTime, 
    convertDateTime, 
    RetroTextField 
}) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Memoize filtered countries to prevent recomputation on every render
    const filteredCountries = useMemo(() => {
        const searchLower = searchValue.toLowerCase();
        return timzonesJSON.filter(country =>
            country.sys_value.toLowerCase().includes(searchLower) || 
            country.label.toLowerCase().includes(searchLower) || 
            country.offset.toLowerCase().includes(searchLower)
        );
    }, [searchValue]);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setSearchValue('');
    }, []);

    const handleCountrySelect = useCallback((country) => {
        if (type === 'from') {
            setFromCountryValue(country.sys_value);
            setToDateTime(convertDateTime(fromDateTime, country.sys_value, toCountryValue));
        } else {
            setToCountryValue(country.sys_value);
            setToDateTime(convertDateTime(fromDateTime, fromCountryValue, country.sys_value));
        }
        handleClose();
    }, [type, fromCountryValue, toCountryValue, fromDateTime, setFromCountryValue, setToCountryValue, setToDateTime, convertDateTime, handleClose]);

    const handleSearchChange = useCallback((e) => {
        setSearchValue(e.target.value);
    }, []);

    return (
        <div>
            <RetroTextField
                value={type === 'from' ? fromCountryValue : toCountryValue}
                onClick={handleOpen}
                readOnly
                sx={{
                    color: `${color}`,
                    width: "100%",                
                    borderRadius: "2px",
                    fontWeight: "600 !important",
                    letterSpacing: "0.1rem !important",
                }}
                variant="outlined"
                size="small"
            />
            <RetroDialog open={open} onClose={handleClose}>
                <RetroDialogContent>
                    <RetroTextField
                        autoFocus
                        margin="dense"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={searchValue}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <RetroIconButton>
                                    <Search />
                                </RetroIconButton>
                            ),
                        }}
                    />
                    <RetroList>
                        {filteredCountries.map((country) => (
                            <RetroListItem
                                button="true"
                                key={country.id}
                                onClick={() => handleCountrySelect(country)}
                            >
                                <RetroListItemText primary={country.label} />
                            </RetroListItem>
                        ))}
                    </RetroList>
                </RetroDialogContent>
                <DialogActions>
                    <RetroButton onClick={handleClose}>
                        Cancel
                    </RetroButton>
                </DialogActions>
            </RetroDialog>
        </div>
    );
};

export default React.memo(CountrySelector);