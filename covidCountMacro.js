const xapi = require('xapi');

const maxPeople = 1;  //Not to exceed occupancy for this room
const alertTime = 20; //Time in seconds to display alert on screen and touch 10


function alertDisplay() {
  let text2Display = 'For your safety, please reduce the number of people in this room to ' + maxPeople + ' people';
	xapi.command(
	  	'UserInterface Message Alert Display',
	  	{Title : 'COVID-19 ALERT',
	  	Text : (text2Display),
	  	Duration : (alertTime) }
	  )
}

function checkCount(count) {
  if (count > maxPeople) {
    alertDisplay()
    console.log('*** There are too many people in the room. ',count)
  }
}

// Fetch current count and set feedback for change in peoplecount
xapi.status
    .get('RoomAnalytics PeopleCount')
    .then((count) => {
        console.log('Max occupancy for this room is: ' + maxPeople);
        console.log(`Initial people count is: ${count.Current}`);
        checkCount(count.Current);

        // Listen to events
        console.log('Adding feedback listener to: RoomAnalytics PeopleCount');
        xapi.feedback.on('/Status/RoomAnalytics/PeopleCount', (count) => {
            checkCount(count.Current);
            console.log(`Updated count to: ${count.Current}`);
        });

    })
    .catch((err) => {
        console.log(`Failed to fetch PeopleCount, err: ${err.message}`);
        console.log(`Are you interacting with a RoomKit? exiting...`);
        xapi.close();
    });
