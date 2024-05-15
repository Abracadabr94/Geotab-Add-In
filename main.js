document.addEventListener("DOMContentLoaded", function() {
    const vehiclesDropdown = document.getElementById('ioxoutput-vehicles');
    const stateDropdown = document.getElementById('ioxoutput-state');
    const sendButton = document.getElementById('ioxoutput-send');
    const errorDiv = document.getElementById('ioxoutput-error');

    // Fetch vehicles from GitHub Pages
    fetch('https://your-username.github.io/your-repo/vehicles.json')
        .then(response => response.json())
        .then(data => {
            data.vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = vehicle.name;
                vehiclesDropdown.appendChild(option);
            });
            vehiclesDropdown.disabled = false;
            sendButton.disabled = false;
        })
        .catch(error => {
            errorDiv.textContent = 'Error fetching vehicle data';
            console.error('Error fetching vehicle data:', error);
        });

    sendButton.addEventListener('click', function() {
        const selectedVehicle = vehiclesDropdown.value;
        const selectedState = stateDropdown.value;

        if (selectedVehicle && selectedState) {
            console.log(`Sending ${selectedState} to vehicle ID ${selectedVehicle}`);
            // Example: sendIOXState(selectedVehicle, selectedState);
            // Handle success/failure and update history/error divs as needed
        } else {
            errorDiv.textContent = 'Please select a vehicle and state.';
        }
    });
});
