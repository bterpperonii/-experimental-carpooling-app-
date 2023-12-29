import Autocomplete  from 'react-google-autocomplete';
import LayoutMain from '../../lib/components/layout/LayoutMain';
import DateTimeSelect from '../../lib/components/form/DateTimeSelection/DateTimeSelect';
import { Button } from '@mui/material';
import MuiStyle from '$/lib/styles/MuiStyle.module.css';
import { useEffect, useState } from 'react';
import { env } from 'next.config';
import dayjs, { Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';

export default function NewTravel() {

    /* ------------ States ------------------ */

    // Session recovery
    const { data: sessionData } = useSession();

    // Address of departure and destination from google autocomplete
    let address: {  departure: google.maps.places.PlaceResult | null, destination: google.maps.places.PlaceResult | null } = { departure: null, destination: null };
    let [departure, setDeparture] = useState<string>();
    let [destination, setDestination] = useState<string>();

    // Date of departure and destination
    let [dateDeparture, setDateDeparture] = useState<Dayjs | null>(null);
    let [dateReturn, setDateReturn] = useState<Dayjs | null>(null);
    
    // Time of departure and destination
    let [timeDeparture, setTimeDeparture] = useState<Dayjs | null>(null);
    let [timeReturn, setTimeReturn] = useState<Dayjs | null>(null);

    const apiKey = env.GOOGLE_MAPS_API_KEY as string;

    // Options for autocomplete
    const options = {
        componentRestrictions: { country: 'be' },
        strictBounds: false,
        types: ['address']
        };
    

    /* ------------ Behaviors ------------------ */
    // Merge the date of [departure | return] with the time of [departure | return] to juste keep one field
    useEffect(() => {
        if (dateDeparture && timeDeparture) {
            setDateDeparture(dayjs(dateDeparture).set('hour', timeDeparture.hour()).set('minute', timeDeparture.minute()));
            
        }
        if (dateReturn && timeReturn) {
            setDateReturn(dayjs(dateReturn).set('hour', timeReturn.hour()).set('minute', timeReturn.minute())); 
        }

        /*  Check if the date of return is after the date of departure and if not, 
            Set the date of return to the date of departure + 8 hours (the normal duration of a school day)

                if(dateDeparture && timeDeparture && dateReturn && timeReturn) {
                    if(dateReturn?.isBefore(dateDeparture)) {
                    setDateReturn(dateDeparture.add(8, 'hour'));
                    }
                }
        */   
    }, [dateDeparture, timeDeparture, dateReturn, timeReturn]);
    
    // Handle the click on the submit button of the form new travel
    function handleClick() { 
        if(dateDeparture || dateReturn) {
            console.log(dateDeparture?.format('DD-MM-YYYY HH:mm') + ' --> ' + dateReturn?.format('DD-MM-YYYY HH:mm'));
        }

        // Check if the date of return is after the date of departure
        if(dateDeparture && timeDeparture && dateReturn) {
            if(dateReturn?.isBefore(dateDeparture)) {
                alert('La date de retour doit être après la date de départ'); 
            }
        }
    }



    /* ------------ Render ------------------ */
    if(sessionData) {
    return (
         <>
            <LayoutMain>
                <div className="bg-[var(--purple-g3)]  h-screen">
                    <h1 className="text-6xl text-white mt-6">New Trip</h1>
                    <form className="flex flex-col w-auto m-auto justify-center items-center bg-[var(--purple-g3)]">
                        
                        <h1 className='mt-6 text-3xl text-white'>
                            Ajouter nombre de passager maximum +
                            <p className='mt-6'> Choix d'école pour destination</p>
                        </h1>
                    
                        {/* Departure */}
                        <div className='my-16'>
                            <div className='ml-4 flex flex-col sm:items-center sm:flex-row'>
                                <label htmlFor="departure" className='text-xl md:text-3xl text-white mb-1'>Departure : </label>
                                <Autocomplete
                                    apiKey={apiKey}
                                    options={options}
                                    onPlaceSelected={(place) => {
                                            address.departure = place;
                                            setDeparture(address.departure.formatted_address);
                                        }
                                    }
                                    className="w-[75%] my-2 md:w-[75%]"
                                    id="departure"
                                />
                            </div>
                            <div className='p-4'>
                                <DateTimeSelect 
                                    labelexpTime='Time Departure' 
                                    labelexp="Date Departure"
                                    disableDate={false}
                                    disableTime={false}
                                    handleChangeDate={(date) => {
                                        setDateDeparture(date)    
                                    }}    
                                    handleChangeTime={(time) => {
                                        setTimeDeparture(time)
                                    }}
                                />
                            </div>
                        </div>
                    
                        {/* Destination */}
                        <div>
                            <div className='ml-4 flex flex-col sm:items-center sm:flex-row'>
                                <label htmlFor="destination" className='text-xl md:text-3xl text-white mb-1'>Destination : </label>
                                <Autocomplete
                                    apiKey={apiKey}
                                    options={options}
                                    onPlaceSelected={(place) => {
                                            address.destination = place;
                                            setDestination(address.destination.formatted_address);
                                        }
                                    }
                                    className="w-[75%] my-2 md:w-[75%]"
                                    id="destination"
                                />
                            </div>
                            <div className='p-4'>
                                <DateTimeSelect 
                                    labelexpTime="Time Return "
                                    labelexp="Date Return"
                                    // Disable the date and time of return when the date and time of departure are not selected
                                    disableDate={true}
                                    disableTime={true}
                                    // Enable the date and time of return
                                    {...(dateDeparture && timeDeparture && {disableDate: false})}
                                    {...(dateDeparture && timeDeparture && {disableTime: false})}
                                    handleChangeDate={(date) => {
                                        setDateReturn(date)
                                    }}    
                                    handleChangeTime={(time) => {
                                        setTimeReturn(time)
                                    }}
                                />
                            </div>
                        </div>
                        {/* Submit */}
                        <Button className={MuiStyle.MuiButtonText} onClick={handleClick}> Submit </Button>
                    </form>
                </div>
            </LayoutMain>
        </>
       );
    }
    return (
        <>     
            <LayoutMain>
                <h1>Not Connected, <p>Please Sign in</p></h1> 
            </LayoutMain> 
        </>
    );
}
