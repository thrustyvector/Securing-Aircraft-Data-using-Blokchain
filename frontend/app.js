// import contractdetails from '../build/contracts/AircraftMaintenance.json';
// const contractDetails = require('../build/contracts/AircraftMaintenance.json')

document.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // Acccounts now exposed
    } catch (error) {
      console.error("User denied account access or error occurred:", error);
    }
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // No need to ask for account access
  } else {
    console.error(
      "No Ethereum interface injected into browser. Install MetaMask!"
    );
    return;
  }

  // Contract ABI (Artifact)

  const response = await fetch("../build/contracts/AircraftMaintenance.json"); // Update the path if necessary
  const jsonData = await response.json(); // Parses the JSON response into an object

  // Now you can access the data
  console.log(jsonData); // Output: My Contract
  console.log(jsonData.address); // Output: 0x1234abcd5678efgh
  console.log(jsonData.networkId); // Output: 5777
  const contractABI = jsonData.abi;
  const contractAddress = jsonData.networks[5777].address;
  // You can also use the data in your Web3 setup if needed
  // const contractAddress = jsonData.address;
  // const contractABI = ... (your ABI data)

  // Initialize contract instance
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Handle form submission
  const form = document.getElementById("maintenanceForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Collecting form values
    const aircraftName = form.aircraftName.value;
    const engineId = form.engineId.value;

    // Collecting sensor values
    const egt = form.egt.value;
    const cdp = form.cdp.value;
    const oilTemperature = form.oilTemperature.value;
    const oilPressure = form.oilPressure.value;
    const vibration = form.vibration.value;
    const fuelFlow = form.fuelFlow.value;
    const n1Speed = form.n1Speed.value;
    const tit = form.tit.value;

    try {
      // Send transaction to add maintenance record to the smart contract
      const accounts = await web3.eth.getAccounts();

      // Prepare the sensor values as an array
      const sensorValues = [
        egt,
        cdp,
        oilTemperature,
        oilPressure,
        vibration,
        fuelFlow,
        n1Speed,
        tit,
      ];

      // Send the data to the contract
      let result = await contract.methods
        .addMaintenanceRecord(aircraftName, engineId, sensorValues)
        .send({ from: accounts[0] });

      console.log(
        `Transaction hash for the added block: ${result.transactionHash}`
      );

      // Display success message
      document.getElementById(
        "result"
      ).innerHTML = `<p>Successfully added maintenance record for ${aircraftName}</p>`;

      // Clear form fields
      form.reset();
    } catch (error) {
      console.error("Error adding maintenance record:", error);
      document.getElementById(
        "result"
      ).innerHTML = `<p>Error adding maintenance record: ${error.message}</p>`;
    }
  });

  // Function to fetch all maintenance records for an aircraft
  async function getAllMaintenanceRecords(aircraftId) {
    try {
      const aircraftCount = await contract.methods.recordId().call(); // Assuming recordId increments for each maintenance record
      console.log(`Total Aircraft Count: ${aircraftCount}`);
      const records = [];
      for (let i = 1; i <= aircraftCount; i++) {
        const record = await contract.methods.getMaintenanceRecords(i).call();
        records.push(record);
        console.log(`Maintenance Records for Aircraft ID ${i}:`);
        record.forEach((r) => {
          console.log("Aircraft Name:", r.aircraftName);
          console.log("Engine ID:", r.engineId);
          console.log("Sensor Values:", r.sensorValues);
          // Logging each sensor value for clarity
          console.log("EGT:", r.sensorValues[0]);
          console.log("CDP:", r.sensorValues[1]);
          console.log("Oil Temperature:", r.sensorValues[2]);
          console.log("Oil Pressure:", r.sensorValues[3]);
          console.log("Vibration:", r.sensorValues[4]);
          console.log("Fuel Flow:", r.sensorValues[5]);
          console.log("N1 Speed:", r.sensorValues[6]);
          console.log("TIT:", r.sensorValues[7]);
          console.log("----------------------");
        });
      }
      return records;
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      return [];
    }
  }

  // Function to display maintenance records on the web page
  async function displayMaintenanceRecords() {
    const aircraftId = 1; // Replace with the ID of the aircraft you want to display records for
    const records = await getAllMaintenanceRecords(aircraftId);

    const recordsContainer = document.getElementById("maintenance-records");
    recordsContainer.innerHTML = ""; // Clear previous records
    let count = 0;
    records.forEach((record) => {
      record.forEach((r) => {
        count++;
        const name = r.aircraftName;
        const engineId = r.engineId;
        const sensorValues = r.sensorValues;

        // Extract individual sensor values from the array
        const egt = sensorValues[0];
        const cdp = sensorValues[1];
        const oilTemperature = sensorValues[2];
        const oilPressure = sensorValues[3];
        const vibration = sensorValues[4];
        const fuelFlow = sensorValues[5];
        const n1Speed = sensorValues[6];
        const tit = sensorValues[7];

        const recordElement = document.createElement("div");
        recordElement.innerHTML = `
              <br><p><strong>Maintenance Record #${count}</strong></p><br>
              <p><strong>Aircraft Name:</strong> ${name}</p><br>
              <p><strong>Engine ID:</strong> ${engineId}</p><br>
              <p><strong>EGT (°C):</strong> ${egt}</p><br>
              <p><strong>CDP (psi):</strong> ${cdp}</p><br>
              <p><strong>Oil Temperature (°C):</strong> ${oilTemperature}</p><br>
              <p><strong>Oil Pressure (psi):</strong> ${oilPressure}</p><br>
              <p><strong>Vibration (mm/s):</strong> ${vibration}</p><br>
              <p><strong>Fuel Flow (L/hr):</strong> ${fuelFlow}</p><br>
              <p><strong>N1 Speed (RPM):</strong> ${n1Speed}</p><br>
              <p><strong>TIT (°C):</strong> ${tit}</p><br>
              <hr>
          `;
        recordsContainer.appendChild(recordElement);
      });
    });
  }

  // Add event listener to the button
  const fetchRecordsButton = document.getElementById("fetch-records-button");
  fetchRecordsButton.addEventListener("click", () => {
    displayMaintenanceRecords();
  });
});
