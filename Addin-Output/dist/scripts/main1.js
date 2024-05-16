"use strict";

// Define the Geotab addin namespace and function
geotab.addin.ioxOutput = function () {
  // Declare variables
  var api,
    container,
    vehiclesSelect,
    sendButton,
    historyContainer,
    errorContainer,
    stateSelect;

  // Function to display messages
  var displayMessage = function (message) {
    errorContainer.innerHTML = message;
  };

  // Function to send a message to a device
  var sendMessage = function () {
    var deviceId = vehiclesSelect.value;
    var state = stateSelect.options[stateSelect.selectedIndex].text;

    api.call("Add", {
      typeName: "TextMessage",
      entity: {
        device: { id: deviceId },
        messageContent: {
          isRelayOn: state === "On",
          contentType: "IoxOutput"
        },
        isDirectionToVehicle: true
      }
    }, function (result) {
      if (result.id) {
        displayMessage("Message sent successfully.");
        updateHistory(result.id);
      } else {
        displayMessage("Failed to send message.");
      }
    }, displayMessage);
  };

  // Function to update message history
  var updateHistory = function (messageId) {
    var messageIdWithTimestamp = messageId + "-" + Date.now();
    var messageHeader = document.createElement("h4");
    var messageHeaderText = document.createTextNode("Sent: " + new Date());
    messageHeader.setAttribute("id", messageIdWithTimestamp);
    messageHeader.appendChild(messageHeaderText);
    historyContainer.appendChild(messageHeader);

    // Function to check delivery status periodically
    (function checkDeliveryStatus(messageIdWithTimestamp) {
      setTimeout(function () {
        api.call("Get", {
          typeName: "TextMessage",
          search: { id: messageIdWithTimestamp.split("-")[0] }
        }, function (result) {
          if (result[0].delivered) {
            document.getElementById(messageIdWithTimestamp).innerHTML += ", Delivered: " + new Date(result[0].delivered);
          } else {
            checkDeliveryStatus(messageIdWithTimestamp);
          }
        }, displayMessage);
      }, 1000);
    })(messageIdWithTimestamp);
  };

  // Function to sort devices alphabetically
  var sortDevices = function (a, b) {
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    return nameA === nameB ? 0 : nameB < nameA ? 1 : -1;
  };

  // Return public methods
  return {
    initialize: function (apiRef, config, state) {
      api = apiRef;
      container = document.getElementById("ioxOutput");
      vehiclesSelect = document.getElementById("ioxoutput-vehicles");
      sendButton = document.getElementById("ioxoutput-send");
      historyContainer = document.getElementById("ioxoutput-history");
      errorContainer = document.getElementById("ioxoutput-error");
      stateSelect = document.getElementById("ioxoutput-state");

      // Enable send button when a vehicle is selected
      vehiclesSelect.addEventListener("change", function () {
        sendButton.disabled = false;
      });

      // Send message on button click
      sendButton.addEventListener("click", sendMessage);

      state();

    },
    focus: function (apiRef, state) {
      api = apiRef;
      api.call("Get", {
        typeName: "Device",
        resultsLimit: 1000,
        search: {
          fromDate: new Date().toISOString(),
          groups: state.getGroupFilter()
        }
      }, function (devices) {
        // Clear existing options in the vehicles select
        while (vehiclesSelect.options.length > 0) {
          vehiclesSelect.remove(0);
        }

        if (devices && devices.length > 0) {
          // Sort devices alphabetically
          devices.sort(sortDevices);

          // Populate vehicles select with devices
          devices.forEach(function (device) {
            var option = new Option();
            option.text = device.name;
            option.value = device.id;
            vehiclesSelect.add(option);
          });

          // Show container if devices are available
          container.style.display = "";
        }
      }, displayMessage);
    },
    blur: function () {
      sendButton.disabled = true;
      container.style.display = "none";
    }
  };
};
