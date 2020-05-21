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



function cleanTouch10() {
  let text2Display = 'For your safety, please disenfect the Touch 10 tablet before using.';
  xapi.command(
    	'UserInterface Message Alert Display',
	  	{Title : 'COVID-19 ALERT',
	  	Text : (text2Display),
	  	Duration : (alertTime) }
    )
}

function checkState(startUp) {
  if (startUp == 'Off') {
    cleanTouch10()
    console.log('*** Console halfwake on - clean Touch 10. ')
  }
}

// Put an alert on Touch10 when people walk in room to have them clean the screen.
console.log('Adding listener to: Standby State');
// Listen for people first entering room and waking system
xapi.feedback.on('/Status/Standby/State', (startUp) => {
    console.log('System Halfwake status changing to ',(startUp));
    checkState(startUp);
});
// Check initial peoplecount and request feedback on any change in peoplecount
xapi.status
    .get('RoomAnalytics PeopleCount')
    .then((count) => {
        console.log('Max occupancy for this room is: ' + maxPeople);
        console.log(`Initial people count is: ${count.Current}`);
        checkCount(count.Current);

        // Listen to events
        console.log('Adding listener to: RoomAnalytics PeopleCount');
        xapi.feedback.on('/Status/RoomAnalytics/PeopleCount', (count) => {
            checkCount(count.Current);
            console.log(`Current PeopleCount: ${count.Current}`);
        });

    })
    .catch((err) => {
        console.log(`Failed to fetch PeopleCount, err: ${err.message}`);
        console.log(`Are you interacting with a RoomKit? exiting...`);
        xapi.close();
    });
