import {
    writeFile
} from 'fs/promises';
import fetch from 'node-fetch';
import ics from 'ics';

const apiUri = 'https://api.stuv.app/rapla/lectures/MOS-TINF20A';

const fetchAppointments = async () => {
    console.log(`Fetching appointments from ${apiUri}`);
    const res = await fetch(apiUri);
    const data = await res.json();
    const appointments = data.filter(obj => obj.lecturer != "");
    console.log(`Fetched ${appointments.length} appointments. Writing to file...`);
    return appointments;
}

const stringToDateArray = (dateString) => {
    const date = new Date(dateString);
    return [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes()];
}

const toICS = (appointments) => {
    return appointments.map(appointment => {
        return {
            start: stringToDateArray(appointment.startTime),
            startOutputType: 'local',
            end: stringToDateArray(appointment.endTime),
            endOutputType: 'local',
            title: appointment.name,
            location: appointment.rooms[0],
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
        }
    });
}

const run = async () => {
    try {
        const appointments = await fetchAppointments();
        const events = toICS(appointments);
        ics.createEvents(events, (err, value) => {
            if(err){
                console.error(err);
                return;
            }
            writeFile('appointments.ics', value);
            console.log('Finished!');
        });
    } catch (err) {
        console.error(err);
    } finally {
    }
}

run();