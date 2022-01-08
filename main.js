import {
    writeFile
} from 'fs/promises';
import fetch from 'node-fetch';
import ics from 'ics';
import {
    Command
} from 'commander/esm.mjs';
import path from 'path';

const apiUri = 'https://api.stuv.app/rapla/lectures/';

const fetchAppointments = async (course) => {
    const url = apiUri + course;
    console.log(`Fetching appointments from ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    const appointments = data.filter(obj => obj.lecturer != "");
    return appointments;
}

const stringToDateArray = (dateString) => {
    const date = new Date(dateString);
    return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
}

const toICS = (appointments) => {
    console.log(`Converting ${appointments.length} appointments...`);
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
        const program = new Command();
        program
            .option('-o, --output <type>', 'specify output path', './')
            .option('-n, --name <type>', 'specify output file name', 'appointments.ics')
            .option('-c, --course <type>', 'specify course', 'MOS-TINF20A')

        program.parse(process.argv);
        const options = program.opts();
        const appointments = await fetchAppointments(options.course);
        const events = toICS(appointments);
        ics.createEvents(events, (err, value) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Success. Writing to file...`);
            const file = path.join(options.output, options.name);
            console.log(`${file} used as output`);
            writeFile(file, value);
            console.log(`Finished!`);
        });
    } catch (err) {
        console.error(err);
    }
}

run();