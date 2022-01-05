import { open } from 'fs/promises';
import fetch from 'node-fetch';

const apiUri = 'https://api.stuv.app/rapla/lectures/MOS-TINF20A';

(async () => {
    let filehandle;
    let stream;
    try {
        filehandle = await open('appointments.csv', 'w+');
        stream = filehandle.createWriteStream();
        stream.write("Title;Room;Start;End\n");
        console.log(`Fetching appointments from ${apiUri}`);
        const res = await fetch(apiUri);
        const data = await res.json();
        const appointments = data.filter(obj => obj.lecturer != "");
        console.log(`Fetched ${appointments.length} appointments. Writing to file...`);
        appointments.forEach(appointment => {
            // const options = { weekday: 'narrow', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
            const startDate = new Date(appointment.startTime).toLocaleString();
            const endDate = new Date(appointment.endTime).toLocaleString();
            stream.write(`${appointment.name};${appointment.rooms[0]};${startDate};${endDate}\n`);
        });
        console.log('Finished!');
    } catch (err) {
        // handle error
        console.error(err);
    } finally {
        await stream?.close();
        await filehandle?.close();
    }
})();