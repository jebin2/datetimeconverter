import timzonesJSON from './timezone.json'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import ReactPWAPrompt from 'react-ios-pwa-prompt';
import githublogo from './images/github-mark-white.png';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CountrySelector from './CountrySelector'

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const color = "white";

const RetroContainer = styled('div')({
    boxSizing: 'border-box',
});

const RetroHeader = styled('h1')({
    color: `${color}`,
    textAlign: 'center',
    fontSize: '2rem',
});

const RetroCard = styled('div')({
    background: '#1A535C',
    border: `4px solid ${color}`,
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    maxWidth: '500px',
    margin: '0 auto',
});

const RetroTextField = styled(TextField)({
    '& .MuiInputBase-root': {
        fontWeight: 'bold',
        color: `${color}`,
        backgroundColor: '#1A535C',
        border: '2px solid #4ECDC4',
        borderRadius: '5px',
        '&:hover, &.Mui-focused': {
            border: `2px solid ${color}`,
            boxShadow: '0 0 10px rgba(255,230,109,0.5)',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
});

// Create a custom styled component for the TextField inside MobileDateTimePicker
const CustomMobileDateTimePicker = styled(MobileDateTimePicker)({
    '& .MuiInputBase-root': {
        fontWeight: 'bold',
        color: `${color}`,
        backgroundColor: '#1A535C',
        border: '2px solid #4ECDC4',
        borderRadius: '5px',
        marginTop: '10px',
        '&:hover, &.Mui-focused': {
            border: `2px solid ${color}`,
            boxShadow: '0 0 10px rgba(255,230,109,0.5)',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
});

const RetroTimeRate = styled('div')({
    color: `${color}`,
    textAlign: 'center',
    fontSize: '1rem',
    marginBottom: '20px',
});

const RetroUpdateInfo = styled('div')({
    color: `${color}`,
    textAlign: 'center',
    fontSize: '1rem',
    marginTop: '20px',
});

const RetroFooter = styled('div')({
    color: `${color}`,
    textAlign: 'center',
    marginTop: '20px',
    '& img': {
        width: '30px',
        height: '30px',
    },
});

const RetroPWA = styled('div')({
    letterSpacing: 'normal',
});

function App() {
    const [localTime, setLocalTime] = useState(dayjs().format('DD MMM YYYY HH:mm:ss'));
    const [timeDifference, setTimeDifference] = useState("");
    const [loading, setLoading] = useState(true);

    // Country selection
    const [fromCountryValue, setFromCountryValue] = useState("Asia/Calcutta");
    const [toCountryValue, setToCountryValue] = useState("America/Los_Angeles");

    // Date states
    const [fromDateTime, setFromDateTime] = useState(dayjs());
    const [toDateTime, setToDateTime] = useState(dayjs());

    // Memoize timezone offset lookup functions
    const getTimezoneOffsetFromCountry = useCallback((countryName) => {
        const country = timzonesJSON.find(x => x.sys_value === countryName);
        return country ? country.offset : "+00:00";
    }, []);

    // Convert timezone offset string to minutes (memoized)
    const convertOffsetToMinutes = useCallback((offset) => {
        if (!offset) return 0;
        const sign = offset.charAt(0);
        const parts = offset.substring(1).split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const totalMinutes = hours * 60 + minutes;

        return sign === '-' ? -totalMinutes : totalMinutes;
    }, []);

    // Memoize timezone offsets
    const fromOffset = useMemo(() => 
        getTimezoneOffsetFromCountry(fromCountryValue), 
        [fromCountryValue, getTimezoneOffsetFromCountry]
    );
    
    const toOffset = useMemo(() => 
        getTimezoneOffsetFromCountry(toCountryValue), 
        [toCountryValue, getTimezoneOffsetFromCountry]
    );

    // Calculate time difference (memoized)
    const calculateTimeDifference = useCallback(() => {
        try {
            const offsetFrom = convertOffsetToMinutes(fromOffset);
            const offsetTo = convertOffsetToMinutes(toOffset);
            const diffMinutes = offsetTo - offsetFrom;
            const hours = Math.floor(Math.abs(diffMinutes) / 60);
            const minutes = Math.abs(diffMinutes) % 60;

            const sign = diffMinutes >= 0 ? '+' : '-';
            const formattedDiff = `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;

            setTimeDifference(`Time difference: ${formattedDiff} hours`);
        } catch (err) {
            console.error("Error calculating time difference:", err);
            setTimeDifference("Could not calculate time difference");
        }
    }, [fromOffset, toOffset, convertOffsetToMinutes]);

    // Convert date between timezones (memoized)
    const convertDateTime = useCallback((date, fromTimezone, toTimezone) => {
        try {
            const fromOffsetVal = getTimezoneOffsetFromCountry(fromTimezone);
            const toOffsetVal = getTimezoneOffsetFromCountry(toTimezone);
            const fromMinutes = convertOffsetToMinutes(fromOffsetVal);
            const toMinutes = convertOffsetToMinutes(toOffsetVal);
            
            // Convert the date to UTC by removing the local timezone offset
            const utcDate = date.add(-fromMinutes, 'minute');
            
            // Apply the difference to get the time in the "to" timezone
            return utcDate.add(toMinutes, 'minute');
        } catch (err) {
            console.error("Error converting date:", err);
            return dayjs();
        }
    }, [getTimezoneOffsetFromCountry, convertOffsetToMinutes]);

    // Handle date changes in the FROM picker
    const handleFromDateChange = useCallback((newDate) => {
        setFromDateTime(newDate);
        const convertedDate = convertDateTime(newDate, fromCountryValue, toCountryValue);
            setToDateTime(convertedDate);
    }, [fromCountryValue, toCountryValue, convertDateTime]);

    // Handle date changes in the TO picker
    const handleToDateChange = useCallback((newDate) => {
        setToDateTime(newDate);
        const convertedDate = convertDateTime(newDate, toCountryValue, fromCountryValue);
            setFromDateTime(convertedDate);
    }, [fromCountryValue, toCountryValue, convertDateTime]);

    // Initialize data
    useEffect(() => {
        const currentDayjs = dayjs();
        const currentOffset = currentDayjs.format("Z");
        
        // Find current timezone from offset
        const currentTimezone = timzonesJSON.find(x => x.offset === currentOffset);
        if (currentTimezone) {
            setFromCountryValue(currentTimezone.sys_value);
        }
        
        setFromDateTime(currentDayjs);
        setLoading(false);
    }, []);

    // Update to datetime whenever needed values change
    useEffect(() => {
        if (!loading && fromDateTime) {
            const initialToDateTime = convertDateTime(fromDateTime, fromCountryValue, toCountryValue);
            setToDateTime(initialToDateTime);
        }
    }, [loading, fromCountryValue, toCountryValue, fromDateTime, convertDateTime]);

    // Calculate time difference when offsets change
    useEffect(() => {
        if (!loading) {
            calculateTimeDifference();
        }
    }, [loading, calculateTimeDifference]);

    // Update local time display
    useEffect(() => {
        const interval = setInterval(() => {
            setLocalTime(dayjs().format('DD MMM YYYY HH:mm:ss'));
        }, 1000); // Update every second
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RetroContainer>
                <RetroHeader>DateTime Converter</RetroHeader>
                {loading ? (
                    <div id="loading" className="loading">{"Loading..."}</div>
                ) : (
                    <>
                        <RetroTimeRate>{timeDifference}</RetroTimeRate>
                        <RetroCard>
                            {['from', 'to'].map((type) => (
                                <div key={type} style={type === "to" ? {} : { marginBottom: '20px' }}>
                                    <CountrySelector
                                        type={type}
                                        fromCountryValue={fromCountryValue}
                                        setFromCountryValue={setFromCountryValue}
                                        toCountryValue={toCountryValue}
                                        setToCountryValue={setToCountryValue}
                                        fromDateTime={fromDateTime}
                                        setToDateTime={setToDateTime}
                                        convertDateTime={convertDateTime}
                                        RetroTextField={RetroTextField}
                                    />
                                    <CustomMobileDateTimePicker
                                        value={type === 'from' ? fromDateTime : toDateTime}
                                        onChange={(newDate) => {
                                            if (type === 'from') {
                                                handleFromDateChange(newDate);
                                            } else {
                                                handleToDateChange(newDate);
                                            }
                                        }}
                                        variant="outlined"
                                        fullWidth
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: "outlined"
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </RetroCard>
                        <RetroUpdateInfo>
                            Local time: {localTime}
                        </RetroUpdateInfo>
                    </>
                )}
                <RetroFooter>
                    <a href="https://github.com/jebin2" target="_blank" rel="noopener noreferrer">
                        <img src={githublogo} alt="GitHub logo" />
                    </a>
                </RetroFooter>
                <RetroPWA>
                    <ReactPWAPrompt
                        timesToShow={5}
                        promptOnVisit={1}
                        appIconPath="/datetime/favicon.ico"
                    />
                </RetroPWA>
            </RetroContainer>
        </LocalizationProvider>
    );
}

export default App;